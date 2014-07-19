var isReduceWarning = false;
var isRemoveItems = false;

Template.levelDesigner.created = function(){
	
	updateCurrentLevel();
	selectALevel();
	

	Meteor.defer(function(){
		updateCurrentLevel();
		selectALevel();
		if(!Session.get("currentFeatureType"))Session.set("currentFeatureType", "terrain");
		Session.set("currentElement", DesignerGameDefs.findOne({type: Session.get("currentFeatureType"), 
									creator: Meteor.user()._id}));

	});


}



Template.terrainMap.events({


	'click .designerCell':function(e){

		if(checkClientIsOwner(Meteor.user()._id, Session.get("currentLevel"))){

			isReduceWarning = false;
			updateCurrentLevel();
			var loc = e.currentTarget.id.split("-");


			if(Session.get("currentFeatureType") == "entryPoint"){

				setSingularElement(loc);

			}else if(Session.get("currentFeatureType") == "keyhole"){

				var index = $('#priorityBox').val();
				setArrayElement(loc, index);
				updateLevelInventory();

			}else if(Session.get('currentFeatureType') == 'soundField'){

				updateSoundFieldTraces(loc);

			}else{
				setMultiElement(loc);
			}

			if(Session.get("currentFeatureType") == "pickupable"){
				updateLevelInventory();
			}

		


		}else{
				alert("You are not the creator of this level. \nMake a copy which you can edit");
		}
		
	}


});



function updateSoundFieldTraces(loc){

	var cl = Session.get('currentLevel');
	var ce = Session.get('currentElement');

	if(isRemoveItems){
		delete cl.cells[parseInt(loc[1])][parseInt(loc[0])].soundFieldTraces[ce._id];
		DesignerGameMaps.update(cl._id , {$set: {cells: cl.cells}});
		Session.set('currentLevel', cl);
		updateKey(Session.get("currentElement")._id, isRemoveItems);
		return;
	}

	ce.range = parseInt(ce.range);
	if(ce.range == 0)return;


	var radMinX = Math.max(0, parseInt(loc[0]) - ce.range);
	var radMaxX = Math.min(parseInt(cl.width ), parseInt(loc[0]) + ce.range + 1);
	var radMinY = Math.max(0, parseInt(loc[1]) - ce.range);
	var radMaxY = Math.min(parseInt(cl.height), parseInt(loc[1]) + ce.range + 1);

	var maxDist = Math.sqrt(Math.pow(ce.range, 2) + Math.pow(ce.range ,2));

	for(var y = radMinY; y < radMaxY; y++){
		for(var x = radMinX; x < radMaxX; x++){

			(function(){

				var dist = Math.sqrt(Math.pow(x - parseInt(loc[0]), 2) + Math.pow(y - parseInt(loc[1]) ,2));

				if(ce.isHollow && dist == 0){
	
				}else{
					var t = {id: ce._id, amp: ce.sound.amp * (1 - dist/maxDist)};
					if(t.amp > 0)cl.cells[y][x].soundFieldTraces[ce._id] = t;
				}
				
				

			})();
		}
	}	

	DesignerGameMaps.update(cl._id , {$set: {cells: cl.cells}});
	Session.set('currentLevel', cl);

	updateKey(Session.get("currentElement")._id, isRemoveItems);


}

function setSingularElement(loc){

	//check to see if there is already an element set
	var cl = Session.get('currentLevel');
	var n_cell = cl.cells[parseInt(loc[1])][parseInt(loc[0])];


	if(n_cell.entryPoint != 'none'){ //may need expanding if extra elements have same behaviour
		
		alert('this cell already has an entry point');
		return;

	}else{

		//clear the old cell
		var o_cell = cl.entryPoints[Session.get('currentElement')];
		cl.cells[o_cell.y][o_cell.x].entryPoint = 'none';

		//set the new one
		cl.entryPoints[Session.get('currentElement')].x = parseInt(loc[0]);
		cl.entryPoints[Session.get('currentElement')].y = parseInt(loc[1]);
		cl.cells[parseInt(loc[1])][parseInt(loc[0])].entryPoint = Session.get('currentElement');

		
		DesignerGameMaps.update(cl._id , {$set: {cells: cl.cells, entryPoints: cl.entryPoints}});
		Session.set('currentLevel', cl);

	}

}


function setMultiElement(loc){

	var cl = Session.get('currentLevel');
	var cell = cl.cells[parseInt(loc[1])][parseInt(loc[0])];

	var id = (isRemoveItems) ? 'none' : Session.get("currentElement")._id;
	cl.cells[parseInt(loc[1])][parseInt(loc[0])][Session.get("currentFeatureType")] = id;
	
	DesignerGameMaps.update(cl._id , {$set: {cells: cl.cells}});
	Session.set('currentLevel', cl);

	updateKey(Session.get("currentElement")._id, isRemoveItems);

}

function setArrayElement(loc, index){


	var cl = Session.get('currentLevel');
	var cell = cl.cells[parseInt(loc[1])][parseInt(loc[0])];

	var array = cell[Session.get("currentElement").type];

	if(isRemoveItems){

		for(item in array){
			if(array[item] == Session.get('currentElement')._id)delete array[item];
		}

	}else{
		array[index] = Session.get('currentElement')._id;
	}


	Session.set('currentLevel', cl);
	DesignerGameMaps.update(cl._id ,{$set: {cells: cl.cells}});

	updateKey(Session.get("currentElement")._id, isRemoveItems);

}


Template.terrainMap.mapRow = function(){

	var array = [];

	for(var i = 0; i < Session.get('currentLevel').height; i++)array.push(i);
	
	return array;

}

Template.terrainMap.mapCol = function(y){

	return Session.get('currentLevel').cells[y]; 

}


Template.terrainMap.hasElement = function(type){
	if(type == 'entryPoint'){
		return (this[type] != 'none' && Session.get('currentView').entryPoint);
	}else{
		return (this[type] != 'none' && Session.get('currentView')[this[type]]);
	}
}

Template.terrainMap.soundFieldTraces = function(){

	var array = [];
	
	for(a in this.soundFieldTraces){
		if(Session.get('currentView')[a])array.push(this.soundFieldTraces[a]);
	}

	return array;
}

Template.terrainMap.getCollectionElement = function(type, index){
	index = parseInt(index);
	if(typeof this[type] == 'undefined')return;
	var elem = this[type][index];
	if(elem == 'none' || !Session.get('currentView')[this[type][index]])elem = undefined;
	return elem;
}


Template.terrainMap.elementColor = function(e){

	var t = DesignerGameDefs.findOne(e);

	if(!t){
		return;
	}else{
		return t.color;
	}


}

Template.terrainMap.soundFieldOpacity = function(){

	var t = DesignerGameDefs.findOne(this.id);

	if(!t){
		return;
	}else{
		return Math.max(0.1, this.amp/t.sound.amp);
	}


}

Template.terrainMap.elementMapSymbol = function(e){

	var s = DesignerGameDefs.findOne(e);

	if(!s){
		return;
	}else{
		return s.mapSymbol;
	}


}






/*-----------------------------------------levelTable --------------------------------------------------*/

Template.levelTable.events({

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

			//insert check for dependencies and alert message

			var ep = DesignerGameDefs.findOne({type: 'exitPoint', exitTo: Session.get("currentLevel")._id});

			if(ep){

				if(ep.creator != Meteor.user()._id){
					alert("Sorry I can't delete this because "  + getCreatorName(ep.creator) + " has linked to this level in their exitPoint " + ep.name 
						+ ". \nPlease ask them to remove this resource first.");
				}else{
					alert("Sorry I can't delete this because you have linked to this level in the exitPoint " + ep.name 
					+ ". \nPlease delete this resource first.");
				}

			}else{

				DesignerGameMaps.find({levelId: level._id}).forEach(function(elem){
					DesignerGameMaps.remove(elem._id);
				});

				DesignerGameMaps.remove(Session.get("currentLevel")._id, function(){
					Session.set("currentLevel", "");
					selectALevel();
				});

			}
			


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

Template.mapKey.elementsUsed = function(){

	var k = DesignerGameMaps.findOne(Session.get("currentLevel")._id).mapKey;
	return DesignerGameDefs.find({ _id: {$in: k} }, {fields: {color: 1, name: 1, type: 1, mapSymbol: 1}}).fetch();

}


/*--------------------------main settings ----------------------------------------------*/

Template.mainSettings.events({

	'click #levelWidth':function(e){

		var w = parseInt($('#levelWidth').val());
		var cl = Session.get("currentLevel");

		if(w > cl.width){

			console.log('increase');

			for(var x = cl.width; x < w; x++){
				for(var y = 0; y < cl.height; y++){
					cl.cells[y].push(createMapCell(x, y));
				}
			}

			cl.width = w;
			DesignerGameMaps.update(cl._id, {$set:{width: parseInt(w), cells: cl.cells}});
			Session.set('currentLevel', cl);
			isReduceWarning = false;

		}else{

			isReduceWarning = true;

			if(!isReduceWarning){	

				isReduceWarning = confirm("Data may be lost. Do you wish to continue ?");
			}

			

			if(isReduceWarning){


				for(var y = 0; y < cl.height; y++){
					for(var x = cl.width; x > w; x--){
						cl.cells[y].pop();
					}
				}

				cl.width = w;
				DesignerGameMaps.update(cl._id, {$set:{width: cl.width, cells: cl.cells}});
				Session.set('currentLevel', cl);

			}else{
				$('#levelWidth').val(cl.width);
			}

		}

		e.preventDefault();
	},

	'click #levelHeight':function(e){

		var h = parseInt($('#levelHeight').val());
		Session.set("currentLevel", DesignerGameMaps.findOne(Session.get("currentLevel")._id));
		var cl = Session.get("currentLevel");

		if(h > cl.height){

			for(var y = cl.height; y < h; y++){
				var row = [];
				for(var x = 0; x < cl.width; x++)row.push(createMapCell(x, y));
				cl.cells.push(row);
			}

			cl.height = h;
			DesignerGameMaps.update(cl._id, {$set:{height: cl.height, cells: cl.cells}});
			Session.set('currentLevel',cl);
			isReduceWarning = false;

		}else{

			if(!isReduceWarning){
				isReduceWarning = confirm("Data may be lost. Do you wish to continue ?");
			}

			if(isReduceWarning){

				for(var y = cl.height; y > h; y--)cl.cells.pop();
				cl.height = h;
				Session.set('currentLevel', cl);
				DesignerGameMaps.update(cl._id, {$set:{height: cl.height, cells: cl.cells}});

			}else{
				$('#levelHeight').val(cl.height);
			}

		}

		e.preventDefault();
	},


	'blur #levelName':function(e){

		var name = $('#levelName').val();

		
		if(!DesignerGameMaps.findOne({type: "levelHeader", level: name, creator: Meteor.user()._id })){

			DesignerGameMaps.find({levelId: Session.get("currentLevel")._id}).forEach(function(item){
				DesignerGameMaps.update( item._id ,{$set: {level: name}});
			});

			DesignerGameMaps.update(Session.get("currentLevel")._id, {$set: {level: name}});

			updateCurrentLevel();
		
		}else{

			$('#levelName').val(Session.get("currentLevel").level);
			alert("A level of this name already exists. Enter a new one.");
		}

		

		e.preventDefault();
	}

});

Template.mainSettings.currentLevel = function(){return DesignerGameMaps.findOne(Session.get("currentLevel")._id)}

/*------------------------------------------------------add Features --------------------------------------------*/


Template.addFeatures.events({

	'click .featureOption':function(e){

		isReduceWarning = false;
		Session.set("currentFeatureType", e.currentTarget.id);
		ce = DesignerGameDefs.findOne({type: Session.get("currentFeatureType"), creator: Meteor.user()._id});
		Session.set("currentElement", ce);
		e.preventDefault();
	}

});




/*-------------------------------------------------------entry Selector ----------------------------------------*/

Template.entrySelector.created = function(){
	Session.set("currentElement", 0);
}

Template.entrySelector.currentEntryPoint = function(){return Session.get("currentElement");}
Template.entrySelector.entryPoints = function(){return [0,1,2,3,4,5,6,7,8,9]}
Template.entrySelector.events({

	'click .entryOption':function(e){

		isReduceWarning = false;
		var idx = e.currentTarget.id.split("_");
		Session.set("currentElement", parseInt(idx[1]));
		e.preventDefault();
	}

});


/*----------------------------------------------------standard selector-------------------------------------------------------*/

Template.selector.created = function(){

	Meteor.defer(function(){
		ce = DesignerGameDefs.findOne({type: Session.get("currentFeatureType"), creator: Meteor.user()._id});
		Session.set("currentElement", ce);
	});

}


Template.selector.events({

	'click .elemOption':function(e){

		isReduceWarning = false;
		ce = DesignerGameDefs.findOne(e.currentTarget.id);
		Session.set("currentElement", ce);
		e.preventDefault();
	},

	'click #removeBox':function(e){
		isRemoveItems = $('#removeBox').is(':checked');
	}

});



/*-------------------------------HELPER FUNCTIONS------------------------------------*/

function makeLevelCopy(o_levelName, o_creator, n_levelName, n_creator){


	if(DesignerGameMaps.findOne({type: 'levelHeader', level: n_levelName, creator: n_creator})){
		n_levelName = n_levelName + "_" + generateTempId(5);
	}

	var clh = DesignerGameMaps.findOne(Session.get("currentLevel")._id);
	var nlh = DesignerGameMaps.findOne(Session.get("currentLevel")._id);
	var mapTypes = [];

	//add the new depenencies and convert the mapKey

	for(var i = 0; i < nlh.mapKey.length; i ++){

		var o_t = DesignerGameDefs.findOne(clh.mapKey[i]);
		var n_t = DesignerGameDefs.findOne({type: o_t.type, name: o_t.name, creator: n_creator});

		mapTypes.push(o_t.type);

		if(!n_t){
			delete o_t["_id"];
			o_t.creator = n_creator;
			nlh.mapKey[i] = DesignerGameDefs.insert(o_t);
		}else{
			console.log(n_t);
			nlh.mapKey[i] = n_t._id;
		}

	}

	
	for(var y = 0; y < nlh.height; y++){
		for(var x = 0; x < nlh.width; x++){
			for(var i = 0; i < nlh.mapKey.length; i++){

				if(nlh.cells[y][x][mapTypes[i]] == clh.mapKey[i]){
					nlh.cells[y][x][mapTypes[i]] = nlh.mapKey[i];
				}

			}
		}
	}

	nlh.creator = n_creator;
	nlh.level = n_levelName;
	delete nlh["_id"];
	nlh._id = DesignerGameMaps.insert(nlh); 

	var inv = DesignerGameMaps.findOne({type: 'inventory', levelId: clh._id});

	inv.creator = n_creator;
	inv.level = n_levelName;
	inv.levelId = nlh._id;
	delete inv["_id"];

	DesignerGameMaps.insert(inv);


	return nlh._id;

}



function updateKey(id, isRemove){

	var cl = Session.get('currentLevel');

	if(!isRemove){
		if(cl.mapKey.indexOf(id) == -1){
			cl.mapKey.push(id);
		}
	}

	for(e in cl.mapKey){


		(function(){

		 
		var elem = getElement(cl.mapKey[e]);
		var rmv = true;

		if(elem.type == 'keyhole'){

			for(var y = 0; y < cl.height; y++){
				if(!rmv)break;
				for(var x = 0; x < cl.width; x++){
					if(!rmv)break;
					for(var i = 0; i < 4; i++){
						if(cl.cells[y][x][elem.type][i] == elem._id){
							rmv = false;
							break;
						}
					}
					
				}
				
			}

		}else if(elem.type == 'soundField'){

			for(var y = 0; y < cl.height; y++){
				if(!rmv)break;
				for(var x = 0; x < cl.width; x++){
					if(!rmv)break;
					for(item in cl.cells[y][x].soundFieldTraces){
						if(item == elem._id){
							rmv = false;break;
						}
					}
					
				}
			}

		}else{

			for(var y = 0; y < cl.height; y++){
				if(!rmv)break;
				for(var x = 0; x < cl.width; x++){
					if(cl.cells[y][x][elem.type] == elem._id){
						rmv = false; 
						break;
					}
				}
			}
		}

		if(cl.mapKey.indexOf(elem._id) > -1 && rmv == true){
			cl.mapKey.splice(cl.mapKey.indexOf(elem._id),1);
		}

		})();

	}



	Session.set('currentLevel', cl);
	DesignerGameMaps.update(cl._id, {$set:{mapKey: cl.mapKey}});

	updateCurrentView();

}

function updateLevelInventory(){

	var inv = DesignerGameMaps.findOne({type: 'inventory', levelId: Session.get("currentLevel")._id});
	var pickupables = {};
	var keyholes = {};
	var id = Session.get("currentLevel")._id;
	var cl = Session.get('currentLevel');

	for(var y = 0; y < cl.height; y++){
		for(var x = 0; x < cl.width; x++){

			if(cl.cells[y][x]['pickupable'] != 'none'){
				if(typeof pickupables[x] === 'undefined')pickupables[x] = {};
				var p = getElement(cl.cells[y][x]['pickupable']);
				pickupables[x][y] = p._id;
			}

			if(Object.keys(cl.cells[y][x]['keyhole']).length > 0){
				if(typeof keyholes[x] === 'undefined')keyholes[x] = {};
					keyholes[x][y] = {};

					for(var i = 0; i < 4; i++){
						if(typeof cl.cells[y][x]['keyhole'][i] !== 'undefined'){
							var k = getElement(cl.cells[y][x]['keyhole'][i]);
							keyholes[x][y][i] = {id: k._id, locked: true};
						}
				}

			}
		}
	}

	DesignerGameMaps.update(inv._id, {$set: {pickupables: pickupables, keyholes: keyholes}});

}

Template.mapKey.created = function(){

	updateCurrentView();

}

Template.mapKey.elemTerrain = function(){return this.type == 'terrain';}
Template.mapKey.elemExitPoint = function(){return this.type == 'exitPoint';}
Template.mapKey.elemWall = function(){return this.type == 'wall';}
Template.mapKey.elemPickupable = function(){return this.type == 'pickupable';}
Template.mapKey.elemKeyhole = function(){return this.type == 'keyhole';}
Template.mapKey.elemSimpleSound = function(){return this.type == 'simpleSound';}
Template.mapKey.elemSoundField = function(){return this.type == 'soundField';}

Template.mapKey.visible = function(type){

	var cv = Session.get('currentView');

	if(typeof type === 'undefined'){	
		return (cv[this._id])? 'checked' : '';
	}else{
		return(cv['entryPoint'])? 'checked' : '';
	}
}

Template.mapKey.events({

	'click input':function(e){

		var cv = Session.get('currentView');
		cv[e.currentTarget.id ] = !cv[e.currentTarget.id ];
		Session.set('currentView', cv);

	}
})


function updateCurrentView(){

	var mk = Session.get('currentLevel').mapKey;
	var cv = Session.get('currentView');

	if(typeof cv === 'undefined'){
		cv = {};
		for(item in mk){
			cv[mk[item]] = true;
		}

		cv['entryPoint'] = true;

	}else{
		for(item in mk){
			if(typeof cv[mk[item]] === 'undefined')cv[mk[item]] = true;
		}
	}

	Session.set('currentView', cv);

}







