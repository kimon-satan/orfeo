/*------------------------------------TERRAIN MAKER---------------------------------------------*/



Template.terrainMaker.created = function(){

  Meteor.defer(function(){

  	 Meteor.subscribe("AudioFiles",{}, {onReady: function(){
	  	
	  	var ct = DesignerGameDefs.findOne({type: "terrain", creator: "server"});
	  	if(ct)Session.set("currentTerrain", ct);
		  	 
  	 	if(Session.get("currentTerrain")){
  	 		selectTerrain(Session.get("currentTerrain")._id);
  	 	}

		$('#colPicker').colorpicker();

  	 }});

  	 
  	

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
					selectTerrain(id);
				}
			} );



		e.preventDefault();
	},

	'click #removeTerrain':function(e){

		if(confirm("are you sure you want to delete " + Session.get("currentTerrain").name + "... " )){	
			
			var r = checkForDependencies(DesignerGameDefs.findOne(Session.get("currentTerrain")._id));
		
			if(!r){
				DesignerGameDefs.remove(Session.get("currentTerrain")._id, function(err){if(err){alert(err.reason)}});
			}else{
				alert("I can't delete this because of a dependency in " + r + "\nremove the terrain from this level first.")
			}

			selectTerrain(DesignerGameDefs.findOne({creator: 'server'})._id);
		}
			
		e.preventDefault();
	}



});



Template.terrainMaker.currentTerrain = function(){
	if(Session.get("currentTerrain")){
		return DesignerGameDefs.findOne(Session.get("currentTerrain")._id);
	}
}
Template.terrainTable.creatorName = function(){return getCreatorName(this.creator)}






Template.terrainTable.events({

	'click .terrainRow':function(e){

		selectTerrain(e.currentTarget.id);

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

//helper functions

function selectTerrain(id){

	var ct = DesignerGameDefs.findOne(id);
	if(typeof ct  === "undefined")return;
	Session.set("currentTerrain", ct);

	$('.terrainRow').removeClass('selected');
	$('.terrainRow > td' ).removeClass('selected');
	$('#' + id + ' > td').removeClass('subSelected');
	$('#' + id ).removeClass('subSelected');
	$('#' + id + ' > td').addClass('selected');
	$('#' + id).addClass('selected');

	if(checkClientIsOwner(Meteor.user()._id, Session.get("currentTerrain"))){
		enableAdjustables();
	}else{
		disableAdjustables();
	}

}




/*----------------------------------------SOUND CONTROL -------------------------------*/


Template.soundControls.audioFiles = function(type){  

	if(!Session.get("currentTerrain"))return;
	var ct = DesignerGameDefs.findOne(Session.get("currentTerrain")._id);
	if(typeof ct === "undefined")return;
	var folder;

	switch(type){

		case "Background":
		folder =  ct.background.folder;
		break;
		case "Footsteps":
		folder = ct.footsteps.folder;
		break;
		case "Narrator":
		folder =  ct.narrator.folder;
		break;

	}

  	return AudioFiles.find({dt: 'file', parent: folder}).fetch();
 
}

Template.soundControls.audioTypes = function(){return AudioFiles.find({dt: 'type'}).fetch();}

Template.soundControls.audioParam = function(type, item){

	if(!Session.get("currentTerrain"))return;
	var ct = DesignerGameDefs.findOne(Session.get("currentTerrain")._id);
	if(typeof ct === "undefined")return;


	switch(type){

		case "Background":
		return ct.background[item.hash.item];
		break;
		case "Footsteps":
		return ct.footsteps[item.hash.item];
		break;
		case "Narrator":
		return ct.narrator[item.hash.item];
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