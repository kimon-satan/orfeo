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

				makeReleaseCopy(Session.get('currentLevel')._id, true);

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


function makeReleaseCopy(levelId, isInit){

	var clh = DesignerGameMaps.findOne(levelId);
	clh.isInit = isInit;
	
	//add the new depenencies and convert the mapKey

	for(var i = 0; i < clh.mapKey.length; i ++){

		var o_t = DesignerGameDefs.findOne(clh.mapKey[i]);
		var n_t = GameDefsRelease.findOne(clh.mapKey[i]);

		if(!n_t)GameDefsRelease.insert(o_t);

	}

	GameMapRelease.insert(clh); 

	var inventory = DesignerGameMaps.findOne({type: 'inventory', levelId: levelId});

	GameMapRelease.insert(inventory);

	DesignerGameMaps.find({type: 'cell', levelId: clh._id}).forEach(function(elem){

		GameMapRelease.insert(elem);
		
		if(elem.exitPoint != 'none'){

			var ep = DesignerGameDefs.findOne(elem.exitPoint);

			if(ep.exitTo != clh._id && !GameMapRelease.findOne(ep.exitTo)){
				makeReleaseCopy(ep.exitTo, false);
			}
		}		

	});

}

