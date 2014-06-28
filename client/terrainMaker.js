Template.designElements.created = function(){

	Meteor.defer(function(){

		if(typeof Session.get("currentFeatureType") === 'undefined'){
			Session.set("currentFeatureType", "terrain");
		}

		$("#" + Session.get("currentFeatureType")).addClass('active');
		$("#entryPoint").addClass('disabled');

	});

}



Template.designElements.events({

	'click li.makerlink':function(e){

		if(! $('#' + e.currentTarget.id).hasClass('disabled')){
			$('li.makerlink').removeClass('active');
			$(e.currentTarget).addClass('active');
			Session.set("currentFeatureType", e.currentTarget.id);
		}

		e.preventDefault();

	}
})

/*------------------------------------TERRAIN MAKER---------------------------------------------*/



Template.terrainMaker.created = function(){

  Meteor.defer(function(){

  	 Meteor.subscribe("AudioFiles",{}, {onReady: function(){
	  	
	  	var ct = DesignerGameDefs.findOne({type: "terrain", creator: "server"});
	  	if(ct)Session.set("currentElement", ct);
		  	 
  	 	if(Session.get("currentElement")){
  	 		selectElement(Session.get("currentElement")._id);
  	 	}

		$('#colPicker').colorpicker();

  	 }});

  	 
  	

  });


}



Template.terrainMaker.events({

	'changeColor #colPicker':function(e){

		if(checkClientIsOwner(Meteor.user()._id, Session.get("currentElement").creator)){
			DesignerGameDefs.update(Session.get("currentElement")._id, {$set: {'color': e.color.toHex()}});
		}

	},

	'blur #terrainName':function(e){



		var name = $('#terrainName').val();
		
		if(!DesignerGameDefs.findOne({type: "terrain", name: name, creator: Meteor.user()._id })){
			
			DesignerGameDefs.update(Session.get("currentElement")._id, {$set: {name: name}});

		}else{

			$('#terrainName').val(Session.get("currentElement").name);
			alert("An element of this name already exists. Enter a new one.");
		}

		

		e.preventDefault();
	},

	



});



Template.elementTable.creatorName = function(){return getCreatorName(this.creator)}

Template.elementTable.events({

	'click .elementRow':function(e){

		selectElement(e.currentTarget.id);

	},

	'mouseenter .elementRow':function(e){

		$('.elementRow').removeClass('subSelected');
		$('.elementRow > td' ).removeClass('subSelected');

		if(e.currentTarget.id != Session.get("currentElement")._id){
			$('#' + e.currentTarget.id + ' > td').addClass('subSelected');
			$('#' + e.currentTarget.id).addClass('subSelected');
		}
	},

	'mouseleave .elementRow':function(e){

		$('.elementRow').removeClass('subSelected');
		$('.elementRow > td' ).removeClass('subSelected');

	},

	'click #copyElement':function(e){

		ct = Session.get("currentElement");
		if(ct.creator == Meteor.user()._id){
			ct.name = ct.name + "_" + generateTempId(3);
		}else{
			ct.creator = Meteor.user()._id;
		}

		delete ct['_id'];
		

		DesignerGameDefs.insert(ct, function(err, id){
				if(err){alert(err.reason)}else{
					selectElement(id);
				}
			} );



		e.preventDefault();
	},

	'click #removeElement':function(e){

		if(confirm("are you sure you want to delete " + Session.get("currentElement").name + "... " )){	
			
			var r = checkForDependencies(DesignerGameDefs.findOne(Session.get("currentElement")._id));
		
			if(!r){
				DesignerGameDefs.remove(Session.get("currentElement")._id, function(err){if(err){alert(err.reason)}});
			}else{
				alert("I can't delete this because of a dependency in " + r + "\nremove the terrain from this level first.")
			}

			selectElement(DesignerGameDefs.findOne({creator: 'server'})._id);
		}
			
		e.preventDefault();
	}


});





//helper functions

function selectElement(id){

	var ce = DesignerGameDefs.findOne(id);
	if(typeof ce  === "undefined")return;
	Session.set("currentElement", ce);

	$('.elementRow').removeClass('selected');
	$('.elementRow > td' ).removeClass('selected');
	$('#' + id + ' > td').removeClass('subSelected');
	$('#' + id ).removeClass('subSelected');
	$('#' + id + ' > td').addClass('selected');
	$('#' + id).addClass('selected');

	if(checkClientIsOwner(Meteor.user()._id, Session.get("currentElement"))){
		enableAdjustables();
	}else{
		disableAdjustables();
	}

}




/*----------------------------------------SOUND CONTROL -------------------------------*/


Template.soundControls.audioFiles = function(type){  

	if(!Session.get("currentElement"))return;
	var ct = DesignerGameDefs.findOne(Session.get("currentElement")._id);
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

	if(!Session.get("currentElement"))return;
	var ct = DesignerGameDefs.findOne(Session.get("currentElement")._id);
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
		


		var terrainObj = Session.get("currentElement");

		if($(e.currentTarget).hasClass('Background')){

			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'background.folder': $(e.currentTarget.id).selector, 'background.audioFile':'none'}});

		}else if($(e.currentTarget).hasClass('Footsteps')){

			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'footsteps.folder': $(e.currentTarget.id).selector, 'footsteps.audioFile':'none'}});
		}else{
			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'narrator.folder': $(e.currentTarget.id).selector, 'narrator.audioFile':'none'}});
		}

		e.preventDefault();
	},

	'click .fileOption':function(e){


		if($(e.currentTarget).hasClass('Background')){

			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'background.audioFile': $(e.currentTarget.id).selector}});

		}else if($(e.currentTarget).hasClass('Footsteps')){
			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'footsteps.audioFile': $(e.currentTarget.id).selector}});
		}else{
			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'narrator.audioFile': $(e.currentTarget.id).selector}});
		}
		

		e.preventDefault();
	},

	'click .ampBox':function(e){


		if($(e.currentTarget).hasClass('Background')){
			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'background.amp': parseFloat(e.currentTarget.value)}});
		}else if($(e.currentTarget).hasClass('Footsteps')){
			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'footsteps.amp': parseFloat(e.currentTarget.value)}});
		}else{
			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'narrator.amp': parseFloat(e.currentTarget.value)}});
		}
		

		e.preventDefault();

	}


});


Template.exitPointMaker.created = function(){


}

Template.exitPointMaker.exitTo = function(){
	var header = DesignerGameMaps.findOne(Session.get("currentElement").exitTo);

	if(header){
		return header.level;
	}
}

Template.exitPointMaker.events({

	
	'click .levelRow':function(e){


		console.log(e.currentTarget.id);
		var ce = Session.get("currentElement");
		var cl = DesignerGameMaps.findOne(e.currentTarget.id);
		Session.set("currentLevel", cl);
		ce.exitTo = e.currentTarget.id;
		DesignerGameDefs.update(Session.get("currentElement")._id,{$set: {exitTo: ce.exitTo}});
		Session.set("currentElement", ce);

		$('.levelRow').removeClass('selected');
		$('.levelRow > td' ).removeClass('selected');
		$('#' + e.currentTarget.id + ' > td').removeClass('subSelected');
		$('#' + e.currentTarget.id).removeClass('subSelected');
		$('#' + e.currentTarget.id + ' > td').addClass('selected');
		$('#' + e.currentTarget.id).addClass('selected');


	},

	'mouseenter .levelRow':function(e){

		var ct = DesignerGameMaps.findOne(e.currentTarget.id);

		$('.levelRow').removeClass('subSelected');
		$('.levelRow > td' ).removeClass('subSelected');

		if(ct._id != Session.get("currentLevel")._id){
			$('#' + ct._id + ' > td').addClass('subSelected');
			$('#' + ct._id).addClass('subSelected');
		}
	},

	'mouseleave .levelRow':function(e){

		$('.levelRow').removeClass('subSelected');
		$('.levelRow > td' ).removeClass('subSelected');

	},

	'blur #exitName':function(e){



		var name = $('#exitName').val();
		
		if(!DesignerGameDefs.findOne({type: "exitPoint", name: name, creator: Meteor.user()._id })){
			
			DesignerGameDefs.update(Session.get("currentElement")._id, {$set: {name: name}});

		}else{

			$('#exitName').val(Session.get("currentElement").name);
			alert("An element of this name already exists. Enter a new one.");
		}

		

		e.preventDefault();
	},


});