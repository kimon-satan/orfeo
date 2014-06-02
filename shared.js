////////// Shared code (client and server) //////////

var localPath = "~/Code/JavaScript/projects/orfeo/uploads/sounds"

SUsers = new Meteor.Collection("SUsers");
Designers = new Meteor.Collection("Designers");
PlayerGameData = new Meteor.Collection("PlayerGameData"); //game data for individual players


AudioFiles = new FS.Collection("AudioFiles", {
  stores: [new FS.Store.FileSystem("AudioFiles", {path: localPath})]
});
GameMapRelease = new Meteor.Collection("GameMapRelease"); //the final game map
GameDefsRelease = new Meteor.Collection("GameDefsRelease"); //the final game definitions


//access

Meteor.users.deny({
		
	update: function(user){return Meteor.user().profile.role != 'admin';},
	insert: function(user){return Meteor.users.findOne(user).profile.role != 'admin';},
	remove: function(user){return Meteor.user().profile.role != 'admin';}	

});

AudioFiles.allow({

	update: function(user){if(Meteor.users.findOne(user).profile.role == 'admin')return true;},
	insert: function(user){if(Meteor.users.findOne(user).profile.role == 'admin')return true;}, 
	remove: function(user){if(Meteor.users.findOne(user).profile.role == 'admin')return true;}	

});

GameMapRelease.deny({

	update: function(user){return Meteor.user().profile.role != 'admin';},
	insert: function(user){return Meteor.user().profile.role != 'admin';}, 
	remove: function(user){return Meteor.user().profile.role != 'admin';}	
});

GameDefsRelease.deny({

	update: function(user){return Meteor.user().profile.role != 'admin';},
	insert: function(user){return Meteor.user().profile.role != 'admin';}, 
	remove: function(user){return Meteor.user().profile.role != 'admin';}	
});




//there will also be sandbox collections not implemented yet

/* Workflow ....


Edit a sandbox ... admin can select any sandbox and integrate into the release version 
NB. Connecting of levels still needs to be worked out but this is a job for admin only

Any designer can make a copy of any level/release or sandbox and start working on it

Designers can only edit/delete levels which they have copied or created
Admins can edit and delete any level


*/



//NB
//functions need to be declared as anonymous globals in meteor to be available universally





