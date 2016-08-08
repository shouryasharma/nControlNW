//check internet connectivity
nControl.checkInternet = function () {
	require('dns').resolve('nemi.in', function (err) {
		if (err) {
			toastr.info('NO CONNECTION');
		}
		else {
			toastr.info('CONNECTED');
		}
	});
};

//Synchronization parameters & variables
var cid = 20,
    pass = "harry",
    syncTimeInterval = 3000,
    url = 'http://199.79.62.121:3306/ncontrol/cloud/post_items.php',
    syncTimeIntervalSales = 6000,
    urlSales = 'http://199.79.62.121:3306/ncontrol/cloud/post_sales.php';

//Send items to the server
nControl.sendItems = function (data) {
	$.ajax({
		type: 'POST',
		url: url,
		data: JSON.stringify(data),
		success: function(data){
      		alert(JSON.stringify(data));
    		},
		error: function(jqXhr, textStatus, errorThrown){
        		//Handle error message
		},
		contentType: 'application/json',
		async: true
	});
};

//Get items from the items database
nControl.getItems = function () {
	db.items.find({}).sort({
		"num": 1
	, }).exec(function (err, docs) {
		nControl.syncArray = [];
		for (var i = 0, j = docs.length; i < j; i++) {
			if (i === 0) {
				nControl.syncArray.push({
					pass: pass
					, cid: cid
					, name: docs[i].name
					, price: docs[i].price
					, num: docs[i].num
					, category: docs[i].category
				});
			} else {
				nControl.syncArray.push({
					name: docs[i].name
					, price: docs[i].price
					, num: docs[i].num
					, category: docs[i].category
				});
			}
			//Create Array of the items

		}
		nControl.sendItems(nControl.syncArray);
	});
};

//Send sales to the server
nControl.sendsales = function (data) {
	$.ajax({
		type: 'POST',
		url: urlSales,
		data: JSON.stringify(data),
		success: function(data){
//        		alert(JSON.stringify(data));
			var j =JSON.stringify(data);
			var n = j.length;
			if(j.substring(n-7,n-2) == "1aend"){
				alert();
				nControl.removeSales();
			}
    		},
		error: function(jqXhr, textStatus, errorThrown){
        		//Handle error message
		},
		contentType: 'application/json',
		async: true
	});
};


//Get items from the sales database
nControl.getsales = function () {
	db.sales.find({}).sort({
		"entrynum": 1
	, }).exec(function (err, docs) {
		//call set true f()
		nControl.flushUpadate();
		nControl.syncArray1 = [];
		for (var i = 0, j = docs.length; i < j; i++) {
			for (var k=0,n =docs[i].details.items.length; k<n; k++){
			//Create Array of the items
			nControl.syncArray1.push({
				  pass: pass
				, cid: cid
				, flushflag: docs[i].flushflag
				, entrynum: docs[i].entrynum
				, date: docs[i].date
				, amount: docs[i].amount
				, from: docs[i].from
				, show: docs[i].show
				, mode: docs[i].mode
				, direction: docs[i].direction
				, customer: docs[i].details.customer
				, contact: docs[i].details.contact
				, summary: docs[i].details.summary
				, name: docs[i].details.items[k].name
				, price: docs[i].details.items[k].price
				, qty: docs[i].details.items[k].qty
				, num: docs[i].details.items[k].num
                        , category: docs[i].details.items[k].category
			});
		} }
		nControl.sendsales(nControl.syncArray1);
	});
};

//flusing data from node
//nControl.flush();
nControl.flushUpadate = function(){
	db.sales.find({}).sort({
		"entrynum": 1
	, }).exec(function (err, docs) {
		for (var i = 0, j = docs.length; i < j; i++) {
			var date = docs[i].date;
			var currentDate = Date();
			var d = new Date(date);
			var u = new Date(currentDate);
			var dateDays = (d.getMonth() + 1)*30+d.getDate()+d.getFullYear()*365;
			var currentDateDays = (u.getMonth() + 1)*30+u.getDate()+u.getFullYear()*365;
			var dayDiff = currentDateDays - dateDays;
			if(dayDiff>0){
				db.sales.update({
		                entrynum: i
	                          }, {
		                 $set: {
			               flushflag: 1
		                 }

			           })
			}
}})};

// removinf sales in machine
nControl.removeSales = function(){
	db.sales.remove ({flushflag: 1}, {multi: true}, function (err, numRemoved) {
		alert(numRemoved);

	});
};
