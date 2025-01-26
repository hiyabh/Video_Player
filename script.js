let playbtn, seekslider, correntFrame, durationFrame, corrent, duration, progressBar, chooseTarget, input, intervalRewind;

document.addEventListener("DOMContentLoaded", function () {
  initialiseVideo();
}, false);

function initialiseVideo() {
  vid = document.getElementById('playr_video_0');
  vid.controls = false;

  playbtn = document.getElementById("playpausebtn");
  choosebtn = document.getElementById("choosebtn");
  playrev = document.getElementById("rev");
  playrevSpeed = document.getElementById("revSpeed");
  speedbtn = document.getElementById("speedbtn");

  corrent = document.getElementById("playr_video_curpos_0");
  duration = document.getElementById("playr_video_duration_0");
  progressBar = document.getElementById('progress-bar');
  input = document.getElementById("chooseFrame");

  progressBar.addEventListener("change", vidSeek, false);
  progressBar.addEventListener("click", seek, false);
  vid.addEventListener("timeupdate", seektimeupdate, false);
  input.addEventListener("keyup", shoot, false);

}

//button speed

function setPlaySpeed() {
  if (vid.playbackRate === 1) {
    speedbtn.innerHTML = '&#8741;';
    vid.play();
    vid.playbackRate = 5;
  } else {
    speedbtn.innerHTML = '&#10095;&#10095;';
    vid.playbackRate = 1;
  }
}

//button play
function playPause() {
  if (vid.paused) {
    clearInterval(intervalRewind);
    vid.playbackRate = 1;
    vid.play();
    playbtn.innerHTML = "&#8741;";
    speedbtn.innerHTML = '&#10095;&#10095;';
    playrev.innerHTML = '&#10094;';
    playrevSpeed.innerHTML = '&#10094;&#10094;';
  } else {
    if (vid.playbackRate != 1) {
      vid.playbackRate = 1;
      clearInterval(intervalRewind);
      vid.play();
      playbtn.innerHTML = "&#8741;";
      speedbtn.innerHTML = '&#10095;&#10095;';
      playrev.innerHTML = '&#10094;';
      playrevSpeed.innerHTML = '&#10094;&#10094;';
    } else {
      vid.playbackRate = 1;
      clearInterval(intervalRewind);
      vid.pause();
      playbtn.innerHTML = "&#9654;";
      speedbtn.innerHTML = '&#10095;&#10095;';
      playrev.innerHTML = '&#10094;';
      playrevSpeed.innerHTML = '&#10094;&#10094;';
    }
  }
}

function changeButtonType(playbtn, value) {
  playbtn.title = value;
  playbtn.innerHTML = value;
  playbtn.className = value;
}

//button rev
function rev(rewindSpeed) {
  clearInterval(intervalRewind);
  var startSystemTime = new Date().getTime();
  var startVideoTime = vid.currentTime;
  intervalRewind = setInterval(function () {
    vid.playbackRate = 1.0;
    if (vid.currentTime == 0) {
      clearInterval(intervalRewind);
      vid.pause();
      playrev.innerHTML = '&#10094;';
      speedbtn.innerHTML = '&#10095;&#10095;';
    } else {
      var elapsed = new Date().getTime() - startSystemTime;
      vid.pause();
      vid.currentTime = startVideoTime - elapsed * rewindSpeed / 2000.0;
      playrev.innerHTML = '&#8741;';
      playbtn.innerHTML = '&#9654;';
      playrevSpeed.innerHTML = '&#10094;&#10094;';
      speedbtn.innerHTML = '&#10095;&#10095;';
    }
  }, 333);
}

//button revSpeed
function revSpeed(rewindSpeed) {
  clearInterval(intervalRewind);
  var startSystemTime = new Date().getTime();
  var startVideoTime = vid.currentTime;
  intervalRewind = setInterval(function () {
    vid.playbackRate = 1.0;
    if (vid.currentTime == 0) {
      clearInterval(intervalRewind);
      vid.pause();
      playrevSpeed.innerHTML = '&#10094;&#10094;';
      speedbtn.innerHTML = '&#10095;&#10095;';
    } else {
      var elapsed = new Date().getTime() - startSystemTime;
      vid.pause();
      vid.currentTime = startVideoTime - elapsed * rewindSpeed / 2000.0;
      playrevSpeed.innerHTML = '&#8741;';
      playbtn.innerHTML = '&#9654;';
      playrev.innerHTML = '&#10094;';
      speedbtn.innerHTML = '&#10095;&#10095;';
    }
  }, 333);
}

//progres bar

function seek(e) {
  var percent = e.offsetX / this.offsetWidth;
  vid.currentTime = percent * vid.duration;
  e.target.value = Math.floor(percent / 100);
  e.target.innerHTML = progressBar.value + '% played';
}

function updateProgressBar() {
  var percentage = Math.floor((100 / vid.duration) * vid.currentTime);
  progressBar.value = percentage;
  progressBar.innerHTML = percentage + '% played';
}

//progress bar pointer
function vidSeek() {
  var frameRate = vid.frameRate || 30; // Default to 30 if frameRate is not available
  var seekto = (vid.duration * frameRate) * (progressBar.value / 100);
  vid.currentTime = seekto;
}

function seektimeupdate() {
  var nt = vid.currentTime * (100 / vid.duration);
  progressBar.value = nt;
}

// current frame
function myFunction() {
  document.getElementById("playr_video_curpos_0").innerHTML = Math.floor(vid.currentTime * 30);
  //document.getElementById("Frame").innerHTML = Math.floor(vid.currentTime * 30);
}

//duration frame
function isLoaded() {
  document.getElementById("playr_video_duration_0").innerHTML = Math.floor(vid.duration * 30);
}

//choose frame
function choose() {
  chooseTarget = document.getElementById("chooseFrame").value;
  vid.currentTime = (Math.floor(chooseTarget) / 30) + 1 / 30;
}

function shoot(event) {
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("choosebtn").click();
  }
}

//playlist
//צריך להוסיף איפוס כשהכפתורים נטענים וכן לסדר את הסרגל בהתאם שיתאפס
function loadVideo() {
  for (var i = 0; i < arguments.length; i++) {
    var file = arguments[i].split('.');
    var ext = file[file.length - 1];

    vid.src = arguments[i];
    vid.load();
    break;
  }
}
