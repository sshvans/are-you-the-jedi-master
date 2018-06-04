var cardTitle = [
	"Pose 1",
	"Pose 2",
	"Pose 3",
	"Pose 4",
	"Pose 5"
];

var cardDesc = [];
cardDesc[0] = "Judgment tells a ...";
cardDesc[1] = "The Magician generally ...";
cardDesc[2] = "Strength is the rawest ...";
cardDesc[3] = "Your identification ...";
cardDesc[4] = "The World is an indicator ...";


var drawCard = [
	"images/pose1.jpg",
	"images/pose2.jpg",
	"images/pose3.jpg",
	"images/pose4.png",
	"images/pose5.jpg"
];

var drawNum = 0;

$(function () {
	$("#prevBtn").click(
		function(){
			drawNum=drawNum - 1;
		    $("#title").html(cardTitle[drawNum]);
		    $("#desc").html(cardDesc[drawNum]);
		    $("#showImage").fadeOut(
		      function(){
		        $(this).attr('src', drawCard[drawNum])
		        .fadeIn();
		      }
		    ); // end fadeOut
		}
	); //end click
	$("#nextBtn").click(
	  function(){
	    //var drawNum = Math.floor(Math.random() * drawCard.length);
	    drawNum=drawNum + 1;
	    $("#title").html(cardTitle[drawNum]);
	    $("#desc").html(cardDesc[drawNum]);
	    $("#showImage").fadeOut(
	      function(){
	        $(this).attr('src', drawCard[drawNum])
	        .fadeIn();
	      }
	    ); // end fadeOut
	  }
	); //end click
});