//
//////Synchronization parameters & variables
//var cid = 90;
//var syncTimeInterval = 3000;
//var url = 'http://192.168.168.21:80/jsphp/post_items.php';
//var syncTimeIntervalSales = 1000;
//var urlSales = 'http://192.168.168.21:80/jsphp/post_sales.php';
//var m;
//////Send inventory to the server
//var Datastore = require('nedb');
////var db.sales = new Datastore({
////	filename: nControl.getUserDataPath() + '/data/sales.db'
////	, autoload: true
////});
////var db.inventory = new Datastore({
////	filename: nControl.getUserDataPath() + '/data/inventory.db'
////	, autoload: true
////});
////nControl.sendItems = function (data) {
////	$.ajax({
////		type: 'POST',
////		url: url,
////		data: JSON.stringify(data),
////		success: function(data){
////      		var k=(JSON.stringify(data));
////    		},
////		error: function(jqXhr, textStatus, errorThrown){
////        		//Handle error message
////		},
////		contentType: 'application/json',
////		async: true
////	});
////};
//////
////////Get items from the inventory database
////nControl.getItems = function () {
////	db.inventory.find({}).sort({
////		"num": 1
////	, }).exec(function (err, docs) {
////		nControl.syncArray = [];m=docs.length;
////		for (var i = 0, j = docs.length; i < j; i++) {
////			//Create Array of the items
////			nControl.syncArray.push({
////				cid:cid
////				, name: docs[i].name
////				, price: docs[i].price
////				, qty: docs[i].qty
////				, num: docs[i].num
////				, category: docs[i].category
////			});
////		}
////		nControl.sendItems(nControl.syncArray);
////	});
////};
////
//////Send sales to the server
////nControl.sendsales = function (data) {
////	$.ajax({
////		type: 'POST',
////		url: urlSales,
////		data: JSON.stringify(data),
////		success: function(data){
////        		alert(JSON.stringify(data));
////    		},
////		error: function(jqXhr, textStatus, errorThrown){
////        		//Handle error message
////		},
////		contentType: 'application/json',
////		async: true
////	});
////};
////
////
//////Get items from the sales database
////nControl.getsales = function () {
////	db.sales.find({}).sort({
////		"entrynum": 1
////	, }).exec(function (err, docs) {
////		nControl.syncArray1 = [];
////		for (var i = 0, j = docs.length; i < j; i++) {
////			for (var k=0,n =docs[i].details.items.length; k<n; k++){
////			//Create Array of the items
////			nControl.syncArray1.push({
////				cid:cid
////				, entrynum: docs[i].entrynum
////				, date: docs[i].date
////				, amount: docs[i].amount
////				, from: docs[i].from
////				, show: docs[i].show
////				, mode: docs[i].mode
////				, direction: docs[i].direction
////				, customer: docs[i].details.customer
////				, contact: docs[i].details.contact
////				, summary: docs[i].details.summary
////				, name: docs[i].details.items[k].name
////				, price: docs[i].details.items[k].price
////				, qty: docs[i].details.items[k].qty
////				, num: docs[i].details.items[k].num
////                        , category: docs[i].details.items[k].category
////			});
////		} }
////		nControl.sendsales(nControl.syncArray1);
////	});
////};
//function msg(){postMessage(cid+2);}
//
//setInterval(msg,3000);
////setInterval(nControl.getsales,3000);
////setInterval(nControl.getItems,3000);
