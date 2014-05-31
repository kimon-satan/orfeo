
audio = 0;


Meteor.startup(function(){

  Session.set("isLoaded", false);
  Session.set("isAudioInit", false);
  Session.set("isTest2", false);

  audio = new aapiWrapper();

  if(audio.init()){
    Session.set("isAudioInit", true);
    loadAudioFiles();

  }else{
    console.log("init failed");
  }
  

});


UI.registerHelper("isAudioReady", function(){
  return Session.get("isAudioInit") && Session.get("isLoaded");
});

UI.registerHelper("isTest2", function(){
  return Session.get("isTest2");
});

Template.load.isAudioInit = function () {
    return Session.get("isAudioInit");
};

Template.load.isLoaded = function () {
    return Session.get("isLoaded");
};

function loadAudioFiles(){
  
  var files = ["field.mp3", "footstep.mp3"];

  /*for(var item in audioList){

    files.push("sounds/" + audioList[item] + ".mp3");

  }*/

  if(audio.loadSounds(files, function(){

    Session.set("isLoaded" , true);

  }));

}

Template.testSound.events({

  'click a#playOnce':function(e){
    console.log("playOnce");
    audio.playOnce("footstep", {amp: 1}, function(){

      Session.set("isTest2", true);
      
    });
    e.preventDefault();
  },


  'click a#playLoop':function(e){
    console.log("playLoop");
    audio.startLooping("field", 1, 1);
    e.preventDefault();
  },


  'click a#newView':function(e){
    console.log("newView");
    Session.set("isTest2", true);
    e.preventDefault();
  }

});



