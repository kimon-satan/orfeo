
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
  Session.set("loginError", "");
  Session.set("isPriv", false);


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

      if(validateEmail(email)){
        Meteor.loginWithPassword(email, "1234", function(error){

          if(!error){
            Session.set("screenMode", 1);
          }else if(error.reason == "Incorrect password"){
            Session.set("isPriv", true);
            console.log("priv user");
          }else{
            console.log(error.reason);
          }

        });
      }else{

        Session.set("loginError", "Please enter a valid email addresss.");

      }


    }else if(Session.get("signUp")){
      var email = $('#inputEmail').val();

      if(validateEmail(email)){ //might need more validation here (check what bootstrap does)
        Accounts.createUser({email: email, password: "1234"}, function(error){

          if(!error){
            Session.set("screenMode", 1);
          }else{
            Session.set("loginError", error.reason);
          }

        });

      }else{

        Session.set("loginError", "Please enter a valid email addresss.");

      }
      

    }else{
      var uId = generateTempId(10);
      Accounts.createUser({username: uId, password: "1234"});
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
Template.startSplash.loginError = function(){ return Session.get("loginError");}
Template.signInForm.priv = function(){return Session.get("isPriv");}

Template.signInForm.events({

  'click':function(e){e.preventDefault();},

  'keypress':function(e){
    //catch the return
    if(e.keyCode == 13){
      e.preventDefault();
    }
  }

});


Template.signUpForm.events({

  'click':function(e){e.preventDefault();},

  'keypress':function(e){
    //catch the return
    if(e.keyCode == 13){
      e.preventDefault();
    }
  }

});



function generateTempId(n){

  var chars = "abcdefghijklmnnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@£$%^&*()-=_+";  
  var count = 0;
  var str;
  var idx;

  while(count < n){

    idx = Math.random() * (chars.length - 1);
    str += chars[idx];
    count++;
  }

  return str;

}

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}; 













