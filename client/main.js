
audio = 0;

//these need to become database functions
//playerPos = {x:0, y:0};

/*terrainTypes, terrainMap;
cTerrain;*/


Meteor.startup(function(){

  Session.set("isLoaded", false);
  Session.set("isAudioInit", false);
  Session.set("signIn", false);
  Session.set("signUp", false);
  Session.set("screenMode", 0);


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

UI.registerHelper("navScreen", function(){
  return Session.get("screenMode") == 1;
});


function loadAudioFiles(){
  
  var audioList = ["field", "footstep"];
  var files = [];

  for(var item in audioList){

    files.push("sounds/" + audioList[item] + ".mp3");

  }

  if(audio.loadSounds(files, function(){

    Session.set("isLoaded" , true);

  }));

}

Template.startSplash.events({

  'click #begin':function(e){
    
    if(Session.get("signIn")){
      var email = $('#inputEmail').val();
      console.log(email);
    }else if(Session.get("signUp")){
      var email = $('#inputEmail').val();
      console.log(email);
    }else{
      Session.set("screenMode", 1);
    }

    e.preventDefault();
  },

  'click #signIn':function(e){
    Session.set("signIn", true);
    Session.set("signUp", false);
    console.log("sign in");
    e.preventDefault();
  },

  'click #signUp':function(e){
    Session.set("signUp", true);
    Session.set("signIn", false);
    e.preventDefault();
  }


});

Template.startSplash.signIn = function(){ return Session.get("signIn");}
Template.startSplash.signUp = function(){ return Session.get("signUp");}


Template.signInForm.events({

  'click':function(e){e.preventDefault();},

  'keypress':function(e){
    //catch the return
    if(e.keyCode == 13){
      e.preventDefault();
    }
  }

});

Template.signInForm.priv = function(){ return false; }

Template.signUpForm.events({

  'click':function(e){e.preventDefault();},

  'keypress':function(e){
    //catch the return
    if(e.keyCode == 13){
      e.preventDefault();
    }
  }

});














