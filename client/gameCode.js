//TODO ->
//        sandbox jump to square no longer works due to refactoring
//    also disable inventory for audio running


audio = 0;
cTerrain = 0;
nTerrain = 'none';
soundFieldLoops = {};
cSimpleSound = 'none';
cell = {};
inv = {};
playerPos = {};
isAudioLock = false;
isPickup = false;
maxBagItems = 5;



Template.game.created = function(){

     var id = Meteor.user()._id;

//console.log(id);

Meteor.subscribe("PlayerGameData", id, { onReady: function(){

     Meteor.subscribe("AudioFiles",{}, {onReady: function(){

          if(!Session.get("isAudioInit"))startAudio();
     }});

}});

// console.log("subscribe");


}

Template.game.isStartSplash = function(){
     return Session.get("screenMode") == 0;
};

Template.game.isNavScreen = function(){
     return Session.get("screenMode") == 1;
};

Template.game.isInventoryScreen = function(){
     return Session.get("screenMode") == 2;
};

Template.game.isInGameRegister = function(){
     return Session.get("screenMode") == 3;
};


Template.game.destroyed = function(){

     audio.killAll();
     Session.set('isAudioInit', false);
     Session.set('screenMode', 0);
}

Template.startSplash.events({

     'click #begin':function(e){

          Session.set("screenMode", 1);

          var level = PlayerGameData.findOne({player: Meteor.user()._id, type: "level"});

          if(checkClientIsDesigner()){
               PlayerGameData.update(level._id, {$set: {level: Session.get('currentLevel')._id}});
          }else{
               Session.set('currentLevel', getLevel(level.id));
          }

          playerPos = PlayerGameData.findOne({player: Meteor.user()._id, type: "pos"});
          cell = getCell(playerPos.x, playerPos.y);
          cTerrain = getElement(cell.terrain);
          nTerrain = 'none';
          soundFieldLoops = {};
          inv = PlayerGameData.findOne({player: Meteor.user()._id , type: "inventory" });
          cSimpleSound = 'none';

          handleBegin(cell, playerPos);

          e.preventDefault();
     }

});




/*----------------------------------------------------------------------------------------------*/

Template.navScreen.created = function(){

     Meteor.defer(function(){

          if(isAudioLock){
               $('.toggleBtn').addClass('disable');
               $('#where').removeClass('disable').addClass('active');
          }else{
               resetButtons();
          }

     });

}

Template.navScreen.events({

'click .step': function(event){

     if($(event.target).hasClass('disable'))return;
     if($(event.target).hasClass('active'))return;
     $(event.target).addClass('active');

     var id = event.target.id;

     $('.toggleBtn').not('#' + id).addClass('disable');

     if(id == "north")playerPos.y = Math.max(playerPos.y - 1, 0);
     if(id == "south")playerPos.y = Math.min(playerPos.y + 1, Session.get('currentLevel').height - 1); //these need turning into variables
     if(id == "east")playerPos.x = Math.min(playerPos.x + 1, Session.get('currentLevel').width - 1); //these need turning into variables
     if(id == "west")playerPos.x = Math.max(playerPos.x - 1, 0);

     cell = getCell(playerPos.x, playerPos.y);

     handleStep(function(){
          $(event.target).removeClass('active');
          $(event.target).addClass('disable');
     });

     event.preventDefault();

},  

'click #where': function(event){

     if($(event.target).hasClass('active'))return;
     if($(event.target).hasClass('disable'))return;
     $(event.target).addClass("active");
     $('.step').addClass('disable');

     
     audio.playOnce(cTerrain.narrator, resetButtons); //needs modding to play the whole sequence ?

     event.preventDefault();

},

'click #inventory':function(event){

     if($(event.target).hasClass('disable'))return;
     if($(event.target).hasClass('active'))return;

     Session.set("screenMode", 2);

     event.preventDefault();
}





});

/*-----------------------------------------Inventory -------------------------------*/

Template.inventoryScreen.events({

     'click #compass':function(e){

          Session.set("screenMode", 1);
          e.preventDefault();
     },

     'click .dropBagItem':function(e){

          if($(e.target).hasClass('disable'))return;

          var idx = findLockedKeyhole();

          if(idx < 0){

               handleDropItem(e.currentTarget.id);

          }else{

               handleKeyholeDrop(e.currentTarget.id, idx);
          }
         


          e.preventDefault();
     },

     'click .addPickupable':function(e){

          if($(e.target).hasClass('disable'))return;

          var pos = PlayerGameData.findOne({player: Meteor.user()._id, type: 'pos'});

          if(inv.bag.length > maxBagItems)return;

          if(typeof inv.pickupables[Session.get("currentLevel")._id][pos.x][pos.y] !== 'undefined'){
               inv.bag.push(inv.pickupables[Session.get("currentLevel")._id][pos.x][pos.y]);
               delete inv.pickupables[Session.get("currentLevel")._id][pos.x][pos.y];
               PlayerGameData.update(inv._id, {$set: {pickupables: inv.pickupables, bag: inv.bag}});
          }

          e.preventDefault();
     }

});

Template.inventoryScreen.bagFull = function(){
     return (inv.bag.length >= maxBagItems) ? 'disable' : "";
}

Template.inventoryScreen.groundFull = function(){

     var pos = PlayerGameData.findOne({player: Meteor.user()._id, type: 'pos'});

     if(findLockedKeyhole() > -1)return;

     if(inv.pickupables[Session.get("currentLevel")._id][pos.x] === undefined)return;

     return(inv.pickupables[Session.get("currentLevel")._id][pos.x][pos.y] === undefined) ? '' : 'disable';

}

Template.inventoryScreen.bagItems = function(){

     var bag = PlayerGameData.findOne({player: Meteor.user()._id , type: "inventory" }).bag;
     var items = [];

     for(item in bag){
          items.push(getElement(bag[item]));
     }

     return items;
}

Template.inventoryScreen.pickupables = function(){

     inv = PlayerGameData.findOne({player: Meteor.user()._id , type: "inventory" });
     var pos = PlayerGameData.findOne({player: Meteor.user()._id, type: 'pos'});
     var pu = [];


     var item;
     if(inv.pickupables[Session.get("currentLevel")._id][pos.x])item = inv.pickupables[Session.get("currentLevel")._id][pos.x][pos.y];
     var idx = findLockedKeyhole();

     if(idx > -1 && cell.pickupable == item ){
          item = false;
     }

     if(item)pu.push(getElement(item));
     

     return pu;

}

/*----------------------------------------helper functions----------------------------*/

function handleBegin(){

     isAudioLock = true;
     
     var audioArray = handleInteractives();

     handleSoundFieldTraces();

     handleTerrain(cTerrain, nTerrain, function(){

          playAudioSequence(audioArray, resetButtons);

     });
     
}

function handleStep(callback){

 
     isAudioLock = true;

     var audioArray;


     //part of step
     if(cell.wall != 'none' && typeof inv.overrides[cell.wall] === 'undefined'){

          nTerrain = cTerrain;
          handleWallAudio(getElement(cell.wall), resetButtons);
          playerPos = PlayerGameData.findOne(playerPos._id); //reset back to current position
          cell = getCell(playerPos.x, playerPos.y);

     }else{

          audioArray = handleInteractives();

          PlayerGameData.update(playerPos._id, {$set: {x: playerPos.x, y: playerPos.y}});
          nTerrain = getElement(cell.terrain);

          audio.playOnce(cTerrain.footsteps, function(){

               if(typeof callback !== 'undefined')callback();

               handleSoundFieldTraces();

               handleTerrain(cTerrain, nTerrain, function(){

                    playAudioSequence(audioArray, resetButtons);

               });

               cTerrain = nTerrain;        

          });

     }

}

function keyholeSuccess(idx){

     var kh = inv.keyholes[Session.get("currentLevel")._id][playerPos.x][playerPos.y][idx];

     kh.locked = false;

     var key = getElement(kh.id);

     if(key.removeWall != 'none'){
          inv.overrides[key.removeWall] = true;
     }

     inv.keyholes[Session.get("currentLevel")._id][playerPos.x][playerPos.y][idx] = kh;
     PlayerGameData.update(inv._id, {$set:{keyholes: inv.keyholes, overrides: inv.overrides}});

     var audioArray = handleInteractives();

     PlayerGameData.update(playerPos._id, {$set: {x: playerPos.x, y: playerPos.y}});

     handleSoundFieldTraces();

     nTerrain = getElement(cell.terrain);
     
     handleTerrain(cTerrain, nTerrain, function(){

          playAudioSequence(audioArray, function(){Session.set('screenMode', 1)});

     });

     cTerrain = nTerrain; 

}

function handleKeyholeDrop(id ,idx){

     var kh = inv.keyholes[Session.get("currentLevel")._id][playerPos.x][playerPos.y][idx];
                          
     var key = getElement(kh.id);

                              
     if(key.keyPickupable == id){
          console.log("match");
          var i = inv.bag.indexOf(id);
          if( ~i )inv.bag.splice(i, 1);
          PlayerGameData.update(inv._id, {$set:{bag: inv.bag}});

          if(key.trueSound.audioFile != 'none'){
               key.trueSound.index = kh.id + '_ts';
               audio.playOnce(key.trueSound, function(){keyholeSuccess(idx)});
          }else{
               keyholeSuccess(idx);
          }
          
          //this will be in a callback from the audio player

     }else{

          console.log("non match");
          if(key.falseSound.audioFile != 'none'){
               key.falseSound.index = kh.id + '_fs';
               audio.playOnce(key.falseSound, function(){ handleDropItem(id)});
          }else{
               handleDropItem(id);
          }
          
          
     }



}

function handleDropItem(id){

     if(typeof inv.pickupables[Session.get("currentLevel")._id][playerPos.x] === 'undefined')inv.pickupables[Session.get("currentLevel")._id][playerPos.x] = {};

     if(typeof inv.pickupables[Session.get("currentLevel")._id][playerPos.x][playerPos.y] === 'undefined'){

          console.log("remove: " + id);
          var i = inv.bag.indexOf(id);
          if( ~i )inv.bag.splice(i, 1);

          inv.pickupables[Session.get("currentLevel")._id][playerPos.x][playerPos.y] = id;
          PlayerGameData.update(inv._id, {$set: {pickupables: inv.pickupables, bag: inv.bag}});

     }else{
          console.log("square full");
          console.log(inv.pickupables[Session.get("currentLevel")._id][playerPos.x][playerPos.y]);
     }

}



function handleInteractives(){

     var audioArray = [];
     var isKeyOverride = false;
     isPickup = false;

     var idx = findLockedKeyhole();

     if(checkForKeyholes()){
          
          if(idx > -1){
               var lkh = inv.keyholes[Session.get("currentLevel")._id][playerPos.x][playerPos.y][idx];
               var key = getElement(lkh.id);
               isKeyOverride = true;
               if(key.preSound.audioFile != 'none'){
                    key.preSound.index =lkh.id + '_ps';
                    audioArray.push(key.preSound);
               }

          }
          
          for(var i = 0; i < 4; i++ ){ 
               if(i != idx){
                    var lkh = inv.keyholes[Session.get("currentLevel")._id][playerPos.x][playerPos.y][i];  
                    if(typeof lkh !== 'undefined'){ 
                         if(!lkh.locked){        
                              var key = getElement(lkh.id);
                              if(key.postSound.audioFile != 'none'){
                                   key.postSound.index = lkh.id + '_pos';
                                   audioArray.push(key.postSound);
                              }
                         }
                    }
               }
          }

     }
                         


     if(!isKeyOverride){

          if(cell.simpleSound != 'none'){

               if(cSimpleSound != cell.simpleSound){ //don't play simple sounds twice in a row
                    var ss = getElement(cell.simpleSound);
                    ss.index = cell.simpleSound;
                    audioArray.push(ss.sound);
               }
          }
          
          cSimpleSound = cell.simpleSound;

          if(cell.exitPoint != 'none'){
               cell = handleExitPoint(cell.exitPoint); //check whats here
               playerPos.x = cell.x; playerPos.y = cell.y;
          }
     }

     

     var lps = inv.pickupables[Session.get("currentLevel")._id];

     if(typeof lps[playerPos.x] !== 'undefined'){
          if(typeof lps[playerPos.x][playerPos.y] !== 'undefined'){


               if(!isKeyOverride || cell.pickupable != lps[playerPos.x][playerPos.y]){
                    var pu = getElement(lps[playerPos.x][playerPos.y]);
                    isPickup = true;
                    pu.narrator.index = lps[playerPos.x][playerPos.y];
                    audioArray.push(pu.narrator);
               }

          }
     }

     

     return audioArray;

}


function handleExitPoint(exitPointId){

     var ep = getElement(exitPointId);
     var level = getLevel(ep.exitTo);
     Session.set("currentLevel", level);

     updatePlayerInventory(level._id);

     if(checkClientIsDesigner()){
          updateCurrentLevel();
     }

     var cl = PlayerGameData.findOne({player: Meteor.user()._id , type: "level" });
     PlayerGameData.update(cl._id, {$set: {id: level._id}});

     var ep_i = getEntryCell(ep.entryIndex);

     return getCell(ep_i.x, ep_i.y);

}


function findLockedKeyhole(){

     if(checkForKeyholes()){

          var lkh = inv.keyholes[Session.get("currentLevel")._id][playerPos.x][playerPos.y];

          for(var i = 0; i < 4; i++){
               if(lkh[i] !== undefined){
                    if(lkh[i].locked)return i;
               }
          }
 
     }

     return -1;

}

function checkForKeyholes(){

     var lkh = inv.keyholes[Session.get("currentLevel")._id];

     if(typeof lkh[playerPos.x] !== 'undefined'){
          if(typeof lkh[playerPos.x][playerPos.y] !== 'undefined')return true;
     }

     return false;

}

function resetButtons(){

     isAudioLock = false;

     $('.active').removeClass('active');
     $('.step.disable').removeClass('disable');
     $('#where').removeClass('disable');
     $('#inventory').removeClass('disable');

     if(isPickup)Session.set('screenMode', 2);
     isPickup = false;


}


playAudioSequence = function(audioObjs, finalCallback){

     if(audioObjs.length > 0){

          $('#where').addClass('active');
          $('#where').removeClass('disable');

          var ao = audioObjs.shift();
          audio.playOnce(ao, function(){
               playAudioSequence(audioObjs, finalCallback);
          });
     }else{
          finalCallback();
     }

}

handleTerrain = function(cTerrain , nTerrain, callback){


     if(nTerrain == 'none'){

          $('#where').addClass('active');
          $('#where').removeClass('disable');

          cTerrain.background.index = cTerrain._id + '_bg';
          cTerrain.narrator.index = cTerrain._id + '_n';
          cTerrain.narrator.offset = 2;

          if(cTerrain.background.audioFile != 'none')audio.startLooping(cTerrain.background, 1);
          if(cTerrain.narrator.audioFile != 'none')audio.playOnce(cTerrain.narrator, callback);

     }else if(nTerrain._id!= cTerrain._id){

          var isNewBg = false;
          $('#where').addClass('active');
          $('#where').removeClass('disable');

          nTerrain.background.index = nTerrain._id + '_bg';
          nTerrain.narrator.index = nTerrain._id + '_n';
          nTerrain.narrator.offset = 2;

          if(nTerrain.background.audioFile != cTerrain.background.audioFile){
               audio.stopLooping(cTerrain._id + '_bg', 1);
               if(nTerrain.background.audioFile != 'none')audio.startLooping(nTerrain.background, 1);
               isNewBg = true;
          }

          if(nTerrain.narrator.audioFile != cTerrain.narrator.audioFile && nTerrain.narrator.audioFile != 'none'){
               nTerrain.narrator.offset = (isNewBg)? 2: 0;
               audio.playOnce(nTerrain.narrator, callback);
          }else{
               callback();
          }
          

     }else{

          callback();

     }

}

function handleSoundFieldTraces(){


     for(item in cell.soundFieldTraces){

          var elem = getElement(item);

          if(typeof soundFieldLoops[item] !== 'undefined'){
               //adjust volume
               console.log('adjust: ' + item);
               audio.setLoopAmp(item, cell.soundFieldTraces[item].amp);
          }else{
               //start the new loop
               console.log('start: ' + item);
               soundFieldLoops[item] = getElement(item);
               elem.sound.amp = cell.soundFieldTraces[item].amp; 
               elem.sound.index = item;
               audio.startLooping(elem.sound, 0.5);
          }
     }
     
     for(item in soundFieldLoops){

          if(typeof cell.soundFieldTraces[item] === 'undefined'){
               //stop the sound 
               var elem = getElement(item);
               console.log('stop: ' +  item);
               audio.stopLooping(item, 0.5);
               delete soundFieldLoops[item];
          }
     }


}

function updatePlayerInventory (levelId){

//add this levels inventory to the players inventory
//only if it's a new level

     if(typeof inv.pickupables[levelId] === 'undefined'){
          var t_inv = getInventory(levelId);
          inv.pickupables[levelId] = t_inv.pickupables; 
          inv.keyholes[levelId] = t_inv.keyholes;
          PlayerGameData.update(inv._id, {$set: {pickupables: inv.pickupables, keyholes: inv.keyholes}});
     }

}

function handleWallAudio(wall, callback){

     //TODO add a boolean to be triggered only when all audio is finished

     if(wall.hit.audioFile != 'none'){

          wall.hit.index = wall._id + '_h';
          audio.playOnce(wall.hit, function(){

               if(wall.narrator.audioFile != 'none'){
                    wall.narrator.index = wall._id + '_n';
                    audio.playOnce(wall.narrator, callback);  
               }else{
                    callback();
               }

          });  

     }else if(wall.narrator.audioFile != 'none'){

          wall.narrator.index = wall._id + '_n';
          audio.playOnce(wall.narrator, callback);      
     }

}

function startAudio (){

     audio = new aapiWrapper();

     if(audio.init()){
          Session.set("isAudioInit", true);
          loadAudioFiles(); 


     }else{
          console.log("init failed");
     }

}

function loadAudioFiles(){

     var files = AudioFiles.find({dt: 'file'}).fetch();

//console.log(files);

audio.loadSounds( files , function(){

     Session.set("isLoaded" , true);
     Session.set("screenMode", 0);

});

}













