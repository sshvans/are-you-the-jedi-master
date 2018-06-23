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

$.get( "https://p80r9q55ph.execute-api.us-west-2.amazonaws.com/prod/leaderboard", function(data) {
  console.log(String(data));
  //$( "#message" ).html( data[0].nickname );
  if (Array.isArray(data)) {
  	getAllProfilePicUrls(data).then(function(data) {
		// Take an array of promises and wait on them all
		return Promise.all(
			// Map array of user objects to
			// array of profile pic URLs
			data.map(getProfilePicUrl)
		);
	}).then(function(urls) {
		let rank = 0; 
		// Now we have profile pic urls in order. Loop through..
		urls.forEach(function(url) {
			// ..and populate leaderboard with rows
			console.log(url);
			let nickname = data[rank][0];
	  		let score = data[rank][1];
	  		rank = rank + 1;
	  		addRow(rank, nickname, score, url);
		});
	});
  }
});

// Promise to get Signed URL of the profile image of a user
function getProfilePicUrl(userObj) {
	// Return a new promise
	let nickname = userObj[0];
  	return new Promise(function(resolve, reject) {
  		var params = {Bucket: bucketName, Key: "profiles/" +nickname+ "_profile.jpg"};
		s3.getSignedUrl('getObject', params, function(err, url) {
			if (err) {
				// Reject promise with response value false
				reject(false);
			}
			console.log('The URL for ' +nickname+ ' is ' +url);
			resolve(url);
		});
  	});
}

// Promise to get array of user objects
function getAllProfilePicUrls(data) {
	return new Promise(function(resolve, reject) {
		resolve(data);
	});
}

// Add a row in a table
function addRow(rank, nickname, score, imagePath) {
	var newrow = document.createElement("tr");
	var rankColumn = createRowTHColumn(newrow);
	var picColumn = createRowColumn(newrow);
	var nicknameColumn = createRowColumn(newrow);
	var scoreColumn = createRowColumn(newrow);

	rankColumn.innerText = rank.toString();

	var imageElement = document.createElement("img");
	imageElement.setAttribute("class", "profile-pic");
	//var imagePath = "images/" + nickname + ".jpg";
	imageElement.setAttribute("src", imagePath);
	picColumn.appendChild(imageElement);

	nicknameColumn.innerText = nickname;

	scoreColumn.innerText = score;

	var tbody = document.getElementsByTagName('tbody')[0];
	tbody.appendChild(newrow);
}

// Create a cell in a row
function createRowColumn(row) {
	var column = document.createElement("td");
  row.appendChild(column);
  return column;
}

// Create a cell of type head in a row
function createRowTHColumn(row) {
	var column = document.createElement("th");
	column.setAttribute("scope", "row")
  row.appendChild(column);
  return column;
}