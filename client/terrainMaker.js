Template.designElements.created = function(){

	Meteor.defer(function(){

		Meteor.subscribe("AudioFiles",{}, {onReady: function(){

			if(typeof Session.get("currentFeatureType") === 'undefined'){
				Session.set("currentFeatureType", "terrain");
			}

			$("#" + Session.get("currentFeatureType")).addClass('active');
			$("#entryPoint").addClass('disabled');

		}});

	});

}



Template.designElements.events({

	'click li.makerlink':function(e){

		if(! $('#' + e.currentTarget.id).hasClass('disabled')){
			$('li.makerlink').removeClass('active');
			$(e.currentTarget).addClass('active');
			Session.set("currentFeatureType", e.currentTarget.id);
			Session.set("currentElement", "");
		}

		e.preventDefault();

	}
})

/*------------------------------------TERRAIN MAKER---------------------------------------------*/

Template.nameColorPicker.created = function(){

	Meteor.defer(function(){
		$('#colPicker').colorpicker();
	});

}

Template.nameColorPicker.events({

	'changeColor #colPicker':function(e){

		if(checkClientIsOwner(Meteor.user()._id, Session.get("currentElement").creator)){
			DesignerGameDefs.update(Session.get("currentElement")._id, {$set: {'color': e.color.toHex()}});
		}

	},

	'blur #elementName':function(e){

		var name = $('#elementName').val();
		var ce = Session.get("currentElement");
		
		if(!DesignerGameDefs.findOne({type: Session.get("currentFeatureType"), name: name, 
									creator: ce.creator})){
			
			DesignerGameDefs.update(ce._id, {$set: {name: name}});
			ce.name = name;
			Session.set("currentElement", ce);

		}else{

			$('#elementName').val(Session.get("currentElement").name);
			alert("An element of this name already exists. Enter a new one.");
		}

		

		e.preventDefault();
	}

});




Template.elementTable.created = function(){

	 Meteor.defer(function(){

	  	
	  	var ct = DesignerGameDefs.findOne({type: Session.get("currentFeatureType"), creator: "server"});
	  	if(ct)Session.set("currentElement", ct);
		  	 
  	 	if(Session.get("currentElement")){
  	 		selectElement(Session.get("currentElement")._id);
  	 	}

  

  });
}



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
			
			var r = checkForDependencies(DesignerGameDefs.findOne(Session.get("currentElement")));
		
			if(!r){
				DesignerGameDefs.remove(Session.get("currentElement")._id, function(err){if(err){alert(err.reason)}});
				selectElement(DesignerGameDefs.findOne({creator: 'server', type: Session.get("currentFeatureType")})._id);
			}else{
				alert("I can't delete this because of a dependency in " + r + "\nremove the "  + Session.get("currentElement").type + " from this level first.")
			}

			
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

	if(Session.get("currentFeatureType") == "exitPoint"){
		selectExitLevel();
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
		case "Hit":
		folder =  ct.hit.folder;
		break;


	}

  	return AudioFiles.find({dt: 'file', parent: folder}).fetch();
 
}

Template.soundControls.audioTypes = function(){return AudioFiles.find({dt: 'type'}).fetch();}

Template.soundControls.audioParam = function(type, item){

	if(!Session.get("currentElement"))return;
	var ct = DesignerGameDefs.findOne(Session.get("currentElement")._id);
	if(typeof ct === "undefined" || ct.background === "undefined")return;


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
		case "Hit":
		return ct.hit[item.hash.item];
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

		}else if($(e.currentTarget).hasClass('Narrator')){
			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'narrator.folder': $(e.currentTarget.id).selector, 'narrator.audioFile':'none'}});

		}else if($(e.currentTarget).hasClass('Hit')){
			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'hit.folder': $(e.currentTarget.id).selector, 'hit.audioFile':'none'}});
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

		}else if($(e.currentTarget).hasClass('Narrator')){
			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'narrator.audioFile': $(e.currentTarget.id).selector}});

		}else if($(e.currentTarget).hasClass('Hit')){
			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'hit.audioFile': $(e.currentTarget.id).selector}});
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
		}else if($(e.currentTarget).hasClass('Narrator')){
			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'narrator.amp': parseFloat(e.currentTarget.value)}});
		}else if($(e.currentTarget).hasClass('Hit')){
			DesignerGameDefs.update(Session.get("currentElement")._id, 
				{$set: {'hit.amp': parseFloat(e.currentTarget.value)}});
		}
		

		e.preventDefault();

	}


});




Template.exitPointMaker.exitTo = function(){
	var header = DesignerGameMaps.findOne(Session.get("currentElement").exitTo);

	if(header){
		return header.level + " :: " + getCreatorName(header.creator);
	}
}

Template.exitPointMaker.events({

	
	'click .levelRow':function(e){

		if($('#' + e.currentTarget.id).hasClass('disable'))return;

		var ce = Session.get("currentElement");
		ce.exitTo = e.currentTarget.id;
		DesignerGameDefs.update(Session.get("currentElement")._id,{$set: {exitTo: ce.exitTo}});
		Session.set("currentElement", ce);

		var creator = DesignerGameMaps.findOne(ce.exitTo).creator;
		if(creator != Meteor.user()._id){
			alert("Careful ! you are linking to one of " + getCreatorName(creator) 
				+ "'s levels. \nHave you spoken to them about this first ? \nRemember you can always make a copy of their level." );
		}

		$('.levelRow').removeClass('selected');
		$('.levelRow > td' ).removeClass('selected');
		$('#' + e.currentTarget.id + ' > td').removeClass('subSelected');
		$('#' + e.currentTarget.id).removeClass('subSelected');
		$('#' + e.currentTarget.id + ' > td').addClass('selected');
		$('#' + e.currentTarget.id).addClass('selected');


	},

	'mouseenter .levelRow':function(e){

		if($('#' + e.currentTarget.id).hasClass('disable'))return;

		var ct = DesignerGameMaps.findOne(e.currentTarget.id);

		$('.levelRow').removeClass('subSelected');
		$('.levelRow > td' ).removeClass('subSelected');

		if(ct._id != Session.get("currentLevel")._id){
			$('#' + ct._id + ' > td').addClass('subSelected');
			$('#' + ct._id).addClass('subSelected');
		}
	},

	'mouseleave .levelRow':function(e){

		if($('#' + e.currentTarget.id).hasClass('disable'))return;

		$('.levelRow').removeClass('subSelected');
		$('.levelRow > td' ).removeClass('subSelected');

	},



	'click #entryIndex':function(e){
 
		var ce = Session.get("currentElement");
		ce.entryIndex = $('#entryIndex').val();
		DesignerGameDefs.update(Session.get("currentElement")._id,{$set: {entryIndex: ce.entryIndex}});
		Session.set("currentElement", ce);
		e.preventDefault();
	},

	'blur #entryIndex':function(element){
 
		var ce = Session.get("currentElement");
		ce.entryIndex = Math.min(Math.max($('#entryIndex').val() , 0), 9);
		DesignerGameDefs.update(Session.get("currentElement")._id,{$set: {entryIndex: ce.entryIndex}});
		Session.set("currentElement", ce);
		e.preventDefault();
	}


});


function selectExitLevel(){

	var l_id = Session.get("currentElement").exitTo;
	Session.set("currentLevel" , DesignerGameMaps.findOne(l_id));
	updateCurrentLevel();

}


