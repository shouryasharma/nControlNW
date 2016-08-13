//User Authenticaion
nControl.auth = function () {
	//do authorization
	//find super in db
	db.user.count({role:'SUPER'}, function (err, count) {
	'use strict';
		//if not able to find super the show create user modal
		if(count === 0){
			$('#fUser').modal('show');
		}
		//user auth checker
		$('.authgo').click(function () {
			var lname = $('.luser').val();
			var authpass = $('.authpass').val();

			//check if the username already exists
			db.user.find({"username": lname},function (err, docs){
				if (authpass === docs[0].password) {
					authset = true;
				}
				if (authset) {
					$('.controlitems').removeClass('disabled');
					$('.execute').removeClass('disabled');
					$('.totalpedigree').show();
					window.authset = true;
					setTimeout(function () {
						$('#progressbar').css("width", "150px");
					}, 90);
					setTimeout(function () {
						$('#myModal').modal('hide');
					}, 100);
				}
 				//if pass is wrong
				else {
					$('.authpass').val('');
					$('#nmsg').show();
					$("#nmsg").html("<b>Oh snap!</b> Incorrect password. Please try again.");
					setTimeout(function () {
						$('#nmsg').fadeOut();
					}, 1000);
				}
			});
	   	});
	});
};

//creating user
nControl.createuser = function (){
	var username = $('.username').val();
	var urole = $('.urole').val();
	var passcode = $('.upassword').val();
	var passcode1 = $('.upassword1').val();
	if(passcode == passcode1){
		if(username != "" ||  passcode1 != "" || passcode != ""){
	     db.user.insert([
		{
			username: username
			,role: urole
			,ids:1
			, password: passcode

		}
	]);
            }
		}
}
