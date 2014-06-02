UI.registerHelper("isAdmin", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'admin');

});

UI.registerHelper("isDesigner", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'designer');

});

Template.su.created = function(){

	Session.set("suMode", 0);

}

Template.su.isManageSus = function(){return Session.get("suMode") == 0;}


Template.manageSus.susers = function(){
	return Meteor.users.find({'profile.role': 'admin'});
}

Template.manageSus.email = function(){
	return this.emails[0].address;
}
