Template.designElements.created = function(){

	Meteor.defer(function(){

		Meteor.subscribe("AudioFiles",{}, {onReady: function(){

			if(typeof Session.get("currentFeatureType") === 'undefined'){
				Session.set("currentFeatureType", "terrain");
			}

			$("#" + Session.get("currentFeatureType")).addClass('active');
			$("#entryPoint").addClass('disabled');

			audio = new aapiWrapper();

			if(audio.init()){
				Session.set("isAudioInit", true);
			}else{
				console.log("init failed");
			}

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

Template.designElements.destroyed = function(){

	if(typeof audio !== 'undefined'){
		audio.killAll();
		delete audio;
		Session.set('isAudioInit', false);
	}
}

/*------------------------------------TERRAIN MAKER---------------------------------------------*/

Template.nameColorPicker.created = function(){

	Meteor.defer(function(){
		$('#colPicker').colorpicker();
	});

}

Template.nameColorPicker.events({

	'changeColor #colPicker':function(e){

		if(checkClientIsOwner(Meteor.user()._id, Session.get("currentElement"))){
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

Template.mapSymbolPicker.events({

	'blur #mapSymbol':function(e){

	var ce = Session.get("currentElement");
	ce.mapSymbol = $('#mapSymbol').val();
	DesignerGameDefs.update(ce._id,{$set: {mapSymbol: ce.mapSymbol}});
	e.preventDefault();

	}
});




Template.elementTable.created = function(){

	 if(typeof audio !== 'undefined'){
	 	if(Session.get('isAudioInit')){
	 		audio.killAll();
	 	}
	 }


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


		if(DesignerGameDefs.findOne({type: ct.type, creator: Meteor.user()._id, name: ct.name})){
			ct.name = ct.name + "_" + generateTempId(3);
		}
		
		ct.creator = Meteor.user()._id;	
		if(ct.type == 'keyhole')updateKeyhole(ct);
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

Template.elementPointerTable.events({

	'click .elementPointerRow':function(e){

		var cep = DesignerGameDefs.findOne(e.currentTarget.id);
		if(typeof cep  === "undefined")return;
		var ce = Session.get("currentElement");
		ce.keyPickupable = cep._id;
		Session.set("currentElement", ce);
		selectElementPointer(e.currentTarget.id);
		DesignerGameDefs.update(ce._id, {$set: {keyPickupable: ce.keyPickupable}});

	},

	'mouseenter .elementPointerRow':function(e){

		$('.elementPointerRow').removeClass('subSelected');
		$('.elementPointerRow > td' ).removeClass('subSelected');

		if(e.currentTarget.id != Session.get("currentElement")._id){
			$('#' + e.currentTarget.id + ' > td').addClass('subSelected');
			$('#' + e.currentTarget.id).addClass('subSelected');
		}
	},

	'mouseleave .elementPointerRow':function(e){

		$('.elementPointerRow').removeClass('subSelected');
		$('.elementPointerRow > td' ).removeClass('subSelected');

	},




});

Template.filterPicker.events({

	'click .pFilterOption':function(e){

		Session.set('pointerFilter', e.currentTarget.id);
		
		if(checkClientIsOwner(Meteor.user()._id, Session.get("currentElement"))){
			enableAdjustables();
		}else{
			disableAdjustables();
		}
	}

});

function selectElementPointer(id){

	$('.elementPointerRow').removeClass('selected');
	$('.elementPointerRow > td' ).removeClass('selected');
	$('#' + id + ' > td').removeClass('subSelected');
	$('#' + id ).removeClass('subSelected');
	$('#' + id + ' > td').addClass('selected');
	$('#' + id).addClass('selected');

}





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

	if(Session.get("currentFeatureType") == "keyhole"){
		selectElementPointer(Session.get("currentElement").keyPickupable);
	}

}




/*----------------------------------------SOUND CONTROL -------------------------------*/


Template.soundControls.audioFiles = function(type){  

	if(!Session.get("currentElement"))return;
	var ct = DesignerGameDefs.findOne(Session.get("currentElement")._id);
	if(typeof ct === "undefined")return;
	var folder = ct[type].folder;
	var files = AudioFiles.find({dt: 'file', parent: folder}).fetch();
	files.unshift({filename: 'none'});

  	return files;
 
}

Template.soundControls.audioTypes = function(){
	var types = AudioFiles.find({dt: 'type'}).fetch();
	types.unshift({type: 'none'});
	return types;
}

Template.soundControls.audioParam = function(type, item){

	if(!Session.get("currentElement"))return;
	var ct = DesignerGameDefs.findOne(Session.get("currentElement")._id);
	if(typeof ct === "undefined" || ct[type] === "undefined")return;
	return ct[type][item.hash.item];
}



Template.soundControls.events({


	'click .typeOption':function(e){
		
		var ce = Session.get("currentElement");
		
		var classList = e.currentTarget.className.split(/\s+/);
		var folder = classList[1] + '.folder';
		var audioFile = classList[1] + '.audioFile';
		var setObj = {};
		
		setObj[folder] = $(e.currentTarget.id).selector;
		setObj[audioFile] = 'none';
		ce[classList[1]].folder = $(e.currentTarget.id).selector;
		ce[classList[1]].audioFile = 'none';

		DesignerGameDefs.update(Session.get("currentElement")._id, {$set: setObj});
		Session.set('currentElement', ce);

		e.preventDefault();
	},

	'click .fileOption':function(e){

		var classList = e.currentTarget.className.split(/\s+/);
		var af = classList[1] + '.audioFile';
		var setObj = {};
		setObj[af] = $(e.currentTarget.id).selector;
		var ce = Session.get('currentElement');
		ce[classList[1]].audioFile = $(e.currentTarget.id).selector;
		DesignerGameDefs.update(ce._id, {$set: setObj});
		Session.set('currentElement', ce);

		e.preventDefault();
	},

	'click .ampBox':function(e){

		var classList = e.currentTarget.className.split(/\s+/);
		var amp = classList[2] + '.amp'; //this is a bit of a nasty technique
		var setObj = {};
		setObj[amp] = parseFloat(e.currentTarget.value);
		var ce = Session.get('currentElement');
		ce[classList[2]].amp = parseFloat(e.currentTarget.value);
		Session.set('currentElement', ce);
		DesignerGameDefs.update(Session.get("currentElement")._id, {$set: setObj});
		e.preventDefault();

	},

	'click .play':function(e){

		if(Session.get('currentElement')[e.currentTarget.id].audioFile == 'none'){
			e.preventDefault();
			return -1;
		}
		if($('#' + e.currentTarget.id + '_glyph').hasClass('glyphicon-stop')){
			var idx = Session.get('currentElement')[e.currentTarget.id].index;
			$('#' + e.currentTarget.id + '_glyph').removeClass('glyphicon-stop');
			$('#' + e.currentTarget.id + '_glyph').addClass('glyphicon-play');
			audio.stopOnePlay(idx);
			e.preventDefault();
			return - 1;
		}

		audio.loadSounds([Session.get('currentElement')[e.currentTarget.id]], function(){

		$('#' + e.currentTarget.id + '_glyph').removeClass('glyphicon-play');
		$('#' + e.currentTarget.id + '_glyph').addClass('glyphicon-stop');

			audio.playOnce(Session.get('currentElement')[e.currentTarget.id], function(){
				$('#' + e.currentTarget.id + '_glyph').removeClass('glyphicon-stop');
				$('#' + e.currentTarget.id + '_glyph').addClass('glyphicon-play');
			});


		});


		
		e.preventDefault();
	},



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

	'blur #entryIndex':function(e){
 
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

/*-------------------------------------pickupableMaker --------------------------------*/

Template.pickupableMaker.events({


	'blur #displayName':function(e){

		var ce = Session.get("currentElement");
		ce.displayName = $('#displayName').val();
		DesignerGameDefs.update(ce._id,{$set: {displayName: ce.displayName}});
		e.preventDefault();
	}
});

/*------------------------------------keyhole maker -------------------------------------*/


Template.keyholeMaker.keyPickupable = function(){
	var kp = DesignerGameDefs.findOne(Session.get("currentElement").keyPickupable);
	if(typeof kp !== 'undefined')return kp;
}

Template.keyholeMaker.removeWall = function(){
	var e = getElement(Session.get('currentElement').removeWall);
	if(e !== undefined){
		return e
	}else{
		return {name: 'none'};
	}
}

Template.keyholeMaker.checkLevelLinked = function(){
	return (Session.get("currentElement").isLevelLinked)? 'checked' : '';
}

Template.keyholeMaker.linkWith = function(){

	if(Session.get('currentElement').linkWith == 'none' || typeof Session.get('currentElement').linkWith === 'undefined'){
		return 'none';
	}else{
		return getElement(Session.get('currentElement').linkWith).name;
	}
}

Template.keyholeMaker.kpCreator = function(){

	var kp = getElement(Session.get('currentElement').keyPickupable);
	if(typeof kp !== 'undefined')return getCreatorName(kp.creator);

}

Template.keyholeMaker.events({

	'click .wallOption':function(e){
		var ce = Session.get("currentElement");
		var id = e.currentTarget.id;
		ce.removeWall = e.currentTarget.id;
		DesignerGameDefs.update(ce._id, {$set: {removeWall: ce.removeWall}});
		Session.set('currentElement', ce);
		e.preventDefault();
	},

	'click .linkWithOption':function(e){

		var ce = Session.get("currentElement");
		console.log(e.currentTarget.id);
		var id = e.currentTarget.id;
		ce.linkWith = e.currentTarget.id;
		DesignerGameDefs.update(ce._id, {$set: {linkWith: ce.linkWith}});
		Session.set('currentElement', ce);
		e.preventDefault();
	},

	'click #linkedKey':function(e){

		var ce = Session.get("currentElement");
		ce.isLevelLinked = !ce.isLevelLinked;
		DesignerGameDefs.update(ce._id, {$set: {isLevelLinked: ce.isLevelLinked}});
		Session.set('currentElement', ce);
	}, 



});

Template.simpleSoundMaker.events({

	'click #isZone':function(e){

		var ce = Session.get("currentElement");
		ce.isZone = !ce.isZone;
		DesignerGameDefs.update(ce._id, {$set: {isZone: ce.isZone}});
		Session.set('currentElement', ce);
	}

});

Template.simpleSoundMaker.isZone = function(){
	return (Session.get("currentElement").isZone)? 'checked' : '';
}


Template.soundFieldMaker.isHollow = function(){
	return (Session.get("currentElement").isHollow)? 'checked' : '';
}


Template.soundFieldMaker.events({

	'click #isHollow':function(e){

		var ce = Session.get("currentElement");
		ce.isHollow = !ce.isHollow;
		DesignerGameDefs.update(ce._id, {$set: {isHollow: ce.isHollow}});
		Session.set('currentElement', ce);
	},

	'click #range':function(e){

		var ce = Session.get("currentElement");
		ce.range = $('#range').val();
		DesignerGameDefs.update(ce._id, {$set: {range: ce.range}});
		Session.set('currentElement', ce);
	},

	'click #skew':function(e){

		var ce = Session.get("currentElement");
		ce.skew = $('#skew').val();
		DesignerGameDefs.update(ce._id, {$set: {skew: ce.skew}});
		Session.set('currentElement', ce);
	}


});

//-------------------helpers

updateKeyhole = function(keyhole){


	if(keyhole.keyPickupable != 'none')copyElemPointer(keyhole, 'keyPickupable', 'pickupable');
	if(keyhole.removeWall != 'none')copyElemPointer(keyhole, 'removeWall', 'wall');
	if(keyhole.linkWith != 'none')copyElemPointer(keyhole, 'linkWith', 'keyhole');


}

function copyElemPointer(elem, prop, param){

	var kp = getElement(elem[prop]);
	var np = DesignerGameDefs.findOne({creator: Meteor.user()._id, type: param, name: kp.name});

	if(np){
		elem[prop] = np._id;
	}else{
		kp.creator = Meteor.user()._id;
		delete kp._id;
		var n_id = DesignerGameDefs.insert(kp);
		elem[prop] = n_id;
	}

}




