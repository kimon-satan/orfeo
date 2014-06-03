////////// Shared code (client and server) //////////


SUsers = new Meteor.Collection("SUsers");
Designers = new Meteor.Collection("Designers");
PlayerGameData = new Meteor.Collection("PlayerGameData"); //game data for individual players


AudioFiles = new Meteor.Collection("AudioFiles");


GameMapRelease = new Meteor.Collection("GameMapRelease"); //the final game map
GameDefsRelease = new Meteor.Collection("GameDefsRelease"); //the final game definitions


//access

Meteor.users.deny({
		
	update: function(user){return Meteor.users.findOne(user).profile.role != 'admin' ;},
	insert: function(user){return Meteor.users.findOne(user).profile.role != 'admin' ;},
	remove: function(user){return Meteor.users.findOne(user).profile.role != 'admin' ;}	

});

PlayerGameData.allow({

	update: accessTest

});

GameDefsRelease.allow({

	update: accessTest,
	insert: accessTest,
	remove: accessTest
});

GameMapRelease.allow({

	update: accessTest,
	insert: accessTest,
	remove: accessTest
});

function accessTest (user , doc){
	if(Meteor.users.findOne(user).profile.role == 'admin' || 
		user == doc.player){
		return true;
	}else{
		return false;
	}
}



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

createMapCell = function(level, x, y){

	//will need to add sections for i/o elements

	var cell = {
		type: 'cell', 
		level: level, 
		x: x, y: y, 
		terrain: 'none', 
		objects:[], 
		n_override: "none", 
		n_additions: [],
		audibleTraces: []
	};

	return cell;
}





