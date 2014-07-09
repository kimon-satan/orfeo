Template.sandbox.created = function(){

	selectALevel(); //prevents crash on boot
	Meteor.defer(function(){
		selectALevel();
		setPlayerPos();
		resetInventory();

	});

}

Template.sandboxLevelSelector.events({

	'click .levelRow':function(e){

		Session.set("currentLevel", DesignerGameMaps.findOne({type: 'levelHeader', _id: e.currentTarget.id}));

		playerPos = setPlayerPos();
		resetInventory();

		if(Session.get("screenMode") > 0){

			Session.set("screenMode", 0);
			audio.killAll();

    	}

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


Template.sandboxControls.events({

	'click .posctrl':function(e){

		var playerPos = PlayerGameData.findOne({player: Meteor.user()._id, type: "pos"});
		playerPos.x = $('#ppx').val();
		playerPos.y = $('#ppy').val();
		PlayerGameData.update(playerPos._id, {$set: {x: playerPos.x, y: playerPos.y}});

		if(Session.get("screenMode") > 0){
			nTerrain = getCell(playerPos.x , playerPos.y);
			updateGameCellAudio(cTerrain, nTerrain);
	        cTerrain = nTerrain;
	    }

        e.preventDefault();

	},



	'blur .posctrl':function(e){

		

			var playerPos = PlayerGameData.findOne({player: Meteor.user()._id, type: "pos"});
			playerPos.x = $('#ppx').val();
			playerPos.y = $('#ppy').val();

			playerPos.x = Math.min(playerPos.x, DesignerGameMaps.findOne(Session.get("currentLevel")._id).width - 1);
			playerPos.y = Math.min(playerPos.y, DesignerGameMaps.findOne(Session.get("currentLevel")._id).height - 1);

			PlayerGameData.update(playerPos._id, {$set: {x: playerPos.x, y: playerPos.y}});

			$('#ppx').val(playerPos.x);
			$('#ppy').val(playerPos.y);

		if(Session.get("screenMode") > 0){
			nTerrain = getCell(playerPos.x , playerPos.y);
			updateGameCellAudio(cTerrain, nTerrain);
	        cTerrain = nTerrain;
	    }

        e.preventDefault();

	}

});

Template.sandboxControls.playerPos = function(){

	return PlayerGameData.findOne({player: Meteor.user()._id, type: "pos"});

}

Template.sandboxControls.levelWidth = function(){
	return DesignerGameMaps.findOne(Session.get("currentLevel")._id).width - 1;
}

Template.sandboxControls.levelHeight = function(){
	return DesignerGameMaps.findOne(Session.get("currentLevel")._id).height - 1;
}

function setPlayerPos(){

	var playerPos = PlayerGameData.findOne({player: Meteor.user()._id, type: "pos"});
	var ep0 = DesignerGameMaps.findOne({levelId: Session.get("currentLevel")._id, entryPoint: 0});

	playerPos.x = ep0.x; playerPos.y = ep0.y;

	PlayerGameData.update(playerPos._id, {$set: {x: playerPos.x, y: playerPos.y}});

	return playerPos;

}

function resetInventory(){

	var inv = PlayerGameData.findOne({player: Meteor.user()._id, type: 'inventory'});
	if(inv)PlayerGameData.remove(inv._id);
	var n_inv = {player: Meteor.user()._id, type: "inventory", pickupables: {}, bag: [], keyholes: {}};
	var pus = DesignerGameMaps.findOne({type: "inventory", levelId: Session.get("currentLevel")._id}).pickupables;
	var keys = DesignerGameMaps.findOne({type: "inventory", levelId: Session.get("currentLevel")._id}).keyholes;
	n_inv.pickupables[Session.get("currentLevel")._id] = pus;
	n_inv.keyholes[Session.get("currentLevel")._id] = keys;
	PlayerGameData.insert(n_inv);

}



