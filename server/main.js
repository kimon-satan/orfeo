
var fs = Npm.require('fs');

Meteor.startup(function(){

	//repopulate the list of audioFiles
	AudioFiles.remove({});
	var dirs = fs.readdirSync('../client/app/sounds');
	//console.log(dirs);
	for(var dir in dirs){

		AudioFiles.insert({type: dirs[dir], dt: 'type'});

		(function(){

		var fileList = [];
		var files = fs.readdirSync('../client/app/sounds/' + dirs[dir]);

		//console.log(files);

		for(var i = 0; i < files.length; i++){
			AudioFiles.insert({parent: dirs[dir], filename: files[i], dt: 'file'});
		}

		})();
	}

	//console.log(AudioFiles.find().fetch());

});





/*-------------------------user collections -----------------------------*/

Meteor.publish('SUsers', function(userId){
	if(checkAdmin(userId)){
		return SUsers.find({}); 
	}
});

Meteor.publish('Designers', function(userId){
	if(checkAdmin(userId)){
		return Designers.find({}); 
	}
});

Meteor.publish('AllPlayers', function(userId){
	if(checkAdmin(userId)){
		return Meteor.users.find({}); 
	}
});

Meteor.publish('PlayerGameData', function(userId){
	return PlayerGameData.find({player: userId}); 
});


/*----------------------design collections ---------------------------------*/

Meteor.publish('AudioFiles', function(){
	return AudioFiles.find({}); 
});


Meteor.publish('GameMapRelease', function(){
	return GameMapRelease.find({}); 
});

Meteor.publish('GameDefsRelease', function(){
	return GameDefsRelease.find({}); 
});



Meteor.methods({

	initSu:function(user){

		if(SUsers.find({}).fetch().length == 0){

			SUsers.insert({user: user._id, email: user.emails[0].address});
			Meteor.users.update(user._id, {$set: {profile: {role: 'admin'}}});
			
		}

	},


	makeSu: function(userId){



	},

	removeSu: function(userId){



	},

	makeDesigner: function(userId){



	},

	removeDesigner: function(userId){



	},


	initPlayer: function(userId){

		console.log("init");
		PlayerGameData.insert({player: userId, type: "pos", x: 0, y: 0});
		PlayerGameData.insert({player: userId, level: 0});

	}





});



function checkAdmin(userId){

	if(SUsers.findOne({user: userId})){
		return true;
	}else{
		return false;
	}
	
}

function checkDesigner(userId){

	if(Designers.findOne({user: userId})){
		return true;
	}else{
		return false;
	}
	
}