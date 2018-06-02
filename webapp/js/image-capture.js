'use strict';

// -----------------------------------------------------------------------------
// WebRTC code to show camera input and capture image on canvas
// -----------------------------------------------------------------------------

// Put variables in global scope to make them available to the browser console.
var video = document.querySelector('video');
var canvas = window.canvas = document.querySelector('canvas');
canvas.width = 480;
canvas.height = 360;

var button = document.querySelector('button');
button.onclick = function() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').
    drawImage(video, 0, 0, canvas.width, canvas.height);
};

var constraints = {
  audio: false,
  video: true
};

function handleSuccess(stream) {
  window.stream = stream; // make stream available to browser console
  video.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);


// Converts canvas to an image
function convertCanvasToImage(canvas) {
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  return image;
}

// -----------------------------------------------------------------------------
// Setup AWS config to upload image to S3
// -----------------------------------------------------------------------------

var bucketName = 'areyouthejedi';
var bucketRegion = 'us-west-2';
var identityPoolId = 'us-west-2:c4578908-78a0-4ce6-9e97-01c067bdf44c';

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: bucketName}
});

$(function () {
  $('#upload-button').click(upload);
});

function upload() {
  console.log('Uploading canvas image');
  var dataUrl = canvas.toDataURL("image/jpeg");
  var blobData = dataURItoBlob(dataUrl);
  var filename = 'sampleImage.jpeg';
  var params = {Key: filename, ContentType: 'image/jpeg', Body: blobData};
  s3.upload(params, function (err, data) {
      console.log(data);
      console.log(err ? 'ERROR!' : 'UPLOADED.');
  });
}

// Convert data URI to Blob
function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}