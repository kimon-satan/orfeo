Template.levelDesigner.created = function(){

	Session.set("terrainKey", []);
	
	Session.set("currentTerrain", "none");
	Session.set("currentLevel", DesignerGameMaps.findOne({type: 'cell', x: 0, y: 0}));
	updateTerrainKey();

	Meteor.defer(function(){

  	$('#' + Session.get("currentLevel")._id + ' > td').addClass('selected');
  	$('#' + Session.get("currentLevel")._id).addClass('selected');

  	});


}

Template.levelDesigner.events({

	'click .terrainOption':function(e){

		Session.set("currentTerrain", e.currentTarget.id);
		e.preventDefault();
	},

	'click #addLevel':function(e){

		var level = Session.get("currentLevel");
		var name = $('#levelName').val();
		makeLevelCopy(level.level, level.creator, name, Meteor.user()._id, function(err){
			if(err)alert(err);
		})
		e.preventDefault();

	},

	'click #removeLevel':function(e){

		//safeties needed here

		var level = Session.get("currentLevel");
		DesignerGameMaps.find({level: level.level, creator: level.creator}).forEach(function(cell){
			DesignerGameMaps.remove(cell._id);
		});

		Session.set("currentLevel", DesignerGameMaps.findOne({type: 'cell', x: 0, y: 0}));

		$('#' + Session.get("currentLevel")._id + ' > td').addClass('selected');
  		$('#' + Session.get("currentLevel")._id).addClass('selected');

		e.preventDefault();
		
	},

	'click #updateLevel':function(e){

	},

	'click .designerCell':function(e){

		var loc = e.currentTarget.id.split("-");
		
		var cell = DesignerGameMaps.findOne({type: 'cell', 
			creator: Session.get("currentLevel").creator, 
			level: Session.get("currentLevel").level, 
			x: parseInt(loc[0]), y: parseInt(loc[1])});

		DesignerGameMaps.update(cell._id ,{$set:{terrain: Session.get("currentTerrain")}});
		updateTerrainKey();
	}


});

Template.levelDesigner.currentLevel = function(){return Session.get("currentLevel").level;}
Template.levelDesigner.currentTerrain = function(){return Session.get("currentTerrain");}
Template.levelDesigner.terrainsUsed = function(){return Session.get("terrainKey");};

Template.terrainMap.mapRow = function(){
	return DesignerGameMaps.find({
	type: 'cell', 
	creator: Session.get("currentLevel").creator,
	level: Session.get("currentLevel").level,
	 x: 0},
	 {sort: ["y", "asc"]}).fetch();
}

Template.terrainMap.mapCol = function(y){
	return DesignerGameMaps.find({
		type: 'cell', 
		creator: Session.get("currentLevel").creator, 
		level: Session.get("currentLevel").level, y: y},
		{sort: ["x", "asc"]}).fetch();
}



Template.levelTable.levels = function(){return DesignerGameMaps.find({type: 'cell', x: 0, y: 0}).fetch()}
Template.levelTable.creatorName = function(){return getCreatorName(this.creator)}

Template.levelTable.events({

	'click .levelRow':function(e){

		Session.set("currentLevel", DesignerGameMaps.findOne(e.currentTarget.id));

		$('.levelRow').removeClass('selected');
		$('.levelRow > td' ).removeClass('selected');
		$('#' + e.currentTarget.id + ' > td').removeClass('subSelected');
		$('#' + e.currentTarget.id).removeClass('subSelected');
		$('#' + e.currentTarget.id + ' > td').addClass('selected');
		$('#' + e.currentTarget.id).addClass('selected');
		$('#updatelevel').removeClass("disable");
		$('#updatelevel').removeAttr('disabled');
		$('#removelevel').removeClass("disable");
		$('#removelevel').removeAttr('disabled');
		$('#addlevel').addClass("disable");
		$('#addlevel').attr('disabled','disabled');

	},

	'mouseenter .levelRow':function(e){

		var ct = DesignerGameMaps.findOne(e.currentTarget.id);

		$('.levelRow').removeClass('subSelected');
		$('.levelRow > td' ).removeClass('subSelected');

		if(ct._id != Session.get("currentLevel")._id){
			$('#' + ct._id + ' > td').addClass('subSelected');
			$('#' + ct._id).addClass('subSelected');
		}
	}


});

/*------------------------------------TERRAIN MAKER---------------------------------------------*/

UI.registerHelper('terrains', function(){return DesignerGameDefs.find({type: "terrain"}).fetch()});

Template.terrainMaker.created = function(){

  var ct = DesignerGameDefs.findOne({type: "terrain"});

  Session.set("currentTerrain", ct);

  Meteor.defer(function(){

  	$('#' + ct.name + ' > td').addClass('selected');
  	$('#' + ct.name).addClass('selected');
  	$('#addTerrain').addClass("disable");
	$('#addTerrain').attr('disabled','disabled');
	$('#colPicker').colorpicker();

  });


}



Template.terrainMaker.events({

	'changeColor #colPicker':function(e){

		var ct = Session.get("currentTerrain");
		ct.color = e.color.toHex();
		Session.set("currentTerrain", ct);

	},

	'keyup #terrainName':function(e){

		ct = Session.get("currentTerrain");
		ct.name = $('#terrainName').val();
		Session.set("currentTerrain", ct);

		$('.terrainRow').removeClass('selected');
		$('.terrainRow > td' ).removeClass('selected');

		if(DesignerGameDefs.findOne({type: "terrain", name: ct.name})){
			$('#addTerrain').addClass("disable");
			$('#addTerrain').attr('disabled','disabled');

		}else{

			$('#addTerrain').removeClass("disable");
			$('#addTerrain').removeAttr('disabled');
			$('#removeTerrain').addClass("disable");
			$('#removeTerrain').attr('disabled','disabled');
			$('#updateTerrain').addClass("disable");
			$('#updateTerrain').attr('disabled','disabled');
		}

		e.preventDefault();
	},

	'click #addTerrain':function(e){

		ct = Session.get("currentTerrain");
		ct.creator = Meteor.user()._id;
		delete ct['_id'];

		DesignerGameDefs.insert(ct, function(err){
				if(err){alert(err.reason)}else{
					$('#' + ct.name + ' > td').addClass('selected');
  					$('#' + ct.name).addClass('selected');
  					$('#addTerrain').addClass("disable");
					$('#addTerrain').attr('disabled','disabled');
				}
			} );



		e.preventDefault();
	},

	'click #removeTerrain':function(e){

		if(confirm("are you sure you want to delete " + Session.get("currentTerrain").name + "... " )){	
			//do this by searching for name first
			DesignerGameDefs.remove(Session.get("currentTerrain")._id, function(err){if(err){alert(err.reason)}});
		}
			
		e.preventDefault();
	},

	'click #updateTerrain':function(e){

		var td = DesignerGameDefs.findOne(Session.get("currentTerrain")._id); //check theres a terrain

		if(td){
			DesignerGameDefs.update(td._id, {$set: { 
				color: Session.get("currentTerrain").color,
				background: Session.get("currentTerrain").background,
				footsteps: Session.get("currentTerrain").footsteps,
				narrator: Session.get("currentTerrain").narrator
			}}, function(err){
				if(err){alert(err.reason)}
			});
		}
		
		e.preventDefault();
	}



});




Template.terrainMaker.currentTerrain = function(){return Session.get("currentTerrain");}
Template.terrainTable.creatorName = function(){return getCreatorName(this.creator)}

Template.terrainTable.events({

	'click .terrainRow':function(e){

		Session.set("currentTerrain", DesignerGameDefs.findOne({type: 'terrain', name: e.currentTarget.id}));

		$('.terrainRow').removeClass('selected');
		$('.terrainRow > td' ).removeClass('selected');
		$('#' + e.currentTarget.id + ' > td').removeClass('subSelected');
		$('#' + e.currentTarget.id).removeClass('subSelected');
		$('#' + e.currentTarget.id + ' > td').addClass('selected');
		$('#' + e.currentTarget.id).addClass('selected');
		$('#updateTerrain').removeClass("disable");
		$('#updateTerrain').removeAttr('disabled');
		$('#removeTerrain').removeClass("disable");
		$('#removeTerrain').removeAttr('disabled');
		$('#addTerrain').addClass("disable");
		$('#addTerrain').attr('disabled','disabled');

	},

	'mouseenter .terrainRow':function(e){

		$('.terrainRow').removeClass('subSelected');
		$('.terrainRow > td' ).removeClass('subSelected');

		if(e.currentTarget.id != Session.get("currentTerrain").name){
			$('#' + e.currentTarget.id + ' > td').addClass('subSelected');
			$('#' + e.currentTarget.id).addClass('subSelected');
		}
	}


});


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
			terrainObj.background.folder  = $(e.currentTarget.id).selector;
			terrainObj.background.audioFile  = "none";
		}else if($(e.currentTarget).hasClass('Footsteps')){
			terrainObj.footsteps.folder  = $(e.currentTarget.id).selector;
			terrainObj.footsteps.audioFile  = "none";
		}else{
			terrainObj.narrator.folder  = $(e.currentTarget.id).selector;
			terrainObj.narrator.audioFile  = "none";
		}

		Session.set("currentTerrain", terrainObj);

		e.preventDefault();
	},

	'click .fileOption':function(e){

		var terrainObj = Session.get("currentTerrain");

		if($(e.currentTarget).hasClass('Background')){
			terrainObj.background.audioFile  =  $(e.currentTarget.id).selector;
		}else if($(e.currentTarget).hasClass('Footsteps')){
			terrainObj.footsteps.audioFile  =  $(e.currentTarget.id).selector;
		}else{
			terrainObj.narrator.audioFile  =  $(e.currentTarget.id).selector;
		}

		Session.set("currentTerrain", terrainObj);

		e.preventDefault();
	},

	'click .ampBox':function(e){

		var terrainObj = Session.get("currentTerrain");

		console.log(parseFloat(e.currentTarget.value));

		if($(e.currentTarget).hasClass('Background')){
			terrainObj.background.amp  =  parseFloat(e.currentTarget.value);
		}else if($(e.currentTarget).hasClass('Footsteps')){
			terrainObj.footsteps.amp  =  parseFloat(e.currentTarget.value);
		}else{
			terrainObj.narrator.amp  = parseFloat(e.currentTarget.value);
		}

		Session.set("currentTerrain", terrainObj);

		e.preventDefault();
	}


});


/*-------------------------------HELPER FUNCTIONS------------------------------------*/

function makeLevelCopy(o_levelName, o_creator, n_levelName, n_creator, callBack){

	var err;

	if(DesignerGameMaps.findOne({level: n_levelName, creator: n_creator}))err = "please choose a new name and try again";

	if(typeof err == "undefined"){
		DesignerGameMaps.find({level: o_levelName, creator: o_creator}).forEach(function(elem){
			elem.level = n_levelName;
			elem.creator = n_creator;
			delete elem["_id"];

			//copy over all the terrains
			if(!DesignerGameDefs.findOne({type: "terrain", name: elem.terrain, creator: n_creator})){

				var t = DesignerGameDefs.findOne({type: "terrain", name: elem.terrain, creator: o_creator});
				if(t){
					delete t["_id"];
					t.creator = n_creator;
					DesignerGameDefs.insert(t);
				}
			}

			//this will need to be done for the other elements in the cell

			DesignerGameMaps.insert(elem);
		});
	}

	if(typeof callBack === "function")callBack(err);

}

function getCreatorName(id){

	var u = Meteor.users.findOne(id);
	var un =  (u) ? u.username : id;
	return un;
}


function updateTerrainKey(){

	var terrains = Session.get("terrainKey");
	var cells = DesignerGameMaps.find({type: 'cell', level: Session.get("currentLevel").level});

	cells.forEach(function(cell){

		if(cell.terrain == "none")return;
		var found  = false;
		var col = DesignerGameDefs.findOne({type: 'terrain', name: cell.terrain}).color;

		for(var i = 0; i < terrains.length; i ++){
			if(terrains[i].name == cell.terrain){
				found = true;
				break;
			}
		}

		if(!found)terrains.push({name: cell.terrain, color: col});

		DesignerGameMaps.update(cell._id, {$set: {color: col}});

	});

	Session.set("terrainKey", terrains);

	UI.render(Template.terrainMap);

}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


