Template.levelDesigner.created = function(){
	
	Session.set("currentTerrain", DesignerGameDefs.findOne({creator: Meteor.user()._id}));
	Session.set("currentLevel", DesignerGameMaps.findOne({type: 'levelHeader', creator: "server"}));

	Meteor.defer(function(){

  	$('#' + Session.get("currentLevel")._id + ' > td').addClass('selected');
  	$('#' + Session.get("currentLevel")._id).addClass('selected');

  	});


}

Template.levelDesigner.events({

	'click .terrainOption':function(e){

		Session.set("currentTerrain", DesignerGameDefs.findOne({name: e.currentTarget.id, creator: Meteor.user()._id }));
		e.preventDefault();
	},

	'click #copyLevel':function(e){

		var level = Session.get("currentLevel");
		makeLevelCopy(level.level, level.creator, level.level, Meteor.user()._id);
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


	'click .designerCell':function(e){

		var loc = e.currentTarget.id.split("-");

		var cell = DesignerGameMaps.findOne({type: 'cell', 
			creator: Session.get("currentLevel").creator, 
			level: Session.get("currentLevel").level, 
			x: parseInt(loc[0]), y: parseInt(loc[1])});
		

		DesignerGameMaps.update(cell._id ,{$set:{terrain: Session.get("currentTerrain")._id}});
		updateTerrainKey();
		
	}


});

Template.levelDesigner.currentLevel = function(){return Session.get("currentLevel")}
Template.levelDesigner.currentTerrain = function(){return Session.get("currentTerrain")}
Template.levelDesigner.terrainsUsed = function(){

	var k = DesignerGameMaps.findOne(Session.get("currentLevel")._id).terrainKey;
	return DesignerGameDefs.find({ _id: {$in: k} }, {fields: {color: 1, name: 1}}).fetch();

}

Template.terrainMap.mapRow = function(){
	console.log(DesignerGameMaps.find({
	type: 'cell', 
	creator: Session.get("currentLevel").creator,
	level: Session.get("currentLevel").level,
	 x: 0},
	 {sort: ["y", "asc"]}).fetch().length

		);
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

	var t = DesignerGameDefs.findOne(this.terrain);
	if(!t){
		return 'FFFFFF';
	}else{
		return t.color;
	}

}



Template.levelTable.levels = function(){return DesignerGameMaps.find({type: 'levelHeader'}).fetch()}
Template.levelTable.creatorName = function(){return getCreatorName(this.creator)}

Template.levelTable.events({

	'click .levelRow':function(e){

		Session.set("currentLevel", DesignerGameMaps.findOne(e.currentTarget.id));
		console.log(Session.get("currentLevel"));
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

getCreatorName = function(id){

	var u = Meteor.users.findOne(id);
	var un =  (u) ? u.username : id;
	return un;
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

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


