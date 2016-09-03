var nControl = {},
    example = {},
    details = {},
    gui = require('nw.gui'),
    win = gui.Window.get(),
    amount = 0,
    from = 'control',
    direction, docs, stock = 0,
    authset = false,
    appendtable = "<thead><tr><th id='entrya'>Action</th><th id='entryb'>TRN-ID</th><th id='entryc'>Date</th><th id='entryd'>Details</th><th id='entrye'><span style='color:blue'>In</span><span style='color:#999'>/</span><span style='color:red'><b>Out</b></span></th><th id='entryf'>Amount</th></thead>",
    entrynum,nbillno, flag = 0,
    appendinv = "<thead><tr><th id='itemsa'>Action</th><th id='itemsp'>IMG</th><th id='itemsb'>Name</th><th id='itemsc'>Price</th><th id='itemse'>PID/DN</th><th id='itemsg'>Category</th></thead>",
    userdiv = "<thead><tr><th id='usera'>Action</th><th id='userb'>Name</th><th id='userc'>role</th><th id='usere'>ID</th></thead>";
nControl.init = function () {
	var n = nControl;
	n.presets();
	//auth requires presets
	n.auth();
	//pay requires print
	n.loadEntries();
};

//Presets
nControl.presets = function () {
	gui.Window.get().show();
	$('.total').html(0);
	$('.extra').hide();
	//    $('.control2').hide();
	$('#itemsmanager').hide();
	$('#usermanager').hide();
	//Following are disabled without password
	$('.controlitems').addClass('disabled');
	$('.settingbutton').addClass('disabled');
	$('.checkbackupdata').addClass('disabled');
	$('.usermgtmgt').addClass('disabled');
	$('.importitems').addClass('disabled');
	$('.execute').addClass('disabled');
	$('.totalpedigree').hide();
//	$('#myModal').modal('show');
	$('#myModal1').modal({backdrop: 'static', keyboard: false});
	$('#myModal1 .modal-title').html('Welcome to <b>nControl</b>');
	$('#myModal1 .modal-body').html('Login To nControl<br><br><div class="row"><div class="col-lg-6"></div><!-- /input-group --></div><!-- /.col-lg-6 --><div class="col-lg-6"><div class="input-group"><input class=\"luser form-control\" type=\"text\" placeholder=\"Username\" autofocus><input class=\"authpass form-control\" type=\"password\" placeholder=\"Password\"><input class="authbutton btn btn-primary" type="submit" value="Login"></span></div></div></div><br><br><br><br><br><div class="alert alert-warning" id=\"nmsg\"></div>');
	$('#notifaction').hide();
	$('.authbutton').addClass('authgo');
	$('#notifclosebutton').html('Ignore');
	$('#nmsg').hide();
	//Popover(s)
	$('#example').popover({
		html: true,
		title: '<b>Note:</b> This will not work if there is no present qty. Click the Stock input box again to make this disappear.'
	});
	$('#examplepid').popover({
		html: true,
		title: '<b>Tip</b>',
		trigger: 'hover'
	});
	$('#entryc').popover({
		title: '<b>Date</b>',
		trigger: 'click'
	});
	//Typehead(s)
	$('#the-basics .typeahead').typeahead({
		hint: true,
		highlight: true,
		minLength: 1
	}, {
		name: 'states',
		displayKey: 'value',
		source: substringMatcher(nControl.itemCategories)
	});
	//Search Filters Modal
	$('.filter').click(function () {
		$('#myModal').modal('show');
		$('#myModal .modal-title').html('<b>Search</b> using the following filters:');
		$('#myModal .modal-body').html('<b>TRN ID:</b><br><input id="strnid" type="text" class="form-control" placeholder="TRN-ID"><br><b>Direction:</b><br><div style="display:inline;" class="btn-group" data-toggle="buttons"><label class="btn btn-default"><input type="radio" name="sdirection" id="sin" value="In">In</label><label class="btn btn-default"><input type="radio" name="sdirection" id="sout" value="Out">Out</label></div><br><br><br><b>Date:</b><br>Start <input style="display:inline;width:160px;" type="date" class="sstartdate form-control" disabled> End <input style="display:inline;width:160px;" type="date" class="senddate form-control" placeholder="End Date" disabled><br><br><b>Product Details</b><input id="sitem" type="text" class="sitemname form-control" placeholder="Name" disabled><input type="text" class="form-control" placeholder="PID or DN" disabled><br><b>Customer Details:</b><br><input type="text" class="scustomername form-control" placeholder="Name"><input type="text" class="scustomercontact form-control" placeholder="Contact">');
		$('#notifaction').show();
		$('#notifclosebutton').html('Close');
		$('#notifaction').html('Search');
		$('#notifaction').attr("onClick", "nControl.search();");
	});
};
nControl.billItems = [];
nControl.itemCategories = [];
//visit website link
nControl.website = function () {
	'use strict'
	require('nw.gui').Shell.openItem('http://www.nemi.in');
};

//insert into db.sales
$('.execute').click(function () {
	'use strict';
	//Get entry data from user
	billno();
	window.details.summary = $('.details').val();
	window.amount = $('.amount').val();
	//count total entries in db.sales after user clicks on given button
	//insert entries in db.sales after user clicks on given button
	if ($('#in').is(':checked') || $('#out').is(':checked')) {
		if ($('#in').is(':checked')) {
			direction = 'In';
		} else {
			direction = 'Out';
		}
		database.getEntryNum();
		db.sales.count({}, function (err, count) {
			window.entrynum = count + 1;
		}, db.sales.insert({
			entrynum: entrynum,
			date: Date(),
			date1: Date().substr(4, 12),
			billno: nbillno,
			details: details,
			amount: amount,
			from: 'manual',
			direction: direction,
			show: true
		}));
		//load entries from db.sales after user clicks on given button
		db.sales.find({}).sort({
			entrynum: -1
		}).exec(function (err, docs) {
			window.docs = docs;
			var x, i = 0, j = docs.length;
			$('#entries').html('');
			$('.amount').val('');
			$('.details').val('');
			$("#entries").append(appendtable);
			for (i = 0; i < j; i++) {
				if (docs[i].show === false) {
					x = 'none';
				} else {
					x = 'inline';
				}
				$("#entries").append("<tr style=\"display:" + x + "\"><td id=\"entrya\"><div class='btn-group'><button class='btn btn-xs btn-danger' onclick=\"nControl.confirmrementry(" + docs[i].entrynum + ");\">x</button>&nbsp;<button class='btn btn-xs btn-info' onclick=\"viewdetails(" + docs[i].entrynum + ");\" class='actionview'>View</button></div></td>" + "<td id='entryb'>" + docs[i].entrynum + "</td>" + "<td id='entryc' data-content=" + docs[i].date + ">" + docs[i].date + "</td>" + "<td id='entryd'>" + docs[i].details.summary + "</td>" + "<td id='entrye' class='direction'>" + docs[i].direction + "</td>" + "<td id='entryf'>" + docs[i].amount + "</td></tr>");
			}
			$("entries").append("<tbody></table>");
			showbalance();
		});
	}
	else {
		$("#myModal").modal('show');
		$("#notifaction").hide();
		$("#notifclosebutton").html('Close');
		$("#myModal .modal-body").html("Neither 'In' nor 'Out' selected.");
	}
});

nControl.getUserDataPath = function () {
	'use strict';
	var path = require('path');
	return path.dirname(process.execPath);
};
//Create and/or load .sales
//var sha1 = require('sha1');
//alert(sha1("message"));
var Datastore = require('nedb');
var db = {};
db.sales = new Datastore({
	filename: nControl.getUserDataPath() + '/data/sales.db'
	, autoload: true
});
db.items = new Datastore({
	filename: nControl.getUserDataPath() + '/data/items.db'
	, autoload: true
});
db.prefs = new Datastore({
	filename: nControl.getUserDataPath() + '/data/prefs.db'
	, autoload: true
});
db.user = new Datastore({
	filename: nControl.getUserDataPath() + '/data/user.db'
	, autoload: true
});
//var billno
db.sales.count({date1 : Date().substr(4, 12)}, function(err, cou){
	'use strict';
	nbillno = cou + 1;
//	alert(cou);
//	alert("it is in var" + nbillno);
});
//var entrynum;
db.sales.count({}, function (err, count) {
	'use strict';
	entrynum = count + 1;
});
//Shows balance in Control
function showbalance() {
	'use strict';
	var inside = 0,
	    outside = 0,
	    balance = 0;
	$('.direction').each(function () {
		//check if visible
		if ($(this).parent().css('display') === 'inline') {
			//check if direction=in
			if ($(this).html() === 'In') {
				//add all ins
				var x = parseInt($(this).next().html());
				if (isNaN(x) === false) {
					inside += x;
				}
			}
			//check if direction=out
			if ($(this).html() === 'Out') {
				//add all outs
				var y = parseInt($(this).next().html());
				if (isNaN(y) === false) {
					outside += y;
				}
			}
		}
	});
	//calculate balance
	balance = inside - outside;
	$('#showbalance').html(balance);
}
//Removes entry from Control
function removeentry(a) {
	'use strict';
	db.sales.update({
		entrynum: a
	}, {
		$set: {
			show: false
		}
	}, {
		multi: false
	}, function () {
		//find and append docs
		db.sales.find({}).sort({
			entrynum: -1
		}).exec(function (err, docs) {
			window.docs = docs;
			var x, i = 0
				, j = docs.length;
			$('#entries').html('');
			$('.amount').val('');
			$('.details').val('');
			$("#entries").append(appendtable);
			for (i = 0; i < j; i++) {
				if (docs[i].show === false) {
					x = 'none';
				}
				else {
					x = 'inline';
				}
				$("#entries").append("<tr style=\"display:" + x + "\"><td id=\"entrya\"><div class='btn-group'><button class='btn btn-xs btn-danger' onclick=\"nControl.confirmrementry(" + docs[i].entrynum + ");\">x</button>&nbsp;<button class='btn btn-xs btn-info' onclick=\"viewdetails(" + docs[i].entrynum + ");\" class='actionview'>View</button></div></td>" + "<td id='entryb'>" + docs[i].entrynum + "</td>"+ "<td id='entryc' data-content='" + docs[i].date + "' >" + docs[i].date + "</td>" + "<td id='entryd'>" + docs[i].details.summary + "</td>" + "<td id='entrye' class='direction'>" + docs[i].direction + "</td>" + "<td id='entryf'>" + docs[i].amount + "</td></tr>");
			}
			$("entries").append("<tbody></table>");
			showbalance();
		});
	});
	$('#myModal').modal('hide');
}
//Shows the details of an individual entry in control
function viewdetails(a) {
	'use strict';
	db.sales.findOne({
		entrynum: a
	}, function (err, docs) {
		//check whether doc is from pos or not
		if (docs.from === 'pos') {
			$("#parta").html("<b>Bill No.:</b>"+ docs.billno +"<br><b>Entry Number:</b> " + a + "<br><b>Date/Time:</b> " + docs.date + "<br><b>Entry Type:</b> " + docs.from + "<br><b>Mode:</b> " + docs.mode + "<br><b>Direction:</b> " + docs.direction + "<br><b>Amount:</b> " + docs.amount + "<br><b>Details:</b> " + docs.details.summary + "<br><br><b>Customer:</b> " + docs.details.customer + "<br><b>Contact Number:</b> " + docs.details.contact);
			$("#partb").html("");
			var i = 0
				, j = Object.keys(docs.details.items).length;
			for (i = 0; i < j; i++) {
				$("#partb").append("<tr><td><input class=\"form-control\" style=\"width:212px;\" type=\"text\" readonly=\"readonly\" value=\"" + docs.details.items[i].name + "\"\"></td><td><input type=\"number\" class=\"form-control\" style=\"width:70px;\" readonly=\"readonly\" value=\"" + docs.details.items[i].qty + "\"></td><td><input type=\"number\" class=\"form-control\" style=\"width:70px;\" readonly=\"readonly\" value=\"" + docs.details.items[i].price + "\"></td></tr>");
			}
		}
		else {
			$("#partb").html("");
			$("#parta").html("<b>Entry Number:</b> " + a + "<br><b>Date/Time:</b> " + docs.date + "<br><b>Direction:</b> " + docs.direction + "<br><b>Amount:</b> " + docs.amount + "<br><b>Details:</b> " + docs.details.summary);
		}
	});
}
//checking user in database
var user;
nControl.checkUsers = function (){
	db.user.count({}, function (err, count) {
	'use strict';
	user = count;
		});
}

//Print via javascript
nControl.print = function (elem) {
    'use strict';
    nControl.Popup($(elem).html());
};
var unit,thanknode,address;
db.prefs.find({}, function (err,docs){unit= docs[0].unit; address = docs[0].address;thanknode = docs[0].thanknote });
nControl.Popup = function (data) {
    'use strict';

	db.prefs.find({}, function (err,docs){unit= docs[0].unit; address = docs[0].address;thanknode = docs[0].thanknote });
    var i = 0,
        j = nControl.billItems.length,
        mywindow = window.open('', 'billitem', 'width=230px');
    mywindow.document.write('<html><head><title>Receipt</title>');
    /*optional stylesheet*/
    mywindow.document.write('<link rel="stylesheet" href="styles/print.css" type="text/css">');
    mywindow.document.write('</head><body><div id="bill"><br><b>'+unit+'</b><br>'+address+'<br>'+thanknode+'<br>' + Date() + '<br>' + 'TRN ID: ' + entrynum + '<br>Customer: ' + $('.cname').val() + '<br>Contact: ' + $('.ccontact').val() +
        '<br><br><hr><table>');
    for (i = 0; i < j; i++) {
        mywindow.document.write("<tr style=\"width:230px;\"><td style=\"padding-right:20px;\">" + nControl.billItems[i].name + "</td><td style=\"padding-right:20px;\">" + nControl.billItems[i].qty + "</td><td>" + (nControl.billItems[i].qty) * (nControl.billItems[i].price) + "</td></tr>");
    }
    mywindow.document.write('</table><br><br><b>TOTAL: ' + nControl.total() + '<b><br>Thank you for visiting<hr><div id="nemiinfo">nControl, Powered by Nemi<br>www.nemi.in</div></div><script type="text/javascript" src="scripts/print.js"></script></body></html>');
//	mywindow.print();
//	window.print();
    setTimeout(function () {
        mywindow.print();
    }, 100);
//    setTimeout(function () {
//        mywindow.close();
//    }, 100);

    return true;
};
//Popover quantity set
//nControl.qtySet = function () {
//	var x = parseInt($('#qtypop').val());
//	var y = parseInt($('#example').val());
//	if ($('#qin').is(':checked')) {
//		$('#example').val(x + y);
//		$('#example').popover('hide');
//	}
//	else if ($('#qout').is(':checked')) {
//		$('#example').val(y - x);
//		$('#example').popover('hide');
//	}
//	else {
//		$('#myModal').modal('show');
//		$('#notifaction').hide();
//		$('#notifclosebutton').html('Close');
//		$('#myModal .modal-title').html('Attention!');
//		$('#myModal .modal-body').html('Neither In nor Out was selected. Please select any one of them to continue.');
//	}
//};
//Default view
$('#make.control').hide();
//Menu function
nControl.setView = function (view) {
	'use strict';
	switch (view) {
		case 0:
			$('#billitem').css("overflow-y", "scroll");
			$('#billitem').css("border", "1px solid #eee");
			$('#itemsmanager').hide();
			$('#usermanager').hide();
			$('#itemscontent').hide();
			$('#make.bill').hide();
			$('#money').fadeIn();
			$('#make.control').show();
			$('#items .panel-title.a').html('Control');
			$('#partc').hide();
			$('#parta').show();
			$('#parta').html('');
			$('#partb').show();
			$('#partb').html('');
			$('#partd').hide();
			break;
		case 1:
			$('#money').hide();
			$('#usermanager').hide();
			$('#make.control').hide();
			$('#itemsmanager').hide();
			$('#make.bill').show();
			$('#itemscontent').fadeIn();
			$('#items .panel-title.a').html('Sell');
			break;
		case 2:
			if (nControl.billItems.length === 0) {
				nControl.pid();
				$('#billitem').css("overflow-y", "hidden");
				$('#billitem').css("border", "hidden");
				$('#money').hide();
				$('#parta').hide();
				$('#partb').hide();
				$('#itemsmanager').fadeIn();
				$('#partc').show();
				$('#items .panel-title.a').html('items');
				$('#partd').hide();
				$('#usermanager').hide();
				break;
			} else {
				nControl.setView(1);
				$('#myModal').modal('show');
				$('#notifaction').hide();
				$('#notifclosebutton').html('Close');
				$('#myModal .modal-title').html('Attention!');
				$('#myModal .modal-body').html('You cannot modify items while you have a bill pending!');
			}
		case 3:
			$('#partd').show();
			$('#itemsmanager').hide();
			$('#itemscontent').hide();
			$('#usermanager').show();
			$('#money').hide();
			$('#parta').hide();
			$('#partb').hide();
			$('#partc').hide();
			$('#make.bill').hide();
			$('#billitem').css("border", "hidden");
			$('#billitem').css("overflow-y", "hidden");
			$('#items .panel-title.a').html('User list');
			break;

	}
};
//Adds items from items to bill
nControl.addFromProducts = function (a) {
	'use strict';
	var pos = 0
		, i = 0
		, j = nControl.productList.length;
	for (i = 0; i < j; i++) {
		//get the location
		if (nControl.productList[i].num === a) {
			pos = i;
			break;
		}
	}
	if (nControl.billItems.length === 0) {
		nControl.billItems.push(nControl.productList[pos]);
		for (i = 0, j = nControl.billItems.length; i < j; i++) {
			if (nControl.billItems[i].num === a) {
				nControl.billItems[i].qty = 1;
			}
		}
	}
	else {
		for (i = 0, j = nControl.billItems.length; i < j; i++) {
			flag = 0;
			//If a matching item is found, increment its quantity
			if (nControl.billItems[i].num === a) {
				nControl.billItems[i].qty++;
				break;
			}
			else {
				flag = 1;
			}
		}
		if (flag === 1) {
			nControl.billItems.push(nControl.productList[pos]);
			for (i = 0, j = nControl.billItems.length; i < j; i++) {
				if (nControl.billItems[i].num === a) {
					nControl.billItems[i].qty = 1;
				}
			}
		}
	}
	nControl.updateBill();
};
// adding item to bill
nControl.updateBill = function () {
	'use strict';
	var i = 0
		, j = nControl.billItems.length;
	$('.printitems table').html('');
	$('.printitems table').append('<thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Action</th></tr></thead><tbody>');
	//look up the billitems array to fetch items to print to DOM
	for (i = 0; i < j; i++) {
		$('.printitems table').prepend("<tr class=\"listitem\"><td style=\"max-width:205px;min-width:205px;\">" + nControl.billItems[i].name + "</td><td style=\"width:70px;\">" + nControl.billItems[i].qty + "</td><td style=\"width:92px;\">" + nControl.billItems[i].price + "</td><td style=\"width:90px;\"><div class='btn-group'><button style=\"\" class='btn btn-xs btn-danger' onclick=\"nControl.remove(" + nControl.billItems[i].num + ")\">x</button><button style=\"\" class='btn btn-xs btn-primary' autocomplete='off' onclick=\"nControl.qtyUpdate(" + nControl.billItems[i].num + ")\">Qty</button></div></td></tr>");
	}
	$('.printitems table').append('</tbody></table>');
};
//Change the qty of any item in current bill
nControl.qtyUpdate = function (index) {
	'use strict';
	var tempName, tempQty, i = 0
		, j = nControl.billItems.length;
	for (i = 0; i < j; i++) {
		if (nControl.billItems[i].num === index) {
			tempName = nControl.billItems[i].name;
			tempQty = nControl.billItems[i].qty;
			break;
		}
	}
	$('#mySmallModal').modal('show');
	$('#mySmallModal .modal-content').html('<b>Update Quantity</b> for: ' + tempName + '&nbsp;&nbsp;<input type="number" value="' + tempQty + '" min="1" class="newqty form-control" style="width:100px;display:inline;">&nbsp;<button style="display:inline;" onClick="nControl.setNewQty(' + index + ');" class="btn btn-primary">Set</button>');
};
// quantity to popup
nControl.setNewQty = function (index) {
	'use strict';
	var qty = parseInt($('.newqty').val())
		, i = 0
		, j = nControl.billItems.length;
	if (qty !== null && qty !== undefined && qty !== 0 && qty !== '') {
		for (i = 0; i < j; i++) {
			if (nControl.billItems[i].num === index) {
				nControl.billItems[i].qty = qty;
				break;
			}
		}
		nControl.total();
		nControl.updateBill();
		$('#mySmallModal').modal('hide');
	}
	else {
		$('#mySmallModal .modal-content').append('&nbsp;&nbsp;Please try again!');
	}
};
// remove item from bill
nControl.remove = function (index) {
	'use strict';
	var i = 0
		, j = nControl.billItems.length;
	for (i = 0; i < j; i++) {
		if (nControl.billItems[i].num === index) {
			nControl.billItems.splice(i, 1);
			break;
		}
	}
	nControl.total();
	nControl.updateBill();
};
//clear all billitems
nControl.reset = function () {
	'use strict';
	nControl.billItems.splice(0, nControl.billItems.length);
	$('.printitems table').html('');
	$('.total').html(0);
	nControl.billItems = [];
	$('.cname').val('');
	$('.ccontact').val('');
};
//total amount of all the individual prices
nControl.total = function () {
	'use strict';
	var total = 0
		, i = 0
		, j = nControl.billItems.length;
	for (i = 0; i < j; i++) {
		total += nControl.billItems[i].price * nControl.billItems[i].qty;
	}
	window.dototal = total;
	$('.total').html('');
	$('.total').html(total);
	return total;
};
//check whether atleast 1 item exists
nControl.pay = function () {
	'use strict';
	if (nControl.billItems.length >= 1) {
		//        $('#notificationoff').attr('id', 'notificationon');
		//        $('#notificationon').html('');
		$('#myModal').modal('show');
		$('#myModal .modal-title').html('Payment');
		$('#notifclosebutton').show();
		$('#notifaction').hide();
		$('#notifclosebutton').html('Cancel');
		$('#myModal .modal-body').html('Please select a payment mode:<br><br><b>Total: </b>' + nControl.total() + '<br><br><br><button class="btn btn-primary" style="width:60px;" class="executepos" onClick="nControl.executepos(\'cash\');nControl.notifClose();nControl.print(\'.printitems\');">Cash</button><button class="btn btn-primary" style="width:60px;" onClick="nControl.executepos(\'card\');nControl.notifClose();nControl.print(\'.printitems\');">Card</button>');
	}
	else {
		$('#myModal').modal('show');
		$('#notifaction').hide();
		$('#notifclosebutton').html('Close');
		$('#myModal .modal-body').html('Please add atleast 1 item to proceed');
	}
};
nControl.notifClose = function () {
	$('#myModal').modal('hide');
};
// comfirmation of closing app
nControl.confirm = function () {
	'use strict';
	if (nControl.billItems.length === 0) {
		$('#myModal .modal-title').html('Attention!');
		$('#myModal .modal-body').html('Are you sure you want to quit <b>nControl</b>?');
		$('#notifaction').show();
		$('#notifaction').html('Yes');
		$('#notifaction').attr("onClick", "nControl.appClose();");
		$('#notifclosebutton').html('No');
	}
	else {
		nControl.setView(1);
		$('#myModal').modal('show');
		$('#notifaction').hide();
		$('#notifclosebutton').html('Close');
		$('#myModal .modal-title').html('Attention!');
		$('#myModal .modal-body').html('You still have a bill pending!');
	}
};
// close app
nControl.appClose = function () {
	'use strict';
	//    window.close();
	gui.App.quit();
};
// minimize running app
nControl.appMinimize = function () {
	'use strict';
	var win = gui.Window.get();
	win.minimize();
};
// restart app
nControl.appRestart = function () {
	'use strict';
	document.location.reload(true);
};
nControl.about = function () {
	$('#myModal').modal('show');
	$('#myModal .modal-title').html('About <b>nControl</b>');
	$('#myModal .modal-body').html('nControl pre-BETA version<br><br>Copyright 2011-14 <b>Nemi Rådgivning</b>. All rights reserved.<br><br>Made with <3 for web technologies by <b>Nemi Rådgivning</b>.<br>');
	$('#notifaction').hide();
	$('#notifclosebutton').html('Close');
};
// search for customer
nControl.search = function () {
	//Clear previous filters
	filters = {
		"details.customer": $('.scustomername').val()
		, "details.contact": parseInt($('.scustomercontact').val())
	};
	//filter(s)
	//filter-1-Direction
	if ($('#sin').is(':checked')) {
		filters.direction = /In/;
	}
	if ($('#sout').is(':checked')) {
		filters.direction = /Out/;
	}
	//filter-2-TRN-ID
	if ($('#strnid').val() !== '') {
		filters.entrynum = parseInt($('#strnid').val());
	}
	//filter-3-Date
	//    if ($('.sstartdate').val() !== '' && $('.senddate').val() !== '') {
	//        filters.date = {
	//            $gte: $('.sstartdate').val(),
	//            $lte: $('.senddate').val()
	//        };
	//    }
	//filter-4-customer-name
	//    if ($('.scustomername').val() !== '') {
	//        filters = {
	//            "details.customer": parseInt($('.scustomername').val())
	//        };
	//    }
	//filter-5-customer-contact
	if ($('.scustomercontact').val() === '') {
		delete filters["details.contact"];
	}
	if ($('.scustomername').val() === '') {
		delete filters["details.customer"];
	}
	//to DOM
	nControl.loadEntries(filters);
	nControl.notifClose();
};
//Date
 nControl.billno = function(){
	db.sales.count({date1 : Date().substr(4,12)}, function(err, cou){
		nbillno=cou+1;
//		alert(cou);
//		alert("it is function"+nbillno);
	})
}
//alert(Date().substr(4,12));

//insert from pos [cash/card mode]
nControl.executepos = function (mode) {
	'use strict';
	nControl.billno();
	details.items = nControl.billItems;
	details.customer = $('.cname').val();
	details.contact = parseInt($('.ccontact').val());
	window.details.summary = 'POS Entry';
	direction = 'In';
	db.sales.count({}, function (err, count) {
		window.entrynum = count + 1;
	}, db.sales.insert({
		entrynum: entrynum
		, date: Date()
		, date1: Date().substr(4,12)
		, billno: nbillno
		, details: details
		, amount: nControl.total()
		, from: 'pos'
		, mode: mode
		, direction: direction
		, show: true
		,flushflag: 0
	}));
	//load entries from db.sales after user clicks on given button
	db.sales.find({}).sort({
		entrynum: -1
	}).exec(function (err, docs) {
		window.docs = docs;
		var x, i = 0
			, j = docs.length
			, l = 0
			, m = nControl.billItems.length;
		$('#entries').html('');
		$('.amount').val('');
		$('.details').val('');
		$("#entries").append(appendtable);
		for (i = 0; i < j; i++) {
			if (docs[i].show === false) {
				x = 'none';
			}
			else {
				x = 'inline';
			}
			$("#entries").append("<tr style=\"display:" + x + "\"><td id=\"entrya\"><div class='btn-group'><button class='btn btn-xs btn-danger' onclick=\"nControl.confirmrementry(" + docs[i].entrynum + ");\">x</button>&nbsp;<button class='btn btn-xs btn-info' onclick=\"viewdetails(" + docs[i].entrynum + ");\" class='actionview'>View</button></div></td>" + "<td id='entryb'>" + docs[i].entrynum + "</td>" + "<td id='entryc' data-content='" + docs[i].date + "' >" + docs[i].date + "</td>" + "<td id='entryd'>" + docs[i].details.summary + "</td>" + "<td id='entrye' class='direction'>" + docs[i].direction + "</td>" + "<td id='entryf'>" + docs[i].amount + "</td></tr>");
		}
		$("entries").append("<tbody></table>");
		showbalance();
		for (l = 0; l < m; l++) {
			nControl.deduct(nControl.billItems[l].num, nControl.billItems[l].qty);
		}
		nControl.reset();
	});
	nControl.billno();
};
//deduct the qty from items stock
nControl.deduct = function (dnum, dqty) {
	'use strict';
	db.items.find({
		num: dnum
	}, function (err, docs) {
		stock = docs[0].qty - dqty;
		if (docs.qty !== null && docs.qty !== NaN) {
			db.items.update({
				num: dnum
			}, {
				$set: {
					qty: stock
				}
			}, {
				multi: false
			}, function (err, numReplaced) {});
		}
		//load items from db.items to display
		db.items.find({}).sort({
			num: 1
		}).exec(function (err, docs) {
			nControl.productList = docs;
			$('.itemsitems .table').html('');
			$('.itemsitems .table').append(appendinv);
			for (var i = 0, j = docs.length; i < j; i++) {
				$('.itemsitems .table').append("<tr><td id='itemsa'><div class='btn-group'><button class=\"btn btn-danger btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onClick=\"nControl.removeinv(" + docs[i].num + ");\">x</button><button class=\"btn btn-warning btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onclick=\"nControl.updateInv(" + docs[i].num + ")\">Update</button></div></td><td id='itemsb'>" + docs[i].name + "</td><td id='itemsc'>" + docs[i].price + "</td><td id='itemse'>" + docs[i].num + "</td><td id='itemsg'>" + docs[i].category + "</td></tr>");
			}
		});
	});
};
nControl.confirmrementry = function (a) {
	'use strict';
	if (authset) {
		$('#myModal').modal('show');
	}
	else {
		$('#myModal').modal('hide');
	}
	$('#notifaction').show();
	$('#myModal .modal-title').html('<b>Attention!</b>');
	$('#myModal .modal-body').html('Are you sure you want to remove this?');
	$('#notifaction').attr("onClick", "removeentry(" + a + ");");
	$('#notifaction').html('Yes');
	$('#notifclosebutton').html('No');
};

//items

nControl.itemCategory = function () {
	$('#cattabs').html('');
	$('#catpanes').html('');
	var i = 0
		, arr = []
		, l = 0;
	db.items.find({}, function (err, docs) {
		var j = docs.length;
		for (i = 0; i < j; i++) {
			arr[i] = docs[i].category.toUpperCase();
		}
		var k = arr.length;
//		check if it exists
		while (l < k) {
			//if it doesnt exist push the value in the array
			if (nControl.itemCategories.indexOf(arr[l]) === -1) {
				nControl.itemCategories.push(arr[l]);
			} else {
				//if exists increment to check the next value
				l++;
			}
		}
		nControl.showitems();
		for (i = 0, j = nControl.itemCategories.length; i < j; i++) {
			if (i === 0) {
				$('#cattabs').append('<li class="active"><a href="#' + nControl.itemCategories[i] + '" data-toggle="tab">' + nControl.itemCategories[i] + '</a></li>');
			} else {
				$('#cattabs').append('<li><a href="#' + nControl.itemCategories[i] + '" data-toggle="tab">' + nControl.itemCategories[i] + '</a></li>');
			}
		}
		for (i = 0, j = nControl.itemCategories.length; i < j; i++) {
			if (i === 0) {
				$('#catpanes').append('<div class="tab-pane active" id="' + nControl.itemCategories[i] + '"><br><table id="' + nControl.itemCategories[i] + '"></table></div>');
			} else {
				$('#catpanes').append('<div class="tab-pane" id="' + nControl.itemCategories[i] + '"><br><table id="' + nControl.itemCategories[i] + '"></table></div>');
			}
		}
	});
};


//load items from database to Sell (UI)
nControl.showitems = function () {
	db.items.find({}).sort({
		num: 1
	}).exec(function (err, docs) {
		nControl.productList = docs;
		$('.itemsitems .table').html('');
		$('.itemsitems .table').append(appendinv);
		for (var i = 0, j = docs.length; i < j; i++) {
			$('.itemsitems .table').append("<tr><td id='itemsa'><div class='btn-group'><button class=\"btn btn-danger btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onClick=\"nControl.removeinv(" + docs[i].num + ");\">x</button><button class=\"btn btn-warning btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onclick=\"nControl.updateInv(" + docs[i].num + ")\">Update</button></div></td>" + "<td id=\"itemsp\"><img  width=\"60\" height=\"30\" src="+ docs[i].pic + "></td>" + "<td id='itemsb'>" + docs[i].name + "</td><td id='itemsc'>" + docs[i].price + "</td><td id='itemse'>" + docs[i].num + "<td id='itemsg'>" + docs[i].category + "</td></tr>");
			for (var m = 0, n = nControl.itemCategories.length; m < n; m++) {
				if (docs[i].category.toUpperCase() === nControl.itemCategories[m]) {
					$('#' + nControl.itemCategories[m]).append("<div class=\"btn btn-default\" onclick=\"nControl.addFromProducts(" + docs[i].num + ");nControl.total();\">"+ "<img  width=\"60\" height=\"45\" src="+ docs[i].pic + ">" + "<br>"  + docs[i].name + " - " + docs[i].price + "</div>");
				}
			}
		}
	});
};
//load aready existing items
nControl.itemCategory();
var filters = {};
nControl.loadEntries = function (a) {
	//load entries from db.sales
	db.sales.find(a).sort({
		entrynum: -1
	}).exec(function (err, docs) {
		'use strict';
		var x, i = 0
			, j;
		window.docs = docs;
		$('#entries').html('');
		$('.amount').val('');
		$('.details').val('');
		for (i = 0, j = docs.length; i < j; i++) {
			if (docs[i].show === false) {
				x = 'none';
			}
			else {
				x = 'inline';
			}
			$("#entries").append("<tr style=\"display:" + x + "\"><td id=\"entrya\"><div class='btn-group'><button class='btn btn-xs btn-danger' onclick=\"nControl.confirmrementry(" + docs[i].entrynum + ");\">x</button>&nbsp;<button class='btn btn-xs btn-info' onclick=\"viewdetails(" + docs[i].entrynum + ");\" class='actionview'>View</button></div></td>" + "<td id='entryb'>" + docs[i].entrynum + "</td>" + "<td id='entryc' autocomplete='off' data-content='" + docs[i].date + "'>" + docs[i].date + "</td>" + "<td id='entryd'>" + docs[i].details.summary + "</td>" + "<td id='entrye' class='direction'>" + docs[i].direction + "</td>" + "<td id='entryf'>" + docs[i].amount + "</td></tr>");
		}
		$("#entries").prepend(appendtable);
		showbalance();
	});
};
//Add to items
$('.addtoitems').click(function () {
	nControl.finditems();
	nControl.pid();
	//get the data from the user
	db.items.name = $('.itemsitem').val();
	db.items.price = parseInt($('.itemsprice').val());
	db.items.num = parseInt($('.itemsnum').val());
	db.items.pic = $('.picpicker').val();
	db.items.category = $('#itemscategory').val();
	db.items.category = db.items.category.replace(/\s/g, "-");
	db.items.find({
		num: db.items.num
	}, function (err, docs) {
		nControl.productList = docs;
		if (docs.length === 0) {
			if (db.items.name !== '' && db.items.price !== '' && db.items.num >= 1 && db.items.category !== '') {
				//save the data received from the user into the db.items
				db.items.insert([
					{
						name: db.items.name
						, price: db.items.price
						, num: db.items.num
						, category: db.items.category.toUpperCase()
						, pic : db.items.pic
            }
        ]);
				setTimeout(function () {
					nControl.itemCategory();
				}, 0);
				nControl.finditems();
				nControl.pid();
				$('.itemsitem').val('');
				$('.itemsprice').val('');
				$('.itemsnum').val('');
				$('#itemscategory').val('');
				$('.picpicker').val('');
			}
			else {
				$('#myModal').modal('show');
				$('#notifaction').hide();
				$('#notifclosebutton').show();
				$('#notifclosebutton').html('Close');
				$('#myModal .modal-body').html("All fields are mandatory");
			}
		}
		else {
			$('#myModal').modal('show');
			$('#notifaction').hide();
			$('#notifclosebutton').show();
			$('#notifclosebutton').html('Close');
			$('#myModal .modal-body').html("PID/DN already exists. Please enter a different number");
		}
	});
});
var substringMatcher = function (strs) {
	return function findMatches(q, cb) {
		var matches, substringRegex;
		// an array that will be populated with substring matches
		matches = [];
		// regex used to determine if a string contains the substring `q`
		substrRegex = new RegExp(q, 'i');
		// iterate through the pool of strings and for any string that
		// contains the substring `q`, add it to the `matches` array
		$.each(strs, function (i, str) {
			if (substrRegex.test(str)) {
				// the typeahead jQuery plugin expects suggestions to a
				// JavaScript object, refer to typeahead docs for more info
				matches.push({
					value: str
				});
			}
		});
		cb(matches);
	};
};
// remove item confirmation
nControl.removeinv = function (item) {
	$('#myModal .modal-body').html('Are you sure you want to remove this?');
	$('#notifaction').show();
	$('#notifclosebutton').html('No');
	$('#notifaction').html('Yes');
	$('#notifaction').attr("onClick", "nControl.remitems(" + item + ");");
};
// update item confirmation
nControl.updateInv = function (item) {
	$('#myModal .modal-title').html('Attention!');
	$('#myModal .modal-body').html('Are you sure you want to update?<br><b>CAUTION!</b> Trying to update this will result in its removal but its contents will be copied above.');
	$('#notifaction').show();
	$('#notifaction').html('Yes');
	$('#notifclosebutton').html('No');
	$('#notifaction').attr("onClick", "nControl.upditems(" + item + ");");
};
nControl.remitems = function (item) {
	db.items.remove({
		num: item
	}, {}, function (err, numRemoved) {
		//load items from db.items to display
		nControl.itemCategory();
	});
	$('#myModal').modal('hide');
	nControl.finditems();
	nControl.pid();
};
nControl.finditems = function () {
	db.items.find({}).sort({
		num: 1
	}).exec(function (err, docs) {
		nControl.productList = docs;
	});
};
//auto calculation of pid
nControl.pid = function () {
	nControl.finditems();
	db.items.count({}, function (err, count) {
		'use strict';
		//count gives us the numbers to look for
		var searchFlag = 0
			, searchNum = 1
			, reqNum, i = 0;
		while (searchNum <= (count + 1)) {
			searchFlag = 0;
			for (i = 0; i < count; i++) {
				if (nControl.productList[i].num === searchNum) {
					searchFlag++;
				}
			}
			if (searchFlag === 0) {
				break;
			}
			searchNum++;
		}
		$('.itemsnum').val(searchNum);
	});
};
// remove item from items
nControl.upditems = function (item) {
	db.items.find({
		num: item
	}, function (err, docs) {
		$('.itemsitem').val(docs[0].name);
		$('.itemsprice').val(docs[0].price);
		$('.itemsnum').val(docs[0].num);
		$('#itemscategory').val(docs[0].category);
		$('.picpicker').val(docs[0].pic);
	});
	//    $('.itemsitems').val();
	db.items.remove({
		num: item
	}, {}, function (err, numRemoved) {
		//load items from db.items to display
		db.items.find({}).sort({
			num: 1
		}).exec(function (err, docs) {
			nControl.productList = docs;
			$('.itemsitems .table').html('');
			$('#products').html('');
			$('.itemsitems .table').append(appendinv);
			for (var i = 0, j = docs.length; i < j; i++) {
				$('.itemsitems .table').append("<tr><td id='itemsa'><div class='btn-group'><button class=\"btn btn-danger btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onClick=\"nControl.removeinv(" + docs[i].num + ");\">x</button><button class=\"btn btn-warning btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onclick=\"nControl.updateInv(" + docs[i].num + ")\">Update</button></div></td>" + "<td id=\"itemsp\"><img  width=\"60\" height=\"30\" src="+ docs[i].pic + "></td>" + "<td id='itemsb'>" + docs[i].name + "</td><td id='itemsc'>" + docs[i].price + "</td><td id='itemse'>" + docs[i].num + "<td id='itemsg'>" + docs[i].category + "</td></tr>");
				$('#products').append("<div class=\"btn btn-default\" onclick=\"nControl.addFromProducts(" + docs[i].num + ");nControl.total();\">" + docs[i].name + "<br>" + docs[i].price + "</div>");
			}
		});
	});
	$('#myModal').modal('hide');
	nControl.finditems();
	nControl.pid();
};

// setting modal call
nControl.opensettingsmodal = function () {
	$("#settings").modal({backdrop: 'static', keyboard: false});
}
nControl.opencheckdatamodel = function () {
	$("#checkdata").modal({backdrop: 'static', keyboard: false});
}
nControl.openimportitems = function () {
	$("#importitemsmodal").modal({backdrop: 'static', keyboard: false});
}
//var sha1 = require('sha1');
//var m=sha1("jack");
//alert(m);

//initialize nControl
$(document).ready(function () {
	nControl.init();
	//Synchronize repeatedly after a set interval of time
	setInterval(function () {
		nControl.getsales();
	}, syncTimeIntervalSales);
	setInterval(function () {
		nControl.getItems();
	}, syncTimeInterval);

});


//var w;
//function startWorker() {
//    if(typeof(Worker) !== "undefined") {
//        if(typeof(w) == "undefined") {
//            w = new Worker("scripts/temp.js");
//        }
//        w.onmessage = function(event) {
//            alert(event.data);
//        };
//    } else {
//       alert("Sorry! No Web Worker support.");
//    }date1: Date().substr(4, 12),
//}
//
//startWorker();
//nControl.finduser = function (){var j;
//db.user.find({"username": "harry"},function (err, docs){ j=( docs[0].password); return j;});
//
//}
//
//alert(nControl.finduser(););







