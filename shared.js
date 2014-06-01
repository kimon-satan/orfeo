////////// Shared code (client and server) //////////

Meteor.users.deny({
	
	update: function(user){return true;},
	insert: function(user){return true;},
	remove: function(user){return true;}	

});


GameData = new Meteor.Collection("gameData");

//NB
//functions need to be declared as anonymous globals in meteor to be available universally





