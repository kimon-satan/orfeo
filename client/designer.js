Template.terrainMaker.created = function(){

  Session.set("currentType", "none");
  Session.set("currentFile", "none");

}

Template.terrainMaker.events({




});

Template.terrainMaker.audioFiles = function(){  if(Session.get("currentType") == "none"){
                                                          return AudioFiles.find({dt: 'file'}).fetch();
                                                  }else{
                                                          return AudioFiles.find({dt: 'file', parent: Session.get("currentType")}).fetch();
                                                  }
                                              }

Template.terrainMaker.audioTypes = function(){return AudioFiles.find({dt: 'type'}).fetch();}
Template.terrainMaker.currentType = function(){return Session.get("currentType");}
Template.terrainMaker.currentFile = function(){return Session.get("currentFile");}


