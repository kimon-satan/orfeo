var isReduceWarning = false;

Template.levelDesigner.created = function(){
	
	Session.set("currentFeatureType", "terrain");
	Session.set("currentElement", DesignerGameDefs.findOne({creator: Meteor.user()._id, type: 'terrain'}));
	selectALevel(); //prevents crash on boot

	Meteor.defer(selectALevel);


}



Template.terrainMap.events({


	'click .designerCell':function(e){

		if(checkClientIsOwner(Meteor.user()._id, Session.get("currentLevel"))){

			isReduceWarning = false;
			updateCurrentLevel();
			var loc = e.currentTarget.id.split("-");


			if(Session.get("currentFeatureType") == "entryPoint"){


				//in this case there can be only one pointer to each type
				//this is a bit convoluted but it keeps the data structure consistent
				var elemPointer = DesignerGameMaps.findOne({elemId: Session.get("currentElement")._id, levelId: Session.get("currentLevel")._id});
				DesignerGameMaps.update(elemPointer._id, {$set: {x: parseInt(loc[0]), y: parseInt(loc[1])}});


			}else{

				//remove any pointers of the same type
				var oldPointers = DesignerGameMaps.find({

					type: Session.get("currentElement").type,
					levelId: Session.get("currentLevel")._id, 
					x: parseInt(loc[0]), y: parseInt(loc[1])

				}).forEach(function(ep){

					DesignerGameMaps.remove(ep._id);

				});


				var ep = {
					type: Session.get("currentElement").type,
					level: Session.get("currentLevel").level,
					creator: Session.get("currentLevel").creator,
					levelId: Session.get("currentLevel")._id,
					elemId: Session.get("currentElement")._id,
					x: parseInt(loc[0]),
					y: parseInt(loc[1])
				};

				DesignerGameMaps.insert(ep);
				updateTerrainKey();
				

			}

			//there might need to be a further version which allows for overlaps

		}else{
				alert("You are not the creator of this level. \nMake a copy which you can edit");
		}
		
	}


});


Template.terrainMap.mapRow = function(){

	return DesignerGameMaps.find({
	type: 'cell', 
	levelId: Session.get("currentLevel")._id,
	 x: 0},
	 {sort: ["y", "asc"]}).fetch();
}

Template.terrainMap.mapCol = function(y){

	return DesignerGameMaps.find({
		type: 'cell', 
		levelId: Session.get("currentLevel")._id, 
		y: y},
		{sort: ["x", "asc"]}).fetch();
}

Template.terrainMap.cellColor = function(){

	/*var ep = getElementPointer({type: 'terrain', x: parseInt(this.x), y: parseInt(this.y)});
	var t; 
	if(ep.length > 0){
		t = getElement(ep[0]);
	}

	if(!t){
		return 'FFFFFF';
	}else{
		return t.color;
	}*/


}

Template.terrainMap.cellText = function(){

	/*var ep = getElementPointer({type: 'entryPoint', x: parseInt(this.x), y: parseInt(this.y)});
	
	var t; 

	if(ep.length > 0){
		t = getElement(ep[0]);
	}
	
	if(t){
		return t.name;
	}else{
		return "";
	}*/


}


/*-----------------------------------------levelTable --------------------------------------------------*/

Template.levelTable.events({

	'click #copyLevel':function(e){

		isReduceWarning = false;

		var level = Session.get("currentLevel");
		makeLevelCopy(level.level, level.creator, level.level, Meteor.user()._id);
		Deps.flush();
		e.preventDefault();

	},

	'click #removeLevel':function(e){

		//safeties needed here
		if(confirm("are you sure you want to delete " + Session.get("currentLevel").level + "... " )){	

			var level = Session.get("currentLevel");
			DesignerGameMaps.find({level: level.level, creator: level.creator}).forEach(function(cell){
				DesignerGameMaps.remove(cell._id);
			});

			selectALevel();

  		}

  		isReduceWarning = false;

		e.preventDefault();
		
	},

	'click .levelRow':function(e){

		Session.set("currentLevel", DesignerGameMaps.findOne({type: 'levelHeader', _id: e.currentTarget.id}));

		isReduceWarning = false;

		$('.levelRow').removeClass('selected');
		$('.levelRow > td' ).removeClass('selected');
		$('#' + e.currentTarget.id + ' > td').removeClass('subSelected');
		$('#' + e.currentTarget.id).removeClass('subSelected');
		$('#' + e.currentTarget.id + ' > td').addClass('selected');
		$('#' + e.currentTarget.id).addClass('selected');


		if(checkClientIsOwner(Meteor.user()._id, Session.get("currentLevel"))){
			enableAdjustables();
		}else{
			disableAdjustables();
		}

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

	}


});

/*-------------------------------------------mapKey-----------------------------------------------*/

Template.mapKey.terrainsUsed = function(){

	var k = DesignerGameMaps.findOne(Session.get("currentLevel")._id).terrainKey;
	return DesignerGameDefs.find({ _id: {$in: k} }, {fields: {color: 1, name: 1}}).fetch();

}


/*--------------------------main settings ----------------------------------------------*/

Template.mainSettings.events({

	'click #levelWidth':function(e){

		var w = $('#levelWidth').val();
		updateCurrentLevel();
		var cl = Session.get("currentLevel");

		if(w > cl.width){

			for(var x = cl.width; x < w; x++){
				for(var y = 0; y < cl.height; y++){
					
					var cell = {
						type: 'cell',
						level: cl.level, 
						levelId: cl._id, 
						creator: cl.creator, 
						x: x, y: y
					};

					DesignerGameMaps.insert(cell);
				}
			}

			DesignerGameMaps.update(cl._id, {$set:{width: parseInt(w)}});

			isReduceWarning = false;

		}else{

			if(!isReduceWarning){
				isReduceWarning = confirm("Data may be lost. Do you wish to continue ?");
			}

			if(isReduceWarning){

				DesignerGameMaps.find({levelId: cl.levelId, x: {$gte: parseInt(w)}}).forEach(function(cell){

					DesignerGameMaps.remove(cell._id);

				});
				DesignerGameMaps.update(cl._id, {$set:{width: parseInt(w)}});

			}else{
				$('#levelWidth').val(cl.width);
			}

		}

		e.preventDefault();
	},

	'click #levelHeight':function(e){

		var h = $('#levelHeight').val();
		Session.set("currentLevel", DesignerGameMaps.findOne(Session.get("currentLevel")._id));
		var cl = Session.get("currentLevel");

		if(h > cl.height){


			for(var y = cl.height; y < h; y++){

				for(var x = 0; x < cl.width; x++){
					var cell = {
						type: 'cell',
						level: cl.level, 
						levelId: cl._id, 
						creator: cl.creator, 
						x: x, y: y
					};

					DesignerGameMaps.insert(cell);
					
				}
			}

			DesignerGameMaps.update(cl._id, {$set:{height: parseInt(h)}});

			isReduceWarning = false;

		}else{

			if(!isReduceWarning){
				isReduceWarning = confirm("Data may be lost. Do you wish to continue ?");
			}

			if(isReduceWarning){

				DesignerGameMaps.find({levelId: cl.levelId, y: {$gte: parseInt(h)}}).forEach(function(cell){

					DesignerGameMaps.remove(cell._id);

				});

				DesignerGameMaps.update(cl._id, {$set:{height: parseInt(h)}});

			}else{
				$('#levelHeight').val(cl.height);
			}

		}

		e.preventDefault();
	},


	'blur #levelName':function(e){

		var name = $('#levelName').val();

		
		if(!DesignerGameMaps.findOne({type: "levelHeader", level: name, creator: Meteor.user()._id })){

			//NB. Remember this nameing convention for additional items !!! 

			DesignerGameMaps.find({level: Session.get("currentLevel").level, creator: Session.get("currentLevel").creator}).forEach(function(item){
				DesignerGameMaps.update( item._id ,{$set: {level: name}});
			});
		
		}else{

			$('#levelName').val(Session.get("currentLevel").level);
			alert("A level of this name already exists. Enter a new one.");
		}

		

		e.preventDefault();
	}

});

Template.mainSettings.currentLevel = function(){return DesignerGameMaps.findOne(Session.get("currentLevel")._id)}

/*------------------------------------------------------add Features --------------------------------------------*/

Template.addFeatures.created = function(){

	Session.set("currentFeatureType", "terrain");
}

Template.addFeatures.events({

	'click .featureOption':function(e){

		isReduceWarning = false;
		Session.set("currentFeatureType", e.currentTarget.id);
		Session.set("currentElement", null);
		e.preventDefault();
	}

});



/*-------------------------------------------------------terrain Selector ----------------------------------------*/

Template.terrainSelector.events({

	'click .terrainOption':function(e){

		isReduceWarning = false;

		Session.set("currentElement", DesignerGameDefs.findOne({name: e.currentTarget.id, creator: Meteor.user()._id }));
		e.preventDefault();
	}

});


Template.terrainSelector.currentTerrain = function(){return Session.get("currentElement")}

/*-------------------------------------------------------entry Selector ----------------------------------------*/

Template.entrySelector.entryPoints = function(){return [0,1,2,3,4,5,6,7,8,9]}
Template.entrySelector.events({

	'click .entryOption':function(e){

		isReduceWarning = false;
		var idx = e.currentTarget.id.split("_");

		var ep = DesignerGameDefs.findOne({type: 'entryPoint', name: parseInt(idx[1]), creator: Meteor.user()._id});
		Session.set("currentElement", ep);
		e.preventDefault();
	}

});


/*--------------------------------------------------------------------------------------------------------------*/

/*-------------------------------HELPER FUNCTIONS------------------------------------*/

function makeLevelCopy(o_levelName, o_creator, n_levelName, n_creator){


	if(DesignerGameMaps.findOne({level: n_levelName, creator: n_creator})){
		n_levelName = n_levelName + "_" + generateTempId(5);
	}

	var clh = DesignerGameMaps.findOne(Session.get("currentLevel")._id);
	var o_id = clh._id;
	delete clh["_id"];
	clh.creator = n_creator;
	clh.level = n_levelName;

	DesignerGameMaps.insert(clh, function(err, id){
		
		clh._id = id;
	

		DesignerGameMaps.find({levelId: o_id}).forEach(function(elem){


			elem.level = n_levelName;
			elem.creator = n_creator;
			elem.levelId = clh._id;
			delete elem["_id"];
			
			if(elem.type != "cell"){ //make new resources for everything except cells

				var o_t = DesignerGameDefs.findOne(elem.elemId);
				var n_t = DesignerGameDefs.findOne({type: elem.type, name: o_t.name, creator: n_creator});

				//copy over all the terrains
				if(!n_t){

					if(o_t){
						delete o_t["_id"];
						o_t.creator = n_creator;
						DesignerGameDefs.insert(o_t, function(err, id){ 
							elem.elemId = id;	
							DesignerGameMaps.insert(elem);
						});
					}

				}else{
					elem.elemId = n_t._id;	
					DesignerGameMaps.insert(elem);
				}

				
			}else{
				DesignerGameMaps.insert(elem);
			}

			
		});

		return clh._id;

	});

}



function updateTerrainKey(){

	var terrains = []; 

	DesignerGameDefs.find({type: 'terrain', creator: Meteor.user()._id}).forEach(function(t){

		if(DesignerGameMaps.findOne({type: 'terrain', level: Session.get("currentLevel").level, creator: Meteor.user()._id, elemId: t._id})){

			terrains.push(t._id);

		}

	});

	DesignerGameMaps.update(Session.get("currentLevel")._id, {$set:{terrainKey: terrains}});

}










