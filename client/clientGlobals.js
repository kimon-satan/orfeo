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
		var ce = DesignerGameDefs.findOne(Session.get("currentElement")._id);
		if(ce)return ce;
	}
});



UI.registerHelper('elements', function(eType, addNone){

	var elems = DesignerGameDefs.find({type: eType}).fetch();

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
UI.registerHelper('isRegistered' , function(){return Meteor.user().emails !== undefined});

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
		Session.set("currentLevel", DesignerGameMaps.findOne(Session.get("currentLevel")._id));

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

	if(!Session.get("currentLevel")){

		Session.set("currentLevel",  DesignerGameMaps.findOne({type: 'levelHeader', creator: Meteor.user()._id}));

		if(!Session.get("currentLevel")){
			Session.set("currentLevel", DesignerGameMaps.findOne({type: 'levelHeader', creator: "server"}));
		}

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

  if(checkClientIsDesigner()){
    return DesignerGameMaps.findOne({levelId: Session.get("currentLevel")._id, entryPoint: n});
  }else{
    return GameMapRelease.findOne({levelId: Session.get("currentLevel")._id, entryPoint: n});
  }


}

getCell = function(x,y){

  if(checkClientIsDesigner()){

    var newCell = DesignerGameMaps.findOne({
      type: 'cell', 
      levelId: Session.get("currentLevel")._id, 
      x: parseInt(x), y: parseInt(y)

    });

  }else{

    var level = PlayerGameData.findOne({player: Meteor.user()._id, type: "level"});    
    var newCell = GameMapRelease.findOne({type: 'cell', levelId: level.id , x: x, y: y});
  }

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





