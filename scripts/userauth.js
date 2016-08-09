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

		//user should enter the details of superuser
	//user should write the password twice
	//check if both passwords enetered by user are same
	//if everything enetered by the user is good enoughmake an entry in the db

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
	if(passcode == passcode1)
		{
	     db.user.insert([
		{
			username: username
			,role: urole
			, password: passcode
		}
	]);

		} esle
		{
	// save the data received from the user into the db.node


		}}
