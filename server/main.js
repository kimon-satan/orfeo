
var fs = Npm.require('fs');

SUsers = new Meteor.Collection("SUsers"); //just holds the inital uadmin

Meteor.startup(function(){

	//repopulate the list of audioFiles
	AudioFiles.remove({});
	var dirs = fs.readdirSync('../client/app/sounds');

	for(var dir in dirs){

		AudioFiles.insert({type: dirs[dir], dt: 'type'});

		(function(){

		var fileList = [];
		var files = fs.readdirSync('../client/app/sounds/' + dirs[dir]);

		for(var i = 0; i < files.length; i++){
			AudioFiles.insert({parent: dirs[dir], filename: files[i], dt: 'file'});
		}

		})();
	}

	//if there is no game map make an initial one
	if(!DesignerGameMaps.findOne({type: 'levelHeader'})){

		var header = createLevelHeader('init', 5 , 5, "server");
		
		DesignerGameMaps.insert(header,function(err, id){
			
			header._id = id;
			var count = 0;
			
			for(var x = 0; x < 5; x++){
				for(var y = 0; y < 5; y++){
					if(count < 10){
						DesignerGameMaps.insert(createMapCell(header ,x,y, count));
						count += 1;
					}else{
						DesignerGameMaps.insert(createMapCell(header ,x,y));
					}
				}
			}
			

		});


	}

	//populate DesignerGameDefs with default objects
	if(!DesignerGameDefs.findOne({type: 'terrain'})){
		

		var daudio = {folder: "none", audioFile: "none", amp: 0.5};
		var terrain = {name: "default", type: "terrain", creator: "server", background: daudio, footsteps: daudio, narrator: daudio};

		DesignerGameDefs.insert(terrain);

	}

	


});



/*-------------------------user collections -----------------------------*/


Meteor.publish('AllPlayers', function(userId){
	if(checkAdmin(userId)){
		this.ready();
		return Meteor.users.find({}); 
	}
});

Meteor.publish('MyAccount', function(userId){
	
	return Meteor.users.find(userId); 
	
});

Meteor.publish('Designers', function(userId){
	if(checkDesigner(userId)){
		this.ready();
		return Meteor.users.find({'profile.role': {$in: ['designer', 'admin']}}); 
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

Meteor.publish("DesignerGameMaps", function(userId){
	if(checkDesigner(userId)){
		this.ready();
		return DesignerGameMaps.find({}); 
	}
});

Meteor.publish("DesignerGameDefs", function(userId){
	if(checkDesigner(userId)){
		this.ready();
		return DesignerGameDefs.find({}); 
	}
});



//will need design collections



Meteor.methods({

	initSu:function(user){

		if(SUsers.find({}).fetch().length == 0){

			SUsers.insert({user: user._id, email: user.emails[0].address});
			Meteor.users.update(user._id, {$set: {profile: {role: 'admin'}}});
			
		}

	},



	initPlayer: function(userId){

		
		var initLevel = GameMapRelease.findOne({type: "levelHeader", isInit: true});
		PlayerGameData.remove({player: userId});
		PlayerGameData.insert({player: userId, type: "pos", x: 0, y: 0});
		PlayerGameData.insert({player: userId, type: "level", id: initLevel._id });


	},

	initAllPlayers: function(userId){

		if(checkAdmin(userId)){

			Meteor.users.find({}).forEach(function(player){

				Meteor.call('initPlayer', player._id);

			});
			
		}
	}



});

Accounts.onCreateUser(function(options ,user){

	Meteor.call("initPlayer", user._id);
	user.profile = {role: 'player'};
	return user;

});


function checkAdmin(userId){

	var user = Meteor.users.findOne(userId);
	if(user.profile.role == "admin"){
		return true;
	}else{
		return false;
	}
	
}

function checkDesigner(userId){

	var user = Meteor.users.findOne(userId);
	if(user.profile.role == "admin" || user.profile.role == "designer"){
		return true;
	}else{
		return false;
	}
	
}