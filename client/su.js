

Template.su.created = function(){

	Session.set("suMode", "designElements");	

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

	//TODO reset password


	'click .demoteP':function(e){
		Meteor.users.update(this._id, {$set: {'profile.role': 'player'}});
		e.preventDefault();
	},

	'click .promoteP':function(e){
		Meteor.users.update(this._id, {$set: {'profile.role': 'admin'}});
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

Template.managePlayers.players = function(){
	return Meteor.users.find({'profile.role': 'player'});
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
	}

});





