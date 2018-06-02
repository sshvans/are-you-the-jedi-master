function validate() {
    var validateMsg = document.getElementById("validate-message");

    var firstname = document.getElementById("firstname").value;
    var lastname = document.getElementById("lastname").value;
    var nickname = document.getElementById("nickname").value;

    if(firstname == "" || lastname == "" || nickname == "") {
        validateMsg.innerHTML = "Please fill all the required fields";
    }
}