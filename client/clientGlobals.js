UI.registerHelper("isAdmin", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'admin');

});

UI.registerHelper("isDesigner", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'designer');

});

UI.registerHelper("isSu", function(){

  if(Meteor.user())return (Meteor.user().profile.role == 'admin' || Meteor.user().profile.role == 'designer');

});

UI.registerHelper( 'isReset', function(){ return Meteor.user().profile.isReset });


UI.registerHelper('currentElement' , function(){


	if(Session.get("currentElement")){
		var ce = DesignerGameDefs.findOne(Session.get("currentElement")._id);
		if(ce)return ce;
	}
});



UI.registerHelper('elements', function(eType, filter, addNone){

	var elems;

	if(filter == 'allDesigners'){
		elems = DesignerGameDefs.find({type: eType}).fetch();
	}else{
		var id = Meteor.users.findOne({username: filter})._id;
		var t_elems = DesignerGameDefs.find({type: eType, creator: id}).fetch();
		var myElems = DesignerGameDefs.find({type: eType, creator: Meteor.user()._id}).fetch();
		var s_elems = DesignerGameDefs.find({type: eType, creator: 'server'}).fetch();
		
		if(Meteor.user().username != filter){
			t_elems = t_elems.concat(myElems);
		}

		elems = t_elems.concat(s_elems);
	}

	if(addNone == 'true'){
		elems.unshift({name: 'none', _id: 'none'});
	}
	
	return elems;

});

UI.registerHelper('myElements', function(eType, addNone){

	var elems = DesignerGameDefs.find({type: eType,  creator: Meteor.user()._id}).fetch();

	if(addNone == 'true'){
		elems.unshift({name: 'none', _id: 'none'});
	}
	
	return elems;
});

UI.registerHelper('designerFilter', function(){
	return Session.get('currentFilter');
});

UI.registerHelper('pointerFilter', function(){
	return Session.get('pointerFilter');
});

UI.registerHelper('designers' , function(){
	var designers = Meteor.users.find({$or: [{'profile.role': 'admin'}, {'profile.role': 'designer'}]}).fetch();
	designers.push({username: 'allDesigners'});
	return designers;
});

UI.registerHelper('levels', function(filter){


	if(filter == 'allDesigners'){
		return DesignerGameMaps.find({type: 'levelHeader'}).fetch();
	}else{
		var levels;
		var id = Meteor.users.findOne({username: filter})._id;
		var t_levels = DesignerGameMaps.find({type: 'levelHeader', creator: id}).fetch();
		var myLevels = DesignerGameMaps.find({type: 'levelHeader', creator: Meteor.user()._id}).fetch();
		var s_levels = DesignerGameMaps.find({type: 'levelHeader', creator: 'server'}).fetch();
		
		if(Meteor.user().username != filter){
			t_levels = t_levels.concat(myLevels);
		}
		levels = t_levels.concat(s_levels);
		return levels;
	}

});

UI.registerHelper('creatorName', function(){return getCreatorName(this.creator)});


UI.registerHelper('currentFeatureType' , function(){return Session.get("currentFeatureType")});

UI.registerHelper('features', function(){return ["terrain", "entryPoint", "exitPoint", "wall", "pickupable", "keyhole", "simpleSound","soundField"];});

UI.registerHelper('isTerrain' , function(){return Session.get("currentFeatureType") == "terrain"});
UI.registerHelper('isEntryPoint' , function(){return Session.get("currentFeatureType") == "entryPoint"});
UI.registerHelper('isExitPoint' , function(){return Session.get("currentFeatureType") == "exitPoint"});
UI.registerHelper('isWall' , function(){return Session.get("currentFeatureType") == "wall"});
UI.registerHelper('isPickupable' , function(){return Session.get("currentFeatureType") == "pickupable"});
UI.registerHelper('isKeyhole' , function(){return Session.get("currentFeatureType") == "keyhole"});
UI.registerHelper('isSimpleSound' , function(){return Session.get("currentFeatureType") == "simpleSound"});
UI.registerHelper('isSoundField' , function(){return Session.get("currentFeatureType") == "soundField"});
UI.registerHelper('isRegistered' , function(){return typeof Meteor.user().emails !== 'undefined'});

UI.registerHelper("isAudioReady", function(){
  return Session.get("isAudioInit") && Session.get("isLoaded");
});

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

	var levelHeaders = DesignerGameMaps.find({type: 'levelHeader', creator: doc.creator}).fetch();

	for(lh in levelHeaders){
		for(item in levelHeaders[lh].mapKey){
			if(levelHeaders[lh].mapKey[item] == doc._id){
				return levelHeaders[lh].level;
			}
		}
	}

	return false;
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

		var id = Session.get("currentLevel")._id;

		$('.levelRow').removeClass('selected');
		$('.levelRow > td' ).removeClass('selected');
		$('#' + id + ' > td').removeClass('subSelected');
		$('#' + id).removeClass('subSelected');
		$('#' + id + ' > td').addClass('selected');
		$('#' + id).addClass('selected');
	}

}

selectALevel = function(){

	var cr = (Session.get('currentFilter') == 'allDesigners') ? 'none' : Meteor.users.findOne({username: Session.get('currentFilter')})._id;

	if(Session.get('currentLevel')){

		if(cr == 'none'){
			updateCurrentLevel();
			return;
		}
		if(Session.get('currentLevel').creator == cr){
			updateCurrentLevel();
			return;
		}
		if(Session.get('currentLevel').creator == Meteor.user()._id){
			updateCurrentLevel();
			return;
		}

	}

	if(cr != 'none')Session.set("currentLevel",  DesignerGameMaps.findOne({type: 'levelHeader', creator: cr}));

	if(!Session.get("currentLevel")){
		Session.set("currentLevel", DesignerGameMaps.findOne({type: 'levelHeader', creator: Meteor.user()._id}));
	}

	if(!Session.get("currentLevel")){
		Session.set("currentLevel", DesignerGameMaps.findOne({type: 'levelHeader', creator: "server"}));
	}

	updateCurrentLevel();

  	if(checkClientIsOwner(Meteor.user()._id, Session.get("currentLevel"))){
		enableAdjustables();
	}else{
		disableAdjustables();
	}

}

getLevel = function(levelId){

    if(checkClientIsDesigner()){
      return DesignerGameMaps.findOne(levelId);
    }else{
      return GameMapRelease.findOne(levelId);
    }

}

getEntryCell = function(n){

	return Session.get("currentLevel").entryPoints[n];

}

getCell = function(x,y){

  var newCell = Session.get('currentLevel').cells[y][x];

  return newCell; 
}

getElement = function(id){

    if(checkClientIsDesigner()){
      return DesignerGameDefs.findOne(id);
    }else{
      return GameDefsRelease.findOne(id);
    }

}

getInventory = function(levelId){

	if(checkClientIsDesigner()){
      return DesignerGameMaps.findOne({type: 'inventory', levelId: levelId});
    }else{
      return GameMapRelease.findOne({type: 'inventory', levelId: levelId});
    }
}

generateTempId  = function(n){

  var chars = "abcdefghijklmnnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!@£$%^&*()-=_+";  
  var count = 0;
  var str = "";
  var idx;

  while(count < n){

    idx = Math.random() * (chars.length - 1);
    str += chars[parseInt(idx)];
    count++;
  }

  return str;

}





