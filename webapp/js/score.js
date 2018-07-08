// -----------------------------------------------------------------------------
// Setup AWS config
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

//Documentation jquery get call
// https://api.jquery.com/jquery.get/

var poses = [
	"pose1",
	"pose2",
	"pose3",
	"pose4",
	"pose5"
];

// Get nickname from localstorage and save it in global variable
var nicknameStr = window.localStorage.getItem("nickname");

function getScore() {
	$.get( "https://p80r9q55ph.execute-api.us-west-2.amazonaws.com/prod/score?n=" + nicknameStr, function( data ) {
	  console.log(String(data.statusCode));
	  console.log(String(data.score));
	  var nickname = nicknameStr;
	  var score = data.score;
	  var msg = "";

	  // Show score
	  if (score > 75) {
	  	msg = "Well done " + nickname + "! Your score is " + String(score) + ".";
	  } else {
	  	msg = "Not bad " + nickname + "! Your score is " + String(score) + ".";
	  }
	  $( "#score-msg" ).html( msg );
	  
	  var poseNo = 0;
	  // Show images
	  poses.forEach(function(poseName) {
	  	poseNo = poseNo + 1;
	  	addRow(poseNo, poseName);
	  });
	});
}

// Promise to get Signed URL of the profile image of a user
function getUserPoseUrl(poseName) {
	// Return a new promise
  	return new Promise(function(resolve, reject) {
  		var params = {Bucket: bucketName, Key: "rendered/" +nicknameStr+ "_" +poseName+ "_rendered.png"};
		s3.getSignedUrl('getObject', params, function(err, url) {
			if (err) {
				// Reject promise with response value false
				reject(false);
			}
			console.log('The URL for ' +poseName+ ' is ' +url);
			resolve(url);
		});
  	});
}

function addRow(poseNo, poseName) {
	var newrow = document.createElement("tr");
	var poseNoColumn = createRowTHColumn(newrow);
	var referencePicColumn = createRowColumn(newrow);
	var userPicColumn = createRowColumn(newrow);

	poseNoColumn.innerText = String(poseNo);

	var refImageElement = document.createElement("img");
	refImageElement.setAttribute("class", "pose-pic");
	refImagePath = "images/jedi_" +poseName+ "_rendered.png";
	refImageElement.setAttribute("src", refImagePath);
	referencePicColumn.appendChild(refImageElement);

	var userImageElement = document.createElement("img");
	userImageElement.setAttribute("class", "pose-pic");
	getUserPoseUrl(poseName).then(function(url) {
		userImageElement.setAttribute("src", url);
	});
	userPicColumn.appendChild(userImageElement);
	
	var tbody = document.getElementsByTagName('tbody')[0];
	tbody.appendChild(newrow);
}

function createRowColumn(row) {
	var column = document.createElement("td");
  row.appendChild(column);
  return column;
}

function createRowTHColumn(row) {
	var column = document.createElement("th");
	column.setAttribute("scope", "row")
  row.appendChild(column);
  return column;
}

//------------------------------------------------------------------------
// Wait for 5 seconds before doing anything on this page
//------------------------------------------------------------------------
var delayInMilliseconds = 5000; //5 seconds

setTimeout(function() {
  //this code to be executed after 5 seconds
  getScore();
  $('#spin-load').hide();
  $('#score-msg').show();
  $('#poseTable').show();
  $('#leaderBtn').show();
}, delayInMilliseconds);