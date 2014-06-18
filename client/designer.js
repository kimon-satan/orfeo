Template.levelDesigner.created = function(){

	Session.set("terrainKey", []);
	
	Session.set("currentTerrain", "none");
	Session.set("currentLevel", DesignerGameMaps.findOne({type: 'levelHeader', creator: "server"}));
	//updateTerrainKey();

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

Template.levelDesigner.currentLevel = function(){return Session.get("currentLevel");}
Template.levelDesigner.currentTerrain = function(){return Session.get("currentTerrain");}
Template.levelDesigner.terrainsUsed = function(){

	var k = DesignerGameMaps.findOne(Session.get("currentLevel")._id).terrainKey;
	return DesignerGameDefs.find({type: 'terrain', name: {$in: k}, creator: Session.get("currentLevel").creator}, {fields: {color: 1, name: 1}}).fetch();

}

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

Template.terrainMap.cellColor = function(){

	var t = DesignerGameDefs.findOne({creator: Session.get("currentLevel").creator, type: 'terrain', name: this.terrain});
	if(!t){
		return 'FFFFFF'
	}else{
		return t.color;
	}

}



Template.levelTable.levels = function(){return DesignerGameMaps.find({type: 'levelHeader'}).fetch()}
Template.levelTable.creatorName = function(){return getCreatorName(this.creator)}

Template.levelTable.events({

	'click .levelRow':function(e){

		Session.set("currentLevel", DesignerGameMaps.findOne(e.currentTarget.id));
		updateTerrainKey();

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

getCreatorName = function(id){

	var u = Meteor.users.findOne(id);
	var un =  (u) ? u.username : id;
	return un;
}


function updateTerrainKey(){

	var terrains = []; 

	DesignerGameDefs.find({type: 'terrain', creator: Meteor.user()._id}).forEach(function(t){

		if(DesignerGameMaps.findOne({type: 'cell', level: Session.get("currentLevel").level, creator: Meteor.user()._id, terrain: t.name})){

			terrains.push(t.name);

		}

	});

	DesignerGameMaps.update(Session.get("currentLevel")._id, {$set:{terrainKey: terrains}});
	//UI.render(Template.terrainMap);

}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


