Template.levelDesigner.created = function(){

	Session.set("currentKey", []);
	updateCurrentKey();
	Session.set("currentTerrain", "none");

}

Template.levelDesigner.events({

	'click .terrainOption':function(e){

		Session.set("currentTerrain", e.currentTarget.id);
		e.preventDefault();
	},

	'click .designerCell':function(e){

		var loc = e.currentTarget.id.split("-");
		var cell = GameMapRelease.findOne({type: 'cell', level:'init', x: parseInt(loc[0]), y: parseInt(loc[1])});
		GameMapRelease.update(cell._id ,{$set:{terrain: Session.get("currentTerrain")}});
		updateCurrentKey();
	}

});

Template.levelDesigner.currentTerrain = function(){
	return Session.get("currentTerrain");
}

UI.registerHelper('terrains', function(){return GameDefsRelease.find({type: "terrain"}).fetch()});

Template.levelDesigner.terrainsUsed = function(){

	return Session.get("currentKey");

};

function updateCurrentKey(){

	var terrains = Session.get("currentKey");
	var cells = GameMapRelease.find({type: 'cell', level: 'init'});

	cells.forEach(function(cell){

		var found  = false;
		for(var i = 0; i < terrains.length; i ++){
			if(terrains[i].name == cell.terrain){
				found = true;
				GameMapRelease.update(cell._id, {$set: {color: terrains[i].color}});
				break;
			}
		}

		if(!found){
			
			if(typeof cell.color === "undefined"){
				var col = getRandomColor();
			}else{
				var col = cell.color;	
			}
			
			terrains.push({name: cell.terrain, color: col});
			GameMapRelease.update(cell._id, {$set: {color: col}});
		}



	});

	Session.set("currentKey", terrains);

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


Template.terrainMap.mapRow = function(){return GameMapRelease.find({type: 'cell', level:'init', x: 0}).fetch();}
Template.terrainMap.mapCol = function(y){return GameMapRelease.find({type: 'cell', level:'init', y: y}).fetch();}

Template.terrainMaker.created = function(){

  var ct = GameDefsRelease.findOne({type: "terrain"});

  Session.set("currentTerrain", ct);

  Meteor.defer(function(){

  	$('#' + ct.name + ' > td').addClass('selected');
  	$('#' + ct.name).addClass('selected');
  	$('#addTerrain').addClass("disable");
	$('#addTerrain').attr('disabled','disabled');

  })


}

Template.terrainMaker.events({

	'keyup #terrainName':function(e){

		ct = Session.get("currentTerrain");
		ct.name = $('#terrainName').val();
		Session.set("currentTerrain", ct);

		$('.terrainRow').removeClass('selected');
		$('.terrainRow > td' ).removeClass('selected');

		if(GameDefsRelease.findOne({type: "terrain", name: ct.name})){
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

		GameDefsRelease.insert(ct, function(err){
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
			GameDefsRelease.remove(Session.get("currentTerrain")._id, function(err){if(err){alert(err.reason)}});
		}
			
		e.preventDefault();
	},

	'click #updateTerrain':function(e){

		var td = GameDefsRelease.findOne(Session.get("currentTerrain")._id); //check theres a terrain
		console.log(td);
		if(td){
			GameDefsRelease.update(td._id, {$set: { 
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




Template.terrainTable.creatorName = function(){return Meteor.users.findOne(this.creator).username;}
Template.terrainTable.events({

	'click .terrainRow':function(e){

		Session.set("currentTerrain", GameDefsRelease.findOne({type: 'terrain', name: e.currentTarget.id}));

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