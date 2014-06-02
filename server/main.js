

Meteor.startup(function(){



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