UI.registerHelper("isAdmin", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'admin');

});

UI.registerHelper("isDesigner", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'designer');

});

UI.registerHelper("isSu", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'admin' || Meteor.user().profile.role == 'designer');

});


UI.registerHelper('currentElement' , function(){
	if(Session.get("currentElement")){
		return DesignerGameDefs.findOne(Session.get("currentElement")._id);
	}
});

UI.registerHelper('myTerrains', function(){return DesignerGameDefs.find({type: "terrain", creator: Meteor.user()._id}).fetch()});
UI.registerHelper('terrains', function(){return DesignerGameDefs.find({type: "terrain"}).fetch()});

UI.registerHelper('elements', function(eType){return DesignerGameDefs.find({type: eType}).fetch()});
UI.registerHelper('myElements', function(eType){return DesignerGameDefs.find({type: eType,  creator: Meteor.user()._id}).fetch()});

UI.registerHelper('levels', function(){return DesignerGameMaps.find({type: 'levelHeader'}).fetch()});
UI.registerHelper('creatorName', function(){return getCreatorName(this.creator)});


UI.registerHelper('currentFeatureType' , function(){return Session.get("currentFeatureType")});

UI.registerHelper('features', function(){return ["terrain", "entryPoint", "exitPoint", "wall", "pickupable", "keyhole", "soundField"];});

UI.registerHelper('isTerrain' , function(){return Session.get("currentFeatureType") == "terrain"});
UI.registerHelper('isEntryPoint' , function(){return Session.get("currentFeatureType") == "entryPoint"});
UI.registerHelper('isExitPoint' , function(){return Session.get("currentFeatureType") == "exitPoint"});
UI.registerHelper('isWall' , function(){return Session.get("currentFeatureType") == "wall"});
UI.registerHelper('isPickupable' , function(){return Session.get("currentFeatureType") == "pickupable"});
UI.registerHelper('isKeyhole' , function(){return Session.get("currentFeatureType") == "keyhole"});
UI.registerHelper('isSoundField' , function(){return Session.get("currentFeatureType") == "soundField"});


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

	var depend = DesignerGameMaps.findOne({elemId: doc._id});
	
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

getElementPointer = function(options){
  var ne;

  if(checkClientIsDesigner()){

    ne = DesignerGameMaps.find({
      type: options.type, 
      levelId: Session.get("currentLevel")._id, 
      x: parseInt(options.x), y: parseInt(options.y)
    }).fetch();

  }else{

    var level = PlayerGameData.findOne({player: Meteor.user()._id, type: "level"});    
     ne = GameMapRelease.find({type: options.type, 
                                  levelId: level.id , 
                                  x: parseInt(options.x), 
                                  y: parseInt(options.y)}).fetch();

  }

  return ne;

}

getElement = function(elementPointer){

  var element;

  if(checkClientIsDesigner()){
    element = DesignerGameDefs.findOne(elementPointer.elemId);
  }else{
    element = GameDefsRelease.findOne(elementPointer.elemId);
  }

  return element;
}