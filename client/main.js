



Meteor.startup(function(){

  Session.set("isLoaded", false);
  Session.set("isAudioInit", false);
  Session.set("loginMode", 0);
  Session.set("loginError", "");

  if(Meteor.user()){


  }  

});

Deps.autorun(function(){

  if(Meteor.user()){

    var id = Meteor.user()._id;

    if(Meteor.user().profile.role == 'admin'){

      Meteor.subscribe("AllPlayers", id);
      Meteor.subscribe("DesignerGameMaps", id);
      Meteor.subscribe("DesignerGameDefs", id);
     

    }else if(Meteor.user().profile.role == 'designer'){

      Meteor.subscribe("Designers", id);
      Meteor.subscribe("DesignerGameMaps", id);
      Meteor.subscribe("DesignerGameDefs", id, function(){

        Session.set("isDDefsReady" , true);

      });
     

    }else{

      Meteor.subscribe("MyAccount", id);

    }

      Meteor.subscribe("PlayerGameData", id);
      Meteor.subscribe("GameMapRelease");
      Meteor.subscribe("GameDefsRelease");
  }

});




Template.hello.isFrontPage = function(){ return (Session.get("loginMode") == 0 ); }
Template.hello.isLogin = function(){ return (Session.get("loginMode") == 1 ) ; }
Template.hello.isRegister = function(){ return (Session.get("loginMode") == 2 ); }

Template.frontPage.events({

  'click #justPlay':function(e){

      var uId = generateTempId(10);
      Accounts.createUser({username: uId, password: "1234"});
      Session.set("screenMode", 0);
      e.preventDefault();
  },

  'click #login':function(e){
    //console.log("login");
    Session.set("loginMode", 1);
    e.preventDefault();
  },

  'click #register':function(e){
    //console.log("register");
    Session.set("loginMode", 2);
    e.preventDefault();
  }


});




Template.login.events({

  'click #resume':function(e){
    
      var email = $('#inputEmail').val();
      var password = $('#inputPassword').val();


      if(validateEmail(email)){
        
        Meteor.loginWithPassword(email, password, function(error){

          if(!error){
            Session.set("screenMode", 0);
          }else{
            Session.set("loginError" , error.reason);
          }

        });

      }else{

        Session.set("loginError", "Please enter a valid email addresss.");

      }

    e.preventDefault();
  }


});

Template.register.events({

  'click #play':function(e){

      var error = "";
      var email = $('#inputEmail').val();
      var uname = $('#inputUn').val();
      var password = $('#inputPassword').val();
      var cPass = $('#confirmPassword').val();

      if(!validateEmail(email)){
        error = "please enter a valid email";
      }else if(uname.length < 5){
        error = "please enter a username which is longer than 5 characters";
      }else if(password.length < 5){
        error = "please enter a password of at least 5 characters";
      }else if(password != cPass){
        error = "your password is typed incorrectly";
      }

      if(error == ""){ //might need more validation here (check what bootstrap does)
        Accounts.createUser({username: uname, email: email, password: password, profile: {role: 'player'}}, function(err){

          if(!err){
            Session.set("screenMode", 0);
          }else{
            Session.set("loginError", err.reason);
          }

        });

      }else{
         Session.set("loginError", error);
      }

      e.preventDefault();

  }
      

});



Template.loginErrors.rendered = function(){

  window.setTimeout(function(){Session.set("loginError", "")}, 3000);

}

Template.loginErrors.loginError = function(){return Session.get("loginError");}


generateTempId  = function(n){

  var chars = "abcdefghijklmnnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@£$%^&*()-=_+";  
  var count = 0;
  var str = "";
  var idx;

  while(count < n){

    idx = Math.random() * (chars.length - 1);
    str += chars[parseInt(idx)];
    count++;
  }

  return str;

}

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}; 












