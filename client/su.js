UI.registerHelper("isAdmin", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'admin');

});

UI.registerHelper("isDesigner", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'designer');

});

Template.su.created = function(){

	Session.set("suMode", "playGame");	

}

Template.su.events({

	'click .suOption':function(e){
		e.preventDefault();
	},

	'click li':function(e){

		var id = e.currentTarget.id;
		$('#suNav > li').removeClass("active");
		$(e.currentTarget).addClass("active");
		Session.set("suMode", id);

		e.preventDefault();
	}



});

Template.su.isPlay = function(){return Session.get("suMode") == "playGame";}
Template.su.isDesignLevel = function(){return Session.get("suMode") == "designLevel";}
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





