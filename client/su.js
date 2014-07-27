

Template.su.created = function(){

	Session.set("suMode", "designElements");	
	Session.set('currentFilter', Meteor.user().username);
	Session.set('pointerFilter', Meteor.user().username);

}

Template.su.events({

	'click #logout':function(e){
		Meteor.logout();
		Session.set("loginMode", 0);
		e.preventDefault();
	},

	'click .suOption':function(e){
		e.preventDefault();
	},

	'click #suNav > li':function(e){

		var id = e.currentTarget.id;
		$('#suNav > li').removeClass("active");
		$(e.currentTarget).addClass("active");
		
		Session.set("suMode", id);

		e.preventDefault();
	},

	'click .filterOption':function(e){

		Session.set('currentFilter', e.currentTarget.id);
		if(Session.get('suMode') == "designLevel"){
			selectALevel();
			updateCurrentLevel();
			updateCurrentView();
		}
	},

	'click #reload':function(e){

		Session.set('currentElement', undefined);
		Session.set('currentLevel', undefined);
		window.location.reload(true);

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

Template.manageSus.events({

	'click .demoteP':function(e){
		Meteor.users.update(this._id, {$set: {'profile.role': 'designer'}});
		e.preventDefault();
	},

	'click .resetP':function(e){
		Meteor.call('resetUserPassword' ,Meteor.user()._id, this._id);
		e.preventDefault();
	}

});


Template.manageSus.susers = function(){
	return Meteor.users.find({'profile.role': 'admin'});
}

Template.manageSus.email = function(){
	if(typeof this.emails !== "undefined"){
		return this.emails[0].address;
	}else{
		return "none";
	}
}




Template.manageDesigners.events({


	'click .demoteP':function(e){
		Meteor.users.update(this._id, {$set: {'profile.role': 'player'}});
		e.preventDefault();
	},

	'click .promoteP':function(e){
		Meteor.users.update(this._id, {$set: {'profile.role': 'admin'}});
		e.preventDefault();
	},

	'click .resetP':function(e){
		Meteor.call('resetUserPassword', Meteor.user()._id, this._id);
		e.preventDefault();
	}


});

Template.manageDesigners.designers = function(){
	return Meteor.users.find({'profile.role': 'designer'});
}

Template.manageDesigners.email = function(){
	if(typeof this.emails !== "undefined"){
		return this.emails[0].address;
	}else{
		return "none";
	}
}


Template.managePlayers.created = function(){

	Session.set('registeredOnly', false);

}

Template.managePlayers.registeredOnly = function(){ return (Session.get('registeredOnly'))? 'checked' : ''}


Template.managePlayers.players = function(){

	if(!Session.get('registeredOnly')){
		return Meteor.users.find({'profile.role': 'player'});
	}else{
		return Meteor.users.find({'profile.role': 'player', 'profile.registered': true});
	}
}

Template.managePlayers.email = function(){

	if(typeof this.emails !== "undefined"){
		return this.emails[0].address;
	}else{
		return "none";
	}
}

Template.managePlayers.events({


	'click .removeP':function(e){
		Meteor.users.remove(this._id);
		e.preventDefault();
	},


	'click .promoteP':function(e){
		Meteor.users.update(this._id, {$set: {'profile.role': 'designer'}});
		e.preventDefault();
	},

	'click .resetP':function(e){
		Meteor.call('resetUserPassword' ,Meteor.user()._id, this._id);
		e.preventDefault();
	},

	'click #regToggle':function(e){

		Session.set('registeredOnly', !Session.get('registeredOnly'));

	}

});





