SUsers = new Meteor.Collection("SUsers");

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

	initSu:function(userId){

		if(SUsers.find({}).fetch().length == 0){

			SUsers.insert({user: userId});
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

function checkAuth(userId){

	if(SuUsers.findOne({user: userId})){
		return true;
	}else{
		return false;
	}
	
}