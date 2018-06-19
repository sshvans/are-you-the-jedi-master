//Documentation jquery get call
// https://api.jquery.com/jquery.get/

$.get( "https://my-json-server.typicode.com/sshvans/are-you-the-jedi-master/score", function( data ) {
  console.log(String(data.nickname));
  console.log(String(data.score));
  var nickname = data.nickname;
  var score = data.score;
  var msg = "";

  // Show score
  if (score > 75) {
  	msg = "Well done " + nickname + "! Your score is " + String(score) + ".";
  } else {
  	msg = "Not bad " + nickname + "! Your score is " + String(score) + ".";
  }
  $( "#score-msg" ).html( msg );
  
  // Show images
  for(var i = 1; i <= 5; i++) {
  	addRow(i, nickname);
  }
});

function addRow(poseNo, nickname) {
	var newrow = document.createElement("tr");
	var poseNoColumn = createRowTHColumn(newrow);
	var referencePicColumn = createRowColumn(newrow);
	var userPicColumn = createRowColumn(newrow);

	poseNoColumn.innerText = String(poseNo);

	var refImageElement = document.createElement("img");
	refImageElement.setAttribute("class", "pose-pic");
	var refImagePath = "images/" + nickname + ".jpg";
	refImageElement.setAttribute("src", refImagePath);
	referencePicColumn.appendChild(refImageElement);

	var userImageElement = document.createElement("img");
	userImageElement.setAttribute("class", "pose-pic");
	var userImagePath = "images/" + nickname + ".jpg";
	userImageElement.setAttribute("src", userImagePath);
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