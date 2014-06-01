/*----------------------------------------------------------------------------------------------*/

Template.navScreen.events({

    'click .step': function(event){
    
        var id = event.target.id;
        if($(event.target).hasClass('disable'))return;

        $(event.target).addClass('active');

        $('.step').not('#' + id).addClass('disable');




       /* if(id == "north")playerPos.y = Math.max(playerPos.y - 1, 0);
        if(id == "south")playerPos.y = Math.min(playerPos.y + 1, terrainMap.ySize - 1);
        if(id == "east")playerPos.x = Math.min(playerPos.x + 1, terrainMap.xSize - 1);
        if(id == "west")playerPos.x = Math.max(playerPos.x - 1, 0);
        //TODO: routine for hitting edges

      
        var newTerrain = terrainTypes[terrainMap.map[playerPos.y][playerPos.x]]; //cols & rows reversed

         console.log(newTerrain);

        audio.playOnce('footstep', {amp: 1}, function(){

          $(this).removeClass('active');
          $('.step').not('#' + id).removeClass('disable');

           if(newTerrain.bgSound != cTerrain.bgSound){

              audio.stopLooping(cTerrain.bgSound, 1);
              cTerrain = newTerrain;
              audio.playOnce(cTerrain.whereSound, {amp: 0.75, offset: 2});
              audio.startLooping(cTerrain.bgSound, 1, 1);

            }else{
              cTerrain = newTerrain;
            }

        }.bind(this));*/

        event.preventDefault();

    },  

    'click #where': function(event){

      console.log("where am i ?");
      $(event.target).addClass("active");

       /* audio.playOnce(cTerrain.whereSound, {amp: 0.75}, function(){

          $(this).removeClass('active');

        }.bind(this));*/

      event.preventDefault();

    }

});