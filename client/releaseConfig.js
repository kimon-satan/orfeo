Template.designRelease.initialLevel = function(){

	return GameMapRelease.findOne({type: 'levelHeader', isInit: true});
}

Template.configReleaseTable.events({


	'click #setInit':function(event) {

		if(confirm("Are you sure you want to do this ? All previous release data will be overwritten.")){

			if(DesignerGameMaps.findOne(Session.get("currentLevel")._id)){

				//first clear everything
				GameMapRelease.find({}).forEach(function(item){
					GameMapRelease.remove(item._id);
				});

				GameDefsRelease.find({}).forEach(function(item){
					GameDefsRelease.remove(item._id);
				});

				makeReleaseCopy();

				Meteor.call('initAllPlayers', Meteor.user()._id);

			}else{
				alert('select a level first');
			}

		}
		

		event.preventDefault();
	},

	'click .levelRow':function(e){

		Session.set("currentLevel", DesignerGameMaps.findOne({type: 'levelHeader', _id: e.currentTarget.id}));

		$('.levelRow').removeClass('selected');
		$('.levelRow > td' ).removeClass('selected');
		$('#' + e.currentTarget.id + ' > td').removeClass('subSelected');
		$('#' + e.currentTarget.id).removeClass('subSelected');
		$('#' + e.currentTarget.id + ' > td').addClass('selected');
		$('#' + e.currentTarget.id).addClass('selected');

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

function makeReleaseCopy(){


	//this just copies a single level 
	//will need to revise once links have been introduced

	var clh = DesignerGameMaps.findOne(Session.get("currentLevel")._id);
	clh.designId = clh._id;
	clh.isInit = true;
	delete clh["_id"];

	GameMapRelease.insert(clh, function(err, id){
		clh._id = id;
	

		DesignerGameMaps.find({type: 'cell', level: clh.level, creator: clh.creator}).forEach(function(elem){


			elem.designId = elem._id;
			elem.levelId = clh._id;
			delete elem["_id"];
			
			if(elem.terrain != "none"){
				var o_t = DesignerGameDefs.findOne(elem.terrain);
				var n_t = (o_t) ? GameDefsRelease.findOne({type: "terrain", name: o_t.name, creator: o_t.creator}) : true;
				elem.terrain = (n_t)? n_t._id : false;

				//copy over all the terrains
				if(!n_t){

					if(o_t){
						o_t.designId = o_t._id;
						delete o_t["_id"];
						GameDefsRelease.insert(o_t, function(err, id){ 
							elem.terrain = id;
							GameMapRelease.insert(elem);
						});
					}

				}else{

					GameMapRelease.insert(elem);
				}
				
				
			}

			//this will need to be done for the other elements in the cell ... think about how to manage callbacks ?!

			
		});

		return clh._id;

	});

}