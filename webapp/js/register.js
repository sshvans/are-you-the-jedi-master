'use strict';

// -----------------------------------------------------------------------------
// WebRTC code to show camera input and capture image on canvas
// -----------------------------------------------------------------------------

// Put variables in global scope to make them available to the browser console.
var video = document.querySelector('video');
var canvas = window.canvas = document.querySelector('canvas');
canvas.width = 480;
canvas.height = 360;

var button = document.getElementById('captureBtn');
button.onclick = function() {
  console.log(video.videoWidth);
  console.log(video.videoHeight);
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

// -----------------------------------------------------------------------------
// Check browser compatibility
// -----------------------------------------------------------------------------

// Check if local storage is supported by browser
if (typeof(Storage) == "undefined") {
  alert("Browser doesn't support localStorage! Please try different browser.");
}


// -----------------------------------------------------------------------------
// Register user
// -----------------------------------------------------------------------------

// Convert data URI to Blob
function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}

// Promise to upload an image
function uploadImage(nickname) {
  // Return a new promise
  return new Promise(function(resolve, reject) {
    console.log('Uploading canvas image');
    var dataUrl = canvas.toDataURL("image/jpeg");
    var blobData = dataURItoBlob(dataUrl);
    var filename = nickname + '_profile.jpg';
    var keyPrefix = "profiles/" + filename;
    var params = {Key: keyPrefix, ContentType: 'image/jpeg', Body: blobData};
    s3.upload(params, function (err, data) {
      console.log(data);
      console.log(err ? 'ERROR!' : 'UPLOADED.');
      if (err) {
        // Reject promise with response value false
        reject(false);
      }
      // Resolve promise with response value true
      resolve(true);
    });
  });
}

// Attach event handlers
$(function () {
  
  $('#registerBtn').click(register);
  $("#registerBtn").on({
    mouseenter: function(){
      $(this).attr('src','images/register-button-dark.png');
    },
    mouseleave: function(){
      $(this).attr('src','images/register-button.png');
    }
  });

  $("#captureBtn").on({
    mouseenter: function(){
      $(this).attr('src','images/camera_dark.png');
    },
    mouseleave: function(){
      $(this).attr('src','images/camera.png');
    }
  });
});

// Validate required fields not empty
function validate() {
  var nickname = document.getElementById("nickname").value;
  if(nickname == "") {
      return false;
  }
  return true;
}

// Check if a string exist in an array
function arrayContains(needle, arrhaystack)
{
  console.log("Array = " + arrhaystack);
  console.log("Search String = " + needle);
  var needleLocation = arrhaystack.indexOf(needle);
  console.log("search string location in array = " + needleLocation);
  return(needleLocation > -1);
}

// Check if nickname is already taken
function isNicknameUnique(nick) {
  var nicknamesArrString = window.localStorage.getItem("nicknames");
  if (nicknamesArrString === null) {  // nicknames array doesn't exist in localstorage
    console.log("'nicknames' doesn't exist in localStorage");
    // Therefore, nickname provided is unique
    return true;
  } else {  // nicknames array exist in localstorage
    console.log("'nicknames' exist in localStorage");
    // convert nicknames array string to array object
    var nicknamesArr = JSON.parse(nicknamesArrString);
    // Check if nickname exist in nickname array and return true/false
    return (!arrayContains(nick, nicknamesArr));
  }
}

// Promise to register user in the system
function registerUser() {
  // Return a new promise
  return new Promise(function(resolve, reject) {
    console.log("Making api call to register user in the system");
    var nickname = document.getElementById("nickname").value;
    
    // register user
    var url = "https://p80r9q55ph.execute-api.us-west-2.amazonaws.com/prod/register";
    var queryParam = "?n=" + nickname;
    var uri = url + queryParam;
    var encodedUri = encodeURI(uri);
    console.log("EncodedUri = " + encodedUri);
    $.get( encodedUri, function( data ) {
      console.log(String(data.nickname));
      // Resolve promise with response value true
      resolve(true);
    }).fail(function() {
      // Reject promise with response value false
      reject(false);
    });
  });
}

// Persist item in handle array in localstorage.
function persistLocally(item, handle) {
  var nicknamesArrString = window.localStorage.getItem(handle);
  if (nicknamesArrString === null) {  // nicknames array doesn't exist in localstorage
    console.log("'nicknames' doesn't exist in localStorage");
    // create an array, save nickname in the array and save it in localstorage
    var nicknamesArr = [];
    nicknamesArr.push(item);
    window.localStorage.setItem(handle, JSON.stringify(nicknamesArr));
  } else {  // nicknames array exist in localstorage
    console.log("'nicknames' exist in localStorage");
    // get nicknames array from localstorage, push nickname in it and save it
    var nicknamesArr = JSON.parse(nicknamesArrString);
    nicknamesArr.push(nickname);
    window.localStorage.setItem(handle, JSON.stringify(nicknamesArr));
  }
  // also store nickname in localstorage for quick access by other pages
  window.localStorage.setItem("nickname", item);
}

// Register user using promises
function register() {
  var validateMsg = document.getElementById("validate-message");
  if (validate() === true) {  // If all the required field values provided
    console.log("All required field values available!");
    validateMsg.innerHTML = "";
    var nickname = document.getElementById("nickname").value;
    if (isNicknameUnique(nickname) === true) {  // If given nickname is unique
      console.log("Nickname "+ nickname + " is unique.");
      validateMsg.innerHTML = "";
      // Upload profile pic to S3, register user in system, and
      // save nickname in localstorage
      uploadImage(nickname).then(function(response) {
        console.log("Profile picture uploaded successfully!");
        validateMsg.innerHTML = "";
        registerUser().then(function(response) {
          console.log("User registered successfully in the system");
          validateMsg.innerHTML = "";
          persistLocally(nickname, "nicknames");
          window.location = "capture.html";
        }, function(error) {
          console.log("Error registering user in the system");
          validateMsg.innerHTML = "Error registering user.";
        });
      }, function(error) {
        console.log("Error uploading profile pic image");
        validateMsg.innerHTML = "Error uploading profile pic image.";
      });
    } else {  // Given nickname is not unique
        console.log("Nickname "+ nickname + " is NOT unique.");
        validateMsg.innerHTML = nickname + " is already taken. Please choose another nickname.";
      }
  } else {
      console.log("Required field values missing!");
      validateMsg.innerHTML = "Please enter all the required fields";
    }
}