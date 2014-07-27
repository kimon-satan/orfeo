/*-------------------------constructor---------------------------*/


aapiWrapper = function(){

    this.context = 0;
    this.initialised = true;
    this.sampleSources = {};
    this.sampleObjs = {};

}

/*---------------------------methods-------------------------------*/

aapiWrapper.prototype.init = function(){

  try {

      if (typeof AudioContext !== "undefined") {
          audio.context = new AudioContext();
      } else if (typeof webkitAudioContext !== "undefined") {
          audio.context = new webkitAudioContext();
      } else {
          throw new Error('AudioContext not supported. :(');
      }

    return true;

  } catch(e) {

    this.initialised = false;
    return false;

  }

}

aapiWrapper.prototype.loadSounds = function(files, callBack){

 

  if(files.length == 0){
    callBack(true);
    return;
  }

  var i = 0;
	for (var a in files) {

   var isSkip = false;

    if(typeof files[a] === 'undefined'){
      isSkip = true;
    }else if(files[a].folder == 'none' || files[a].audioFile == 'none'){ 
      isSkip = true;
    }else{
      var name = files[a].folder + files[a].audioFile;
      if(typeof this.sampleSources[name] !== 'undefined')isSkip = true;
    }

    if(isSkip){
      i++;
      if(i == files.length)callBack(true);
      continue;
    }

		(function(parent) {		

        var name = files[a].folder + files[a].audioFile;

  			parent.sampleSources[name] = new appiSample(name);
        var fp = "sounds/" + files[a].folder + "/" + files[a].audioFile;

  			var req = new XMLHttpRequest();
  			req.open('GET', fp, true);
  			req.responseType = 'arraybuffer';

         console.log(fp);

        req.addEventListener('load', function(event){

            parent.context.decodeAudioData(req.response, function(decodedAudio){

              parent.sampleSources[name].buffer = decodedAudio;
              parent.sampleSources[name].bufSrc = {};
              i++;

              if(i == files.length)callBack(true);

            });

        }, true);

  			req.send();


		})(this); 

	}

}

aapiWrapper.prototype.playOnce = function(options, callBack){

  this.sampleObjs[options.index] = new appiSample();
  var sample = this.sampleObjs[options.index];
  sample.buffer = this.sampleSources[options.folder + options.audioFile].buffer;
  sample.bufSrc = this.sampleSources[options.folder + options.audioFile].bufSrc;

  //defaults
  if(typeof options.amp !== 'undefined')sample.amp = options.amp;
  if(typeof options.offset === 'undefined')options.offset = 0;
  if(typeof options.fadeIn === 'undefined')options.fadeIn = 0.01;
  if(typeof options.fadeOut === 'undefined')options.fadeIn = 0.01;


  this.play(sample, options.fadeIn, options.fadeOut, options.offset);

  if(typeof callBack === 'function'){

     sample.cbTime = this.context.currentTime + options.offset + sample.buffer.duration;

     sample.cbThread = window.setInterval(function(){

     // console.log(this.context.currentTime);

      if(this.context.currentTime > sample.cbTime){

        window.clearInterval(sample.cbThread);
        callBack();

      }

    }.bind(this),50);


  }

}



aapiWrapper.prototype.startLooping = function(options){ //n is a key with the fileName

  this.sampleObjs[options.index] = new appiSample();
  var sample = this.sampleObjs[options.index];
  sample.buffer = this.sampleSources[options.folder + options.audioFile].buffer;
  sample.bufSrc = this.sampleSources[options.folder + options.audioFile].bufSrc;

  sample.amp = options.amp;
  sample.crossfades = this.calcXFades(1);

  if(!sample.isLooping){

    sample.isLooping = true;

    this.play(sample, options.fadeIn, -1);
    sample.loopTime = this.context.currentTime + sample.buffer.duration - 1;

    sample.loopThread = window.setInterval(function(){

      if(this.context.currentTime > sample.loopTime){

          this.play(sample, -1, -1);
          sample.loopTime = this.context.currentTime + sample.buffer.duration - 1; //1 sec crossfades

      }

    }.bind(this),50);

  }

}

aapiWrapper.prototype.setLoopAmp = function(n ,amp){

  var sample = this.sampleObjs[n];
  var ct = this.context.currentTime;
  sample.amp = amp;
  sample.gainNode.gain.linearRampToValueAtTime(sample.gainNode.gain.value, 0);
  sample.gainNode.gain.linearRampToValueAtTime(sample.amp, ct + 0.5);

}

aapiWrapper.prototype.stopLooping = function(n, fadeOut, offset){

	var sample = this.sampleObjs[n];
  if(typeof sample === 'undefined')return;
  var ct = this.context.currentTime;

	if(sample.isLooping){

    if(typeof offset === 'undefined')offset = 0;

    sample.gainNode.gain.linearRampToValueAtTime(sample.gainNode.gain.value, ct + offset);
    sample.gainNode.gain.linearRampToValueAtTime(0, ct + offset + fadeOut);

 
    sample.stopLoopThread = window.setInterval(function(){

      if(this.context.currentTime >= ct + offset + fadeOut + 0.5){
          window.clearInterval(sample.loopThread);
          window.clearInterval(sample.stopLoopThread);
          sample.bufSrc.stop(0);
          sample.isLooping = false;
          sample.fadeOut = false;
          sample.fadeTime = 0;
      }

    }.bind(this),50);


  }

}




aapiWrapper.prototype.play = function(sample, fadeIn, fadeOut, offset){

    var ct = this.context.currentTime;
    if(typeof offset !== 'undefined')ct += offset;

    //setup data
    sample.bufSrc = this.context.createBufferSource();
    sample.bufSrc.buffer = sample.buffer;
    sample.gainNode = this.context.createGain();
    sample.crossFadeNode = this.context.createGain();

    //patch nodes

    sample.bufSrc.connect(sample.crossFadeNode);
    sample.crossFadeNode.connect(sample.gainNode);
    sample.gainNode.connect(this.context.destination);

    //handle fades
    if(fadeIn > 0){
      sample.gainNode.gain.linearRampToValueAtTime(0, ct);
      sample.gainNode.gain.linearRampToValueAtTime(sample.amp, ct + fadeIn);
    }else{
      sample.gainNode.gain.value = sample.amp;
    }

    if(sample.isLooping){
        
      try{
        sample.crossFadeNode.gain.setValueCurveAtTime(sample.crossfades.xIn, ct, 1);
      }catch(e){
        console.log(e);
      }
      
    }

    //fade out
    if(fadeOut > 0){
      sample.gainNode.gain.linearRampToValueAtTime(sample.amp, ct + sample.buffer.duration - fadeOut);
      sample.gainNode.gain.linearRampToValueAtTime(0, ct + sample.buffer.duration);
    }else{
      sample.gainNode.gain.setValueAtTime(0, ct + sample.buffer.duration);
    }


    if(sample.isLooping){

     
      try{
          sample.crossFadeNode.gain.setValueCurveAtTime(sample.crossfades.xOut, ct + sample.buffer.duration - 1, 1);
      }catch(e){
        console.log(e);
      }

    }
      

    //sched start & stops
    sample.bufSrc.start(ct);
    sample.bufSrc.stop(ct + sample.buffer.duration);

}

// /*-----------------------------HELPER FUNCTIONS------------------------------*/

aapiWrapper.prototype.calcXFades = function(amp){
  
    var valueCount = 4096;
    var crossfades = {};

    //fade in
    crossfades.xIn = new Float32Array(valueCount);
    for (var i = 0; i < valueCount; i++) { 
      crossfades.xIn[i] = (1 - Math.pow(((valueCount-i)/valueCount),2)) * amp;
    }

    //reverse for fade out
    crossfades.xOut = new Float32Array(valueCount);
    for (var i = 0; i < valueCount; i++) { 
      crossfades.xOut[i] = (1 - Math.pow(((i+1)/valueCount),2) ) * amp;
    }

    return crossfades;

}

aapiWrapper.prototype.killAll = function(){

  for(sample in this.sampleObjs){

    if(this.sampleObjs[sample].isLooping){
      this.stopLooping(sample, 0.5,0);
    }else{
      this.sampleObjs[sample].bufSrc.stop(0);
      window.clearInterval(this.sampleObjs[sample].cbThread);
    }
  }

}


aapiWrapper.prototype.stopOnePlay = function(id){

  this.sampleObjs[id].bufSrc.stop(0);
  window.clearInterval(this.sampleObjs[id].cbThread);

}

/*-------------------------------------other constructors------------------------------*/

appiSample = function(fileName){


  this.buffer;
  this.bufSrc;
  this.crossFadeNode;
  this.gainNode;
  this.fileName = fileName;
  this.loopTime;
  this.loopThread;
  this.cbTime;
  this.cbThread;
  this.stopLoopThread;
  this.fadeOut = false;
  this.fadeTime = 0;
  this.isLooping = false;
  this.amp = 1;
  this.crossfades = {};
  
}

