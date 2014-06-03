Template.levelDesigner.created = function(){

	Session.set("currentTerrain", "none");
}

Template.levelDesigner.events({

	'click .terrainOption':function(e){

		Session.set("currentTerrain", e.currentTarget.id);
		e.preventDefault();
	},

	'click .cell':function(e){

		var loc = e.currentTarget.id.split("-");
		var cell = GameMapRelease.findOne({type: 'cell', level:'init', x: parseInt(loc[0]), y: parseInt(loc[1])});
		GameMapRelease.update(cell._id ,{$set:{terrain: Session.get("currentTerrain")}});
	}

});

Template.levelDesigner.currentTerrain = function(){
	return Session.get("currentTerrain");
}

Template.terrainMap.mapRow = function(){return GameMapRelease.find({type: 'cell', level:'init', x: 0}).fetch();}
Template.terrainMap.mapCol = function(y){return GameMapRelease.find({type: 'cell', level:'init', y: y}).fetch();}

Template.terrainMaker.created = function(){

  Session.set("currentTerrain", "none");
  Session.set("currentBackgroundType", "none");
  Session.set("currentBackgroundFile", "none");
  Session.set("currentFootstepsType", "none");
  Session.set("currentFootstepsFile", "none");
  Session.set("currentNarratorType", "none");
  Session.set("currentNarratorFile", "none");

}

Template.terrainMaker.events({

	'click #addTerrain':function(e){

		var terrainObj = {type: "terrain", creator: Meteor.user()._id};
		terrainObj.name = $('#terrainName').val();
		terrainObj.background = {folder: Session.get("currentBackgroundType"), 
								 audioFile: Session.get("currentBackgroundFile"), 
								amp: $('#bgAmp.Background').val()};

		terrainObj.footsteps= {folder: Session.get("currentFootstepsType"), 
						 audioFile: Session.get("currentFootstepsFile"), 
						amp: $('#bgAmp.Footsteps').val()};


		terrainObj.narrator = {folder: Session.get("currentNarratorType"), 
						 audioFile: Session.get("currentNarratorFile"), 
						amp: $('#bgAmp.Narrator').val()};


		GameDefsRelease.insert(terrainObj);

		e.preventDefault();
	},

	'click #removeTerrain':function(e){

		if(confirm("are you sure you want to delete " + Session.get("currentTerrain").name + "... " )){	
			GameDefsRelease.remove(Session.get("currentTerrain")._id, function(err){if(err){alert(err.reason)}});
		}
			
		e.preventDefault();
	},

	'click #updateTerrain':function(e){

		
		e.preventDefault();
	}



});

UI.registerHelper('terrains', function(){return GameDefsRelease.find({type: "terrain"}).fetch()});

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


if(Session.get("current" + type + "Type") == "none"){
    return AudioFiles.find({dt: 'file'}).fetch();
 }else{
  	return AudioFiles.find({dt: 'file', parent: Session.get("current" + type + "Type")}).fetch();
 }
}

Template.soundControls.audioTypes = function(){return AudioFiles.find({dt: 'type'}).fetch();}
Template.soundControls.currentType = function(type){return Session.get("current" + type + "Type");}
Template.soundControls.currentFile = function(type){return Session.get("current" + type + "File");}


Template.soundControls.events({

	'click .typeOption':function(e){
		

		if($(e.currentTarget).hasClass('Background')){
			Session.set("currentBackgroundType",$(e.currentTarget.id).selector);
			Session.set("currentBackgroundFile", "none");
		}else if($(e.currentTarget).hasClass('Footsteps')){
			Session.set("currentFootstepsType",$(e.currentTarget.id).selector);
			Session.set("currentFootstepsFile", "none");
		}else{
			Session.set("currentNarratorType",$(e.currentTarget.id).selector);
			Session.set("currentNarratorFile", "none");
		}
		e.preventDefault();
	},

	'click .fileOption':function(e){

		if($(e.currentTarget).hasClass('Background')){
			Session.set("currentBackgroundFile", $(e.currentTarget.id).selector);
		}else if($(e.currentTarget).hasClass('Footsteps')){
			Session.set("currentFootstepsFile", $(e.currentTarget.id).selector);
		}else{
			Session.set("currentNarratorFile", $(e.currentTarget.id).selector);
		}
		e.preventDefault();
	}


});