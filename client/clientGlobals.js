UI.registerHelper("isAdmin", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'admin');

});

UI.registerHelper("isDesigner", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'designer');

});

UI.registerHelper("isSu", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'admin' || Meteor.user().profile.role == 'designer');

});

UI.registerHelper('myTerrains', function(){return DesignerGameDefs.find({type: "terrain", creator: Meteor.user()._id}).fetch()});
UI.registerHelper('terrains', function(){return DesignerGameDefs.find({type: "terrain"}).fetch()});
UI.registerHelper('levels', function(){return DesignerGameMaps.find({type: 'levelHeader'}).fetch()});
UI.registerHelper('creatorName', function(){return getCreatorName(this.creator)});



//NB
//functions need to be declared as anonymous globals in meteor to be available universally



getCreatorName = function(id){

	var u = Meteor.users.findOne(id);
	var un =  (u) ? u.username : id;
	return un;
}


checkClientIsOwner = function(user , doc){

	var role = Meteor.users.findOne(user).profile.role;

	if(role == 'admin'){
		return true;
	}else if(role == 'designer'){
		return (doc.creator == user);
	}else{
		return false;
	}
}

checkClientIsDesigner = function(){

	var role = Meteor.user().profile.role;

	if(role == 'admin'){
		return true;
	}else if(role == 'designer'){
		return true;
	}
}

checkForDependencies = function (doc){

	var depend = DesignerGameMaps.findOne({creator: doc.creator, type: 'cell', terrain: doc._id});
	
	if(!depend){
		return false;
	}else{
		return depend.level;
	}

}

disableAdjustables = function (){

	$('.adjustable').addClass('disable').attr('disabled', 'disabled');


}

enableAdjustables = function (){

	$('.adjustable').removeClass('disable').removeAttr('disabled');

}


getRandomColor = function() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

updateCurrentLevel = function (){
	if(Session.get("currentLevel")){
		Session.set("currentLevel", DesignerGameMaps.findOne(Session.get("currentLevel")._id));
	}
}

selectALevel = function(){

	updateCurrentLevel();

	if(!Session.get("currentLevel")){



		Session.set("currentLevel",  DesignerGameMaps.findOne({type: 'levelHeader', creator: Meteor.user()._id}));

		if(!Session.get("currentLevel")){
			Session.set("currentLevel", DesignerGameMaps.findOne({type: 'levelHeader', creator: "server"}));
		}

	}	

	$('#' + Session.get("currentLevel")._id + ' > td').addClass('selected');
  	$('#' + Session.get("currentLevel")._id).addClass('selected');

  	if(checkClientIsOwner(Meteor.user()._id, Session.get("currentLevel"))){
		enableAdjustables();
	}else{
		disableAdjustables();
	}


}