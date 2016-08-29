// inserting id and password to node.db
$('.modalsetingssave').click(function () {
	//get the data from the user
	var unit = $('.unitname').val();
	var address = $('.address').val();
	var thanknote = $('.thanknote').val();
	var tin = $('.tin').val();
	var stax = $('.stax').val();
	var vat = $('.vat').val();
	var gst= $('.gst').val();
	var id = $('.idd').val();
	var password = $('.password').val();
	// save the data received from the user into the db.node
	db.prefs.count({}, function (err, count) {
	'use strict';
		//if not able to find super the show create user modal
	if(count === 0){
	db.prefs.insert([
		{
			 unit: unit
			,address: address
			,thanknote: thanknote
			,tin: tin
			,servicetax: stax
			,vat: vat
			,gst: gst
			,id: id
			,password: password
		}
	]);
      } else {
		 db.prefs.remove ({}, {});
		db.prefs.insert([
		{
			 unit: unit
			,address: address
			,thanknote: thanknote
			,tin: tin
			,servicetax: stax
			,vat: vat
			,gst: gst
			,id: id
			,password: password
		}
	]);
	}

});
});


// adding setting data to xml
