



UI.registerHelper("isAudioReady", function(){
  return Session.get("isAudioInit") && Session.get("isLoaded");
});

Template.game.created = function(){

    var id = Meteor.user()._id;

  Meteor.subscribe("PlayerGameData", {id: id}, { onReady: function(){
     Meteor.subscribe("AudioFiles",{}, {onReady: function(){

      if(!Session.get("isAudioInit"))startAudio();
     }});

  }});
 
}

Template.game.isStartSplash = function(){
  return Session.get("screenMode") == 0;
};

Template.game.isNavScreen = function(){
  return Session.get("screenMode") == 1;
};


Template.startSplash.events({

  'click #begin':function(e){

      Session.set("screenMode", 1);
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
        if(id == "south")playerPos.y = Math.min(playerPos.y + 1, terrainMap.ySize - 1);
        if(id == "east")playerPos.x = Math.min(playerPos.x + 1, terrainMap.xSize - 1);
        if(id == "west")playerPos.x = Math.max(playerPos.x - 1, 0);

        //TODO: routine for hitting edges

        PlayerGameData.update(playerPos._id, {$set: {x: playerPos.x, y: playerPos.y}});
            
       /* var newTerrain = terrainTypes[terrainMap.map[playerPos.y][playerPos.x]]; //cols & rows reversed

         console.log(newTerrain);

        audio.playOnce('footstep', {amp: 1}, function(){

          $(this).removeClass('active');
          $('.step').not('#' + id).removeClass('disable');

           if(newTerrain.bgSound != cTerrain.bgSound){

              audio.stopLooping(cTerrain.bgSound, 1);
              cTerrain = newTerrain;
              audio.playOnce(cTerrain.whereSound, {amp: 0.75, offset: 2});
              audio.startLooping(cTerrain.bgSound, 1, 1);

            }else{
              cTerrain = newTerrain;
            }

        }.bind(this));*/

        event.preventDefault();

    },  

    'click #where': function(event){

      console.log("where am i ?");
      $(event.target).addClass("active");

       /* audio.playOnce(cTerrain.whereSound, {amp: 0.75}, function(){

          $(this).removeClass('active');

        }.bind(this));*/

      event.preventDefault();

    }

});

function startAudio(){
 
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

  console.log(files);

  audio.loadSounds( files , function(){

    Session.set("isLoaded" , true);
    Session.set("screenMode", 0);

  });

}