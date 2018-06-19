function validate() {
    var validateMsg = document.getElementById("validate-message");

    var firstname = document.getElementById("firstname").value;
    var lastname = document.getElementById("lastname").value;
    var nickname = document.getElementById("nickname").value;

    if(firstname == "" || lastname == "" || nickname == "") {
        validateMsg.innerHTML = "Please fill all the required fields";
    } else {
    	// Check if local storage is supported by browser. If not, throw error.
    	if (typeof(Storage) !== "undefined") {
		    // Code for localStorage/sessionStorage.
		    sessionStorage.nickname = nickname;
            // register user
            var url = "https://my-json-server.typicode.com/sshvans/are-you-the-jedi-master/register";
            var queryParam = "?n=" + nickname + "&f=" + firstname + "&l=" + lastname;
            var uri = url + queryParam;
            var encodedUri = encodeURI(uri);
            console.log("EncodedUri = " + encodedUri);
            $.get( encodedUri, function( data ) {
              console.log(String(data.nickname));
            });
		    window.location = "capture.html";
		} else {
		    // Sorry! No Web Storage support..
		    alert('Your browser is not compatible');
		}
    }
}