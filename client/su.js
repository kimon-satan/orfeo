UI.registerHelper("isAdmin", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'admin');

});

UI.registerHelper("isDesigner", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'designer');

});

UI.registerHelper("isSu", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'admin' || Meteor.user().profile.role == 'designer');

});

Template.su.created = function(){

	Session.set("suMode", "playGame");	

}

Template.su.events({

	'click .suOption':function(e){
		e.preventDefault();
	},

	'click #suNav > li':function(e){

		var id = e.currentTarget.id;
		$('#suNav > li').removeClass("active");
		$(e.currentTarget).addClass("active");
		if(id == 'playGame'){

			//FIXME this is causing double playback
			//always start at 0
			var playerPos = PlayerGameData.findOne({player: Meteor.user()._id, type: "pos"});
			PlayerGameData.update(playerPos._id, {$set: {x: 0, y: 0}});
			var newCell = GameMapRelease.findOne({type: 'cell', level:'init', x: 0, y: 0});
      		cTerrain = GameDefsRelease.findOne({type: 'terrain', name: newCell.terrain});
      		audio.startLooping(cTerrain.background.audioFile, 1, 1);
      		audio.playOnce(cTerrain.narrator.audioFile, {amp: 0.75, offset: 2});
		}
		if(id != 'playGame' && Session.get("suMode") == 'playGame')audio.killAll();
		Session.set("suMode", id);

		e.preventDefault();
	}



});

Template.su.isPlay = function(){return Session.get("suMode") == "playGame";}
Template.su.isDesignLevel = function(){return Session.get("suMode") == "designLevel";}
Template.su.isDesignElements = function(){return Session.get("suMode") == "designElements";}
Template.su.isDesignRelease = function(){return Session.get("suMode") == "designRelease";}

Template.su.isManageSus = function(){return Session.get("suMode") == "manageSUsers";}
Template.su.isManageDesigners = function(){return Session.get("suMode") == "manageDesigners";}
Template.su.isManagePlayers = function(){return Session.get("suMode") == "managePlayers";}


//TODO much later fill in all the user manager stuff here .... including adding players as admin/designers & a name search

Template.manageSus.susers = function(){
	return Meteor.users.find({'profile.role': 'admin'});
}

Template.manageSus.email = function(){
	return this.emails[0].address;
}





