Template.designRelease.events({

	'change #fileChooser':function(e){

		var files = e.target.files;

		//console.log(files);
    	for (var i = 0, ln = files.length; i < ln; i++) {
      		var fileObject = AudioFiles.insert(files[i], function (err, fileObj) {
      			if(err){
      				console.log(err);
      			}else{
      				//console.log(fileObj);
        			//console.log("Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP");
        		}
      		});
          console.log(fileObject);
      	}

        e.preventDefault();
    }




});


Template.designRelease.uploadProgress = function(){return "prg";}