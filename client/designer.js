Template.terrainMaker.created = function(){

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
	}


});

Template.terrainTable.terrains = function(){return GameDefsRelease.find({type: "terrain"}).fetch();}
Template.terrainTable.creatorName = function(){return Meteor.users.findOne(this.creator).username;}

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