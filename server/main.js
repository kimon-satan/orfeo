SUsers = new Meteor.Collection("SUsers");
Designers = new Meteor.Collection("Designers");

Meteor.startup(function(){



});


Meteor.publish('allPlayers', function(userId){

	if(checkAuth(userId)){
		return Meteor.users.find({}); 
	}

});


Meteor.publish('gameData', function(userId){

	return GameData.find({player: user._id}); 

});


Meteor.methods({

	initSu:function(user){

		if(SUsers.find({}).fetch().length == 0){

			SUsers.insert({user: user._id, email: user.emails[0].address});
			Accounts.setPassword(user._id, "asdfg");
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

	addEmail:function(userId){

		

	}


});



function checkAuth(userId){

	if(SuUsers.findOne({user: userId})){
		return true;
	}else{
		return false;
	}
	
}