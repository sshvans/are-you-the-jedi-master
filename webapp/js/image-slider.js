var cardTitle = [
	"Pose 1",
	"Pose 2",
	"Pose 3",
	"Pose 4",
	"Pose 5"
];

var cardNumber = [
	"1",
	"2",
	"3",
	"4",
	"5"
];

var cardDesc = [];
cardDesc[0] = "Pose 1 ...";
cardDesc[1] = "Pose 2 ...";
cardDesc[2] = "Pose 3 ...";
cardDesc[3] = "Pose 4 ...";
cardDesc[4] = "Pose 5 ...";


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
		    $("#poseNumber").html(cardNumber[drawNum]);
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
	    $("#poseNumber").html(cardNumber[drawNum]);
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