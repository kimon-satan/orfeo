
audio = 0;
cTerrain = 0;


UI.registerHelper("isAudioReady", function(){
  return Session.get("isAudioInit") && Session.get("isLoaded");
});

Template.game.created = function(){

  var id = Meteor.user()._id;

  //console.log(id);

  Meteor.subscribe("PlayerGameData", id, { onReady: function(){

   

     Meteor.subscribe("AudioFiles",{}, {onReady: function(){

      if(!Session.get("isAudioInit"))startAudio();
     }});

  }});

 // console.log("subscribe");

 
}

Template.game.isStartSplash = function(){
  return Session.get("screenMode") == 0;
};

Template.game.isNavScreen = function(){
  return Session.get("screenMode") == 1;
};


Template.game.destroyed = function(){

    audio.killAll();
    Session.set('isAudioInit', false);
    Session.set('screenMode', 0);
}

Template.startSplash.events({

  'click #begin':function(e){

      Session.set("screenMode", 1);

      var level = PlayerGameData.findOne({player: Meteor.user()._id, type: "level"});

      if(checkClientIsDesigner()){
        PlayerGameData.update(level._id, {$set: {level: Session.get('currentLevel')._id}});
      }else{
        Session.set('currentLevel', getLevel(level.id));
      }
      
      var playerPos = PlayerGameData.findOne({player: Meteor.user()._id, type: "pos"});

      var cell = getCell(playerPos.x, playerPos.y);
      cTerrain = getElement(cell.terrain);

      audio.startLooping(cTerrain.background.audioFile, cTerrain.background.amp, 1);
      audio.playOnce(cTerrain.narrator.audioFile, {amp: cTerrain.narrator.amp, offset: 2}, resetButtons);

      e.preventDefault();
  }

});

/*----------------------------------------------------------------------------------------------*/

Template.navScreen.created = function(){

  Meteor.defer(function(){

      $('.step').addClass('disable');
      $('#where').addClass('active');

  });

}

Template.navScreen.events({

    'click .step': function(event){
    
        if($(event.target).hasClass('disable'))return;
        if($(event.target).hasClass('active'))return;
        $(event.target).addClass('active');

         var id = event.target.id;

        $('.toggleBtn').not('#' + id).addClass('disable');


        var playerPos = PlayerGameData.findOne({player: Meteor.user()._id, type: "pos"});

        if(id == "north")playerPos.y = Math.max(playerPos.y - 1, 0);
        if(id == "south")playerPos.y = Math.min(playerPos.y + 1, Session.get('currentLevel').height - 1); //these need turning into variables
        if(id == "east")playerPos.x = Math.min(playerPos.x + 1, Session.get('currentLevel').width - 1); //these need turning into variables
        if(id == "west")playerPos.x = Math.max(playerPos.x - 1, 0);

        //TODO: routine for hitting edges

        var cell = getCell(playerPos.x, playerPos.y);
        var wall;
        var isRebound = false;
        var audioArray = [];

        if(cell.wall != 'none'){

          isRebound = true;
          wall = getElement(cell.wall);

        }

        if(cell.exitPoint != 'none'){

          cell = handleExitPoint(cell.exitPoint);
          playerPos.x = cell.x; playerPos.y = cell.y;

        }

        var inv = PlayerGameData.findOne({player: Meteor.user()._id, type: 'inventory'});
        var lps = inv.pickupables[Session.get("currentLevel")._id];

        if(typeof lps[playerPos.x] !== 'undefined'){
          if(typeof lps[playerPos.x][playerPos.y] !== 'undefined'){

            for(var i = 0; i < lps[playerPos.x][playerPos.y].length; i++){
              (function(){

                var pu = lps[playerPos.x][playerPos.y][i];
                if(pu.state == 'dropped')audioArray.push(pu.narrator);

              })();
            }

          }
        }

        if(typeof wall !== 'undefined'){
          
          nTerrain = cTerrain;
          handleWallAudio(wall, resetButtons);
          
        }else{

          PlayerGameData.update(playerPos._id, {$set: {x: playerPos.x, y: playerPos.y}});
          nTerrain = getElement(cell.terrain);
        
          audio.playOnce(cTerrain.footsteps.audioFile, {amp: cTerrain.footsteps.amp}, function(){

              $(event.target).removeClass('active');
              $(event.target).addClass('disable');

              updateGameCellAudio(cTerrain, nTerrain, function(){

                playAudioSequence(audioArray, resetButtons);

              });

              cTerrain = nTerrain;        

          });

        }

        event.preventDefault();

    },  

    'click #where': function(event){

      if($(event.target).hasClass('active'))return;
      if($(event.target).hasClass('disable'))return;
      $(event.target).addClass("active");
      $('.step').addClass('disable');

      audio.playOnce(cTerrain.narrator.audioFile, {amp: cTerrain.narrator.amp}, resetButtons);

      event.preventDefault();

    }

});

function handleExitPoint(exitPointId){

  var ep = getElement(exitPointId);
  var level = getLevel(ep.exitTo);
  Session.set("currentLevel", level);

  updatePlayerInventory(level._id);

  if(checkClientIsDesigner()){
    updateCurrentLevel();
  }else{
    var cl = PlayerGameData.findOne({player: Meteor.user()._id , type: "level" });
    PlayerGameData.update(cl._id, {$set: {id: level._id}});
  }
  
  var ep_i = getEntryCell(ep.entryIndex);

  return getCell(ep_i.x, ep_i.y);

}




function resetButtons(){

  $('.active').removeClass('active');
  $('.disable').removeClass('disable');

}


playAudioSequence = function(audioObjs, finalCallback){

  if(audioObjs.length > 0){
    var ao = audioObjs.shift();
    audio.playOnce(ao.audioFile, {amp: ao.amp}, function(){
      playAudioSequence(audioObjs, finalCallback);
    });
  }else{
    finalCallback();
  }

}

updateGameCellAudio = function(cTerrain , nTerrain, callback){

  if(nTerrain.name!= cTerrain.name){

    $('#where').addClass('active');
    audio.stopLooping(cTerrain.background.audioFile, 1);
    audio.playOnce(nTerrain.narrator.audioFile, {amp: nTerrain.narrator.amp, offset: 2}, callback);
    audio.startLooping(nTerrain.background.audioFile, nTerrain.background.amp, 1);

  }else{

    callback();

  }

}

function updatePlayerInventory (levelId){

  //add this levels inventory to the players inventory
  //only if it's a new level

  var inv = PlayerGameData.findOne({player: Meteor.user()._id, type: 'inventory'});
  if(typeof inv.pickupables[levelId] === 'undefined'){
    inv.pickupables[levelId] = getInventory(levelId).pickupables; 
    PlayerGameData.update(inv._id, {$set: {pickupables: inv.pickupables}});
  }

}

function handleWallAudio(wall, callback){

    //TODO add a boolean to be triggered only when all audio is finished

    if(wall.hit.audioFile != 'none'){

      audio.playOnce(wall.hit.audioFile, {amp: wall.hit.amp}, function(){

        if(wall.narrator.audioFile != 'none'){
          audio.playOnce(wall.narrator.audioFile, {amp: wall.narrator.amp}, callback);  
        }else{
          callback();
        }

      });  

    }else if(wall.narrator.audioFile != 'none'){

        audio.playOnce(wall.narrator.audioFile, {amp: wall.narrator.amp}, callback);      
    }

}

function startAudio (){
 
  audio = new aapiWrapper();

  if(audio.init()){
    Session.set("isAudioInit", true);
    loadAudioFiles(); 
  

  }else{
    console.log("init failed");
  }

}

function loadAudioFiles(){

  var files = AudioFiles.find({dt: 'file'}).fetch();

  //console.log(files);

  audio.loadSounds( files , function(){

    Session.set("isLoaded" , true);
    Session.set("screenMode", 0);

  });

}













