
$('.addtouser').click(function () {
	nControl.userid();

	//get the data from the user
	db.user.name = $('.user_id').val();
	db.user.role = $('.role').val();
	db.user.passcode = ($('.passuser').val());
	db.user.count({username: db.user.name}, function (err, docs) {

                if(docs == 0){
			if (db.user.name !== '' && db.user.role !== ''  && db.user.passcode !== '') {
				//save the data received from the user into the db.user
				db.user.insert([
					{
						username: db.user.name
						, role: db.user.role
						, ids:ids
						, password: db.user.passcode
            }
        ]);
				setTimeout(function () {
					nControl.showuser();
				}, 0);
				nControl.finduser();
				$('.user_id').val('');
				$('.role_type').val('');
				$('.ids').val('');
				$('.passuser').val('');
			}
			else {
				$('#myModal').modal('show');
				$('#notifaction').hide();
				$('#notifclosebutton').show();
				$('#notifclosebutton').html('Close');
				$('#myModal .modal-body').html("All fields are mandatory");
			}} else {
				$('#myModal').modal('show');
				$('#notifaction').hide();
				$('#notifclosebutton').show();
				$('#notifclosebutton').html('Close');
				$('#myModal .modal-body').html("you alredy have account with "+db.user.name+"<br>"+"please select different name");
			}


	});
});
var ids
nControl.userid = function(){
db.user.find({ }).sort({ ids: -1 }).exec(function (err, docs) {
ids = docs[0].ids +1;
});}
// remove user confirmation
nControl.removeuser = function (user) {
	$('#myModal .modal-body').html('Are you sure you want to remove this?');
	$('#notifaction').show();
	$('#notifclosebutton').html('No');
	$('#notifaction').html('Yes');
	$('#notifaction').attr("onClick", "nControl.remuser(" + user + ");");
};
// update user confirmation
nControl.updateuser = function (user) {
	$('#myModal .modal-title').html('Attention!');
	$('#myModal .modal-body').html('Are you sure you want to update?<br><b>CAUTION!</b> Trying to update this will result in its removal but its contents will be copied above.');
	$('#notifaction').show();
	$('#notifaction').html('Yes');
	$('#notifclosebutton').html('No');
	$('#notifaction').attr("onClick", "nControl.upduser(" + user + ");");
};
nControl.remuser = function (user) {
	db.user.remove({
		ids: user
	}, {}, function (err, numRemoved) {

	});
	$('#myModal').modal('hide');
	nControl.showuser();

};
nControl.finduser = function () {
	db.user.find({}).sort({
		ids: 1
	}).exec(function (err, docs) {
		nControl.userList = docs;
	});
};


nControl.upduser = function (user) {
	db.user.find({
		ids: user
	}, function (err, docs) {
		$('.user_id').val(docs[0].username);
		$('.role_type').val(docs[0].role);

	});

	db.user.remove({
		ids: user
	}, {}, function (err, numRemoved) {
		//load user from db.user to display
		db.user.find({}).sort({
			ids: 1
		}).exec(function (err, docs) {
			nControl.showuser();
			nControl.userList = docs;
			$('.user .table').html('');
			$('#products').html('');
			$('.user .table').append(userdiv);
			for (var i = 0, j = docs.length; i < j; i++) {
				$('.user .table').append("<tr><td id='usera'><div class='btn-group'><button class=\"btn btn-danger btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onClick=\"nControl.removeuser(" + docs[i].ids + ");\">x</button><button class=\"btn btn-warning btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onclick=\"nControl.updateuser(" + docs[i].ids + ")\">Update</button></div></td><td id='userb'>" + docs[i].username + "</td><td id='userc'>" + docs[i].role + "</td><td id='usere'>" + docs[i].ids + "</td></tr>");

			}
		});
	});
	$('#myModal').modal('hide');

};
//load user from database to user mgt (UI)
nControl.showuser = function () {
	if (role == "SUPER"){
	db.user.find({}).sort({
		ids: 1
	}).exec(function (err, docs) {
		nControl.userList = docs;
		$('.user .table').html('');
		$('.user .table').append(userdiv);
		for (var i = 0, j = docs.length; i < j; i++) {
			$('.user .table').append("<tr><td id='entryia'><div class='btn-group'><button class=\"btn btn-danger btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onClick=\"nControl.removeuser(" + docs[i].ids + ");\">x</button><button class=\"btn btn-warning btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onclick=\"nControl.updateuser(" + docs[i].ids + ")\">Update</button></div></td><td id='entryib'>" + docs[i].username + "</td><td id='entryic'>" + docs[i].role + "</td><td id='entryie'>" + docs[i].ids  + "</td></tr>");

		}
	});
	} else {
		db.user.find({}).sort({
		ids: 1
	}).exec(function (err, docs) {
		nControl.userList = docs;
		$('.user .table').html('');
		$('.user .table').append(userdiv);
		for (var i = 0, j = docs.length; i < j; i++) {
			if(docs[i].role == "SUPER"){
			$('.user .table').append("<tr><td id='entryia'><div class='btn-group'><button disabled class=\"btn btn-danger btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onClick=\"nControl.removeuser(" + docs[i].ids + ");\">x</button><button disabled class=\"btn btn-warning btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onclick=\"nControl.updateuser(" + docs[i].ids + ")\">Update</button></div></td><td id='entryib'>" + docs[i].username + "</td><td id='entryic'>" + docs[i].role + "</td><td id='entryie'>" + docs[i].ids  + "</td></tr>");
			} else {
				$('.user .table').append("<tr><td id='entryia'><div class='btn-group'><button class=\"btn btn-danger btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onClick=\"nControl.removeuser(" + docs[i].ids + ");\">x</button><button class=\"btn btn-warning btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onclick=\"nControl.updateuser(" + docs[i].ids + ")\">Update</button></div></td><td id='entryib'>" + docs[i].username + "</td><td id='entryic'>" + docs[i].role + "</td><td id='entryie'>" + docs[i].ids  + "</td></tr>");
			}

	}
			});
}};




