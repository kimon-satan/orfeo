var isReduceWarning = false;

Template.levelDesigner.created = function(){
	
	Session.set("currentTerrain", DesignerGameDefs.findOne({creator: Meteor.user()._id}));
	selectALevel(); //prevents crash on boot

	Meteor.defer(selectALevel);


}

Template.levelDesigner.events({

	'click #levelWidth':function(e){

		var w = $('#levelWidth').val();
		updateCurrentLevel();
		var cl = Session.get("currentLevel");

		if(w > cl.width){

			for(var x = cl.width; x < w; x++){
				for(var y = 0; y < cl.height; y++){
					var cell = createMapCell(cl.level, x, y, cl.creator);
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

				DesignerGameMaps.find({type: 'cell', level: cl.level, creator: cl.creator, x: {$gte: parseInt(w)}}).forEach(function(cell){

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
					var cell = createMapCell(cl.level, x, y, cl.creator);
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

				DesignerGameMaps.find({type: 'cell', level: cl.level, creator: cl.creator, y: {$gte: parseInt(h)}}).forEach(function(cell){

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
	},

	'click .terrainOption':function(e){

		isReduceWarning = false;

		Session.set("currentTerrain", DesignerGameDefs.findOne({name: e.currentTarget.id, creator: Meteor.user()._id }));
		e.preventDefault();
	},

	'click #copyLevel':function(e){

		isReduceWarning = false;

		var level = Session.get("currentLevel");
		makeLevelCopy(level.level, level.creator, level.level, Meteor.user()._id);
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


	'click .designerCell':function(e){

		isReduceWarning = false;
		updateCurrentLevel();

		if(checkClientIsOwner(Meteor.user()._id, Session.get("currentLevel"))){

			var loc = e.currentTarget.id.split("-");
			var cell = DesignerGameMaps.findOne({type: 'cell', 
				creator: Session.get("currentLevel").creator, 
				level: Session.get("currentLevel").level, 
				x: parseInt(loc[0]), y: parseInt(loc[1])});
			

			DesignerGameMaps.update(cell._id ,{$set:{terrain: Session.get("currentTerrain")._id}});
			updateTerrainKey();
		}else{
			alert("You are not the creator of this level. \nMake a copy which you can edit");
		}
		
	}


});

Template.levelDesigner.currentLevel = function(){return DesignerGameMaps.findOne(Session.get("currentLevel")._id)}
Template.levelDesigner.currentTerrain = function(){return Session.get("currentTerrain")}
Template.levelDesigner.terrainsUsed = function(){

	var k = DesignerGameMaps.findOne(Session.get("currentLevel")._id).terrainKey;
	return DesignerGameDefs.find({ _id: {$in: k} }, {fields: {color: 1, name: 1}}).fetch();

}

Template.terrainMap.mapRow = function(){

	cl = DesignerGameMaps.findOne(Session.get("currentLevel")._id);

	return DesignerGameMaps.find({
	type: 'cell', 
	creator: cl.creator,
	level: cl.level,
	 x: 0},
	 {sort: ["y", "asc"]}).fetch();
}

Template.terrainMap.mapCol = function(y){

	cl = DesignerGameMaps.findOne(Session.get("currentLevel")._id);

	return DesignerGameMaps.find({
		type: 'cell', 
		creator: cl.creator, 
		level: cl.level, y: y},
		{sort: ["x", "asc"]}).fetch();
}

Template.terrainMap.cellColor = function(){

	var t = DesignerGameDefs.findOne(this.terrain);
	if(!t){
		return 'FFFFFF';
	}else{
		return t.color;
	}

}






Template.levelTable.events({

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




/*-------------------------------HELPER FUNCTIONS------------------------------------*/

function makeLevelCopy(o_levelName, o_creator, n_levelName, n_creator){


	if(DesignerGameMaps.findOne({level: n_levelName, creator: n_creator})){
		n_levelName = n_levelName + "_" + generateTempId(5);
	}

	var clh = DesignerGameMaps.findOne(Session.get("currentLevel")._id);
	delete clh["_id"];
	clh.creator = n_creator;
	clh.level = n_levelName;
	DesignerGameMaps.insert(clh, function(err, id){
		clh._id = id;
	});

	DesignerGameMaps.find({type: 'cell', level: o_levelName, creator: o_creator}).forEach(function(elem){


		elem.level = n_levelName;
		elem.creator = n_creator;
		delete elem["_id"];
		
		if(elem.terrain != "none"){
			var o_t = DesignerGameDefs.findOne(elem.terrain);
			var n_t = DesignerGameDefs.findOne({type: "terrain", name: o_t.name, creator: n_creator});

			//copy over all the terrains
			if(!n_t){

				n_t = DesignerGameDefs.findOne({type: "terrain", name: elem.terrain, creator: o_creator});
				if(n_t){
					delete n_t["_id"];
					n_t.creator = n_creator;
					DesignerGameDefs.insert(n_t, function(err, id){ 
						n_t._id = id;
					});
				}

			}
			
			elem.terrain = n_t._id;
		}

		//this will need to be done for the other elements in the cell

		DesignerGameMaps.insert(elem);
	});

	return clh._id;

}



function updateTerrainKey(){

	var terrains = []; 

	DesignerGameDefs.find({type: 'terrain', creator: Meteor.user()._id}).forEach(function(t){

		if(DesignerGameMaps.findOne({type: 'cell', level: Session.get("currentLevel").level, creator: Meteor.user()._id, terrain: t._id})){

			terrains.push(t._id);

		}

	});

	DesignerGameMaps.update(Session.get("currentLevel")._id, {$set:{terrainKey: terrains}});

}










