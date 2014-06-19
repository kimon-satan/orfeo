UI.registerHelper('myTerrains', function(){return DesignerGameDefs.find({type: "terrain", creator: Meteor.user()._id}).fetch()});
UI.registerHelper('terrains', function(){return DesignerGameDefs.find({type: "terrain"}).fetch()});


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