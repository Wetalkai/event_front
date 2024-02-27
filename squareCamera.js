var canvasSquare; //Used for our image sizing
var boxWidth; //Used for our resonsive div sizing
var vidW, vidH; //Calculate our webcame feeds width and height
//Canvases
const cameraView = document.querySelector("#camera-view");
const userPhoto = document.querySelector("#user-photo");
var canvasFab = new fabric.Canvas('photo-adjust', {});
//Div setup for buttons
const cameraDiv = document.querySelector("#camera");
const resultDiv = document.querySelector("#result");
const fabricDiv = document.querySelector("#fabric");

//Webcam Setup and usage
var constraints = {
  video: {
    width: {
      ideal: 4096
    },
    height: {
      ideal: 4096
    },
    facingMode: "user"
  },
  audio: false
};

//Sets up all the divs to be the same size 
function SetupSizes() {
  boxWidth = document.getElementById("box-width").offsetWidth;
  var st = 'width:' + boxWidth.toString() + 'px; height:' + boxWidth.toString() + 'px';
  document.getElementById('camera-view').setAttribute("style", st);
  document.getElementById('user-photo').setAttribute("style", st);
  document.getElementById('photo-adjust').setAttribute("style", st);
  canvasFab.setWidth(boxWidth);
  canvasFab.setHeight(boxWidth);
}
SetupSizes();

//Resizes the canvases
function ResizeCanvases() {
  var cvs = document.getElementsByTagName("canvas");
  for (var c = 0; c < cvs.length; c++) {
    cvs[c].height = canvasSquare;
    cvs[c].width = canvasSquare;
  }
  canvasFab.width = canvasSquare;
  canvasFab.height = canvasSquare;
}

function WebcamSetup() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function(stream) {
      let track = stream.getTracks()[0];
      if (track.getSettings) {
        let {
          width,
          height
        } = track.getSettings();
        vidW = width;
        vidH = height;
        console.log(`${width}x${height}`);
        canvasSquare = (vidW > vidH) ? vidH : vidW;
        cameraView.width = (vidW > vidH) ? vidW : vidH;
        cameraView.height = (vidH > vidW) ? vidH : vidW;
        ResizeCanvases();
      }
      cameraView.srcObject = stream;
    })
    .catch(function(error) {
      console.error("Oops. Something is broken.", error);
    });

  cameraDiv.classList.remove("d-none");
  resultDiv.classList.add("d-none");
  fabricDiv.classList.add("d-none");
}
WebcamSetup();

function TakeSnapshot() {

  var landscape = vidW > vidH; //Is the video in landscape?
  var boxSize = canvasSquare;
  var ratio = landscape ? vidW / vidH : vidH / vidW;
  var offset = ((boxSize * ratio) - boxSize) / 2;
  userPhoto.getContext("2d").drawImage(cameraView, landscape ? offset : 0, landscape ? 0 : offset, canvasSquare, canvasSquare, 0, 0, userPhoto.width, userPhoto.height);

  cameraDiv.classList.add("d-none");
  resultDiv.classList.remove("d-none");
  fabricDiv.classList.add("d-none");

  TurnOffWebcam();
}

//Removes the video and stops the stream
function TurnOffWebcam() {
  var videoEl = document.getElementById('camera-view');
  stream = videoEl.srcObject;
  if (stream != null) {
    stream.getTracks().forEach(track => track.stop());
    videoEl.srcObject = null;
  }
}

function UseImage() {

  const photo = document.getElementById('user-photo');

  fabric.Image.fromURL(photo.toDataURL(), function(img) {
    img.set({
      'flipX': true,
    });
    canvasFab.centerObject(img);
    canvasFab.setBackgroundImage(img, canvasFab.renderAll.bind(canvasFab));
  });

  cameraDiv.classList.add("d-none");
  resultDiv.classList.add("d-none");
  fabricDiv.classList.remove("d-none");
}
