
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

      var playerPos = PlayerGameData.findOne({player: Meteor.user()._id, type: "pos"});

      var tp = getElementPointer({type: 'terrain', x: playerPos.x, y: playerPos.y});
      console.log(tp);
      if(tp.length > 0){
        cTerrain = getElement(tp[0]);
      }
      
      audio.startLooping(cTerrain.background.audioFile, cTerrain.background.amp, 1);
      audio.playOnce(cTerrain.narrator.audioFile, {amp: cTerrain.narrator.amp, offset: 2});

      e.preventDefault();
  }

});

/*----------------------------------------------------------------------------------------------*/

Template.navScreen.events({

    'click .step': function(event){
    
        var id = event.target.id;
        if($(event.target).hasClass('disable'))return;

        $(event.target).addClass('active');

        $('.step').not('#' + id).addClass('disable');

        var playerPos = PlayerGameData.findOne({player: Meteor.user()._id, type: "pos"});

        if(id == "north")playerPos.y = Math.max(playerPos.y - 1, 0);
        if(id == "south")playerPos.y = Math.min(playerPos.y + 1, 5 - 1); //these need turning into variables
        if(id == "east")playerPos.x = Math.min(playerPos.x + 1, 5- 1); //these need turning into variables
        if(id == "west")playerPos.x = Math.max(playerPos.x - 1, 0);

        //TODO: routine for hitting edges

        PlayerGameData.update(playerPos._id, {$set: {x: playerPos.x, y: playerPos.y}});
        

        var tp = getElementPointer({type: 'terrain', x: playerPos.x, y: playerPos.y});
        if(tp.length > 0){
          nTerrain = getElement(tp[0]);
        }

        audio.playOnce(cTerrain.footsteps.audioFile, {amp: cTerrain.footsteps.amp}, function(){

          $(event.target).removeClass('active');
          $('.step').not('#' + id).removeClass('disable');

           updateGameCellAudio(cTerrain, nTerrain);
           cTerrain = nTerrain;

        }.bind(this));

        event.preventDefault();

    },  

    'click #where': function(event){

      console.log("where am i ?");
      $(event.target).addClass("active");

        audio.playOnce(cTerrain.narrator.audioFile, {amp: cTerrain.narrator.amp}, function(){

          $(event.target).removeClass('active');

        }.bind(this));

      event.preventDefault();

    }

});


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

updateGameCellAudio = function(cTerrain , nTerrain){

  if(nTerrain.name!= cTerrain.name){

    audio.stopLooping(cTerrain.background.audioFile, 1);
    audio.playOnce(nTerrain.narrator.audioFile, {amp: nTerrain.narrator.amp, offset: 2});
    audio.startLooping(nTerrain.background.audioFile, nTerrain.background.amp, 1);

  }


}





