//Documentation jquery get call
// https://api.jquery.com/jquery.get/

$.get( "https://my-json-server.typicode.com/sshvans/are-you-the-jedi-master/leaderboard", function( data ) {
  console.log(String(data[0].nickname));
  $( "#message" ).html( data[0].nickname );
  if (Array.isArray(data)) {
  	var rank = 0;
  	data.forEach(function(item) {
  		rank = rank + 1;
  		addRow(rank, item.nickname, item.score);
  	});
  }
});

function addRow(rank, nickname, score) {
	var newrow = document.createElement("tr");
	var rankColumn = createRowTHColumn(newrow);
	var picColumn = createRowColumn(newrow);
	var nicknameColumn = createRowColumn(newrow);
	var scoreColumn = createRowColumn(newrow);

	rankColumn.innerText = rank.toString();

	var imageElement = document.createElement("img");
	imageElement.setAttribute("class", "profile-pic");
	var imagePath = "images/" + nickname + ".jpg";
	imageElement.setAttribute("src", imagePath);
	picColumn.appendChild(imageElement);

	nicknameColumn.innerText = nickname;

	scoreColumn.innerText = score;

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