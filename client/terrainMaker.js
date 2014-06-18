/*------------------------------------TERRAIN MAKER---------------------------------------------*/

UI.registerHelper('myTerrains', function(){return DesignerGameDefs.find({type: "terrain", creator: Meteor.user()._id}).fetch()});
UI.registerHelper('terrains', function(){return DesignerGameDefs.find({type: "terrain"}).fetch()});

Template.terrainMaker.created = function(){

  var ct = DesignerGameDefs.findOne({type: "terrain", creator: "server"});

  Session.set("currentTerrain", ct);

  Meteor.defer(function(){

  	$('#' + ct.name + ' > td').addClass('selected');
  	$('#' + ct.name).addClass('selected');
	$('#colPicker').colorpicker();
	$('#' + ct._id + ' > td').addClass('selected');
	$('#' + ct._id ).addClass('selected');
	disableAdjustables();

  });


}



Template.terrainMaker.events({

	'changeColor #colPicker':function(e){

		if(checkClientIsOwner(Meteor.user()._id, Session.get("currentTerrain").creator)){
			DesignerGameDefs.update(Session.get("currentTerrain")._id, {$set: {'color': e.color.toHex()}});
		}

	},

	'blur #terrainName':function(e){



		var name = $('#terrainName').val();
		
		if(!DesignerGameDefs.findOne({type: "terrain", name: name, creator: Meteor.user()._id })){
			
			DesignerGameDefs.update(Session.get("currentTerrain")._id, {$set: {name: name}});

		}else{

			$('#terrainName').val(Session.get("currentTerrain").name);
			alert("An element of this name already exists. Enter a new one.");
		}

		

		e.preventDefault();
	},

	'click #copyTerrain':function(e){

		ct = Session.get("currentTerrain");
		if(ct.creator == Meteor.user()._id){
			ct.name = ct.name + "_" + generateTempId(3);
		}else{
			ct.creator = Meteor.user()._id;
		}

		delete ct['_id'];
		

		DesignerGameDefs.insert(ct, function(err, id){
				if(err){alert(err.reason)}else{
					$('#' + id + ' > td').addClass('selected');
  					$('#' + id).addClass('selected');
  					$('#addTerrain').addClass("disable");
					$('#addTerrain').attr('disabled','disabled');
					Session.set("currentTerrain", DesignerGameDefs.findOne(id));
				}
			} );



		e.preventDefault();
	},

	'click #removeTerrain':function(e){

		if(confirm("are you sure you want to delete " + Session.get("currentTerrain").name + "... " )){	
			
			DesignerGameDefs.remove(Session.get("currentTerrain")._id, function(err){if(err){alert(err.reason)}});
		}
			
		e.preventDefault();
	}



});




Template.terrainMaker.currentTerrain = function(){return DesignerGameDefs.findOne(Session.get("currentTerrain")._id);}
Template.terrainTable.creatorName = function(){return getCreatorName(this.creator)}

Template.terrainTable.events({

	'click .terrainRow':function(e){

		Session.set("currentTerrain", DesignerGameDefs.findOne(e.currentTarget.id));

		$('.terrainRow').removeClass('selected');
		$('.terrainRow > td' ).removeClass('selected');
		$('#' + e.currentTarget.id + ' > td').removeClass('subSelected');
		$('#' + e.currentTarget.id).removeClass('subSelected');
		$('#' + e.currentTarget.id + ' > td').addClass('selected');
		$('#' + e.currentTarget.id).addClass('selected');

		if(checkClientIsOwner(Meteor.user()._id, Session.get("currentTerrain"))){
			enableAdjustables();
		}else{
			disableAdjustables();
		}


	},

	'mouseenter .terrainRow':function(e){

		$('.terrainRow').removeClass('subSelected');
		$('.terrainRow > td' ).removeClass('subSelected');

		if(e.currentTarget.id != Session.get("currentTerrain")._id){
			$('#' + e.currentTarget.id + ' > td').addClass('subSelected');
			$('#' + e.currentTarget.id).addClass('subSelected');
		}
	},

	'mouseleave .terrainRow':function(e){

		$('.terrainRow').removeClass('subSelected');
		$('.terrainRow > td' ).removeClass('subSelected');

	}


});

function disableAdjustables(){

	$('.adjustable').addClass('disable').attr('disabled', 'disabled');


}

function enableAdjustables(){

	$('.adjustable').removeClass('disable').removeAttr('disabled');

}


/*----------------------------------------SOUND CONTROL -------------------------------*/


Template.soundControls.audioFiles = function(type){  

	var folder;

	switch(type){

		case "Background":
		folder =  Session.get("currentTerrain").background.folder;
		break;
		case "Footsteps":
		folder = Session.get("currentTerrain").footsteps.folder;
		break;
		case "Narrator":
		folder =  Session.get("currentTerrain").narrator.folder;
		break;

	}

  	return AudioFiles.find({dt: 'file', parent: folder}).fetch();
 
}

Template.soundControls.audioTypes = function(){return AudioFiles.find({dt: 'type'}).fetch();}

Template.soundControls.audioParam = function(type, item){



	switch(type){

		case "Background":
		return Session.get("currentTerrain").background[item.hash.item];
		break;
		case "Footsteps":
		return Session.get("currentTerrain").footsteps[item.hash.item];
		break;
		case "Narrator":
		return Session.get("currentTerrain").narrator[item.hash.item];
		break;

	}
}

Template.soundControls.events({


	'click .typeOption':function(e){
		


		var terrainObj = Session.get("currentTerrain");

		if($(e.currentTarget).hasClass('Background')){

			DesignerGameDefs.update(Session.get("currentTerrain")._id, 
				{$set: {'background.folder': $(e.currentTarget.id).selector, 'background.audioFile':'none'}});

		}else if($(e.currentTarget).hasClass('Footsteps')){
			DesignerGameDefs.update(Session.get("currentTerrain")._id, 
				{$set: {'footsteps.folder': $(e.currentTarget.id).selector, 'footsteps.audioFile':'none'}});
		}else{
			DesignerGameDefs.update(Session.get("currentTerrain")._id, 
				{$set: {'narrator.folder': $(e.currentTarget.id).selector, 'narrator.audioFile':'none'}});
		}

		

		e.preventDefault();
	},

	'click .fileOption':function(e){


		if($(e.currentTarget).hasClass('Background')){

			DesignerGameDefs.update(Session.get("currentTerrain")._id, 
				{$set: {'background.audioFile': $(e.currentTarget.id).selector}});

		}else if($(e.currentTarget).hasClass('Footsteps')){
			DesignerGameDefs.update(Session.get("currentTerrain")._id, 
				{$set: {'footsteps.audioFile': $(e.currentTarget.id).selector}});
		}else{
			DesignerGameDefs.update(Session.get("currentTerrain")._id, 
				{$set: {'narrator.audioFile': $(e.currentTarget.id).selector}});
		}
		

		e.preventDefault();
	},

	'click .ampBox':function(e){


		if($(e.currentTarget).hasClass('Background')){
			DesignerGameDefs.update(Session.get("currentTerrain")._id, 
				{$set: {'background.amp': parseFloat(e.currentTarget.value)}});
		}else if($(e.currentTarget).hasClass('Footsteps')){
			DesignerGameDefs.update(Session.get("currentTerrain")._id, 
				{$set: {'footsteps.amp': parseFloat(e.currentTarget.value)}});
		}else{
			DesignerGameDefs.update(Session.get("currentTerrain")._id, 
				{$set: {'narrator.amp': parseFloat(e.currentTarget.value)}});
		}
		

		e.preventDefault();

	}


});