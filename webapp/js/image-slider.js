var cardTitle = [
	"Pose 1",
	"Pose 2",
	"Pose 3"
];

var cardNumber = [
	"1",
	"2",
	"3"
];

var cardDesc = [];
cardDesc[0] = "Pose 1 ...";
cardDesc[1] = "Pose 2 ...";
cardDesc[2] = "Pose 3 ...";


var drawCard = [
	"images/jedi_pose1.jpg",
	"images/jedi_pose2.jpg",
	"images/jedi_pose3.jpg"
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