// inserting id and password to node.db
$('.modalsetingssave').click(function () {
	//get the data from the user
	var id = $('.idd').val();
	var password = $('.password').val();
	// save the data received from the user into the db.node
	db.prefs.insert([
		{
			id: id
			, password: password
		}
	]);
});
