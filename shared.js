////////// Shared code (client and server) //////////

PlayerGameData = new Meteor.Collection("PlayerGameData"); //game data for individual players

AudioFiles = new Meteor.Collection("AudioFiles");

DesignerGameMaps = new Meteor.Collection("DesignerGameMaps"); //prototypes game map
DesignerGameDefs = new Meteor.Collection("DesignerGameDefs"); //prototypes game defs

GameMapRelease = new Meteor.Collection("GameMapRelease"); //the final game map
GameDefsRelease = new Meteor.Collection("GameDefsRelease"); //the final game definitions


//access

Meteor.users.allow({
		
	update: adminTest,
	insert: adminTest,
	remove: adminTest

});

Meteor.users.deny({
		
	update: function(user){return !adminTest(user);},
	insert: function(user){return !adminTest(user);},
	remove: function(user){return !adminTest(user);}	

});

PlayerGameData.allow({

	update: accessTest

});

GameDefsRelease.allow({

	update: adminTest,
	insert: adminTest,
	remove: adminTest
});

GameMapRelease.allow({

	update: adminTest,
	insert: adminTest,
	remove: adminTest
});

DesignerGameDefs.allow({

	update: designerTest,
	insert: designerTest,
	remove: designerTest
});

DesignerGameMaps.allow({

	update: designerTest,
	insert: designerTest,
	remove: designerTest
});


function accessTest (user , doc){
	if(Meteor.users.findOne(user).profile.role == 'admin' || 
		user == doc.player){
		return true;
	}else{
		return false;
	}
}

function designerTest(user , doc){

	var role = Meteor.users.findOne(user).profile.role;

	if(role == 'admin'){
		return true;
	}else if(role == 'designer'){
		return (doc.creator == user);
	}else{
		return false;
	}
}

function adminTest(user){

	var role = Meteor.users.findOne(user).profile.role;
	
	if(role == 'admin'){
		return true;
	}else{
		return false;
	}
}



createMapCell = function(levelHeader, x, y, ep){
	
	if(typeof ep === 'undefined' )ep = 'none';
	
	//will need to add sections for i/o elements

	var cell = {
		type: 'cell', 
		creator: levelHeader.creator,
		level: levelHeader.level,
		levelId: levelHeader._id ,
		x: parseInt(x), y: parseInt(y), 
		terrain: 'none',
		entryPoint: ep,
		exitPoint: 'none', 
		objects:[], 
		n_override: "none", 
		n_additions: [],
		audibleTraces: []
	};

	return cell;
}

createLevelHeader = function(level, width, height, creator){

	var header = {
		type: 'levelHeader',
		level: level,
		creator: creator,
		width: width,
		height: height,
		terrainKey: [],
	}

	return header;
}







