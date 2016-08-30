nControl.localBackupi = function(){
var fs = require('fs');
var writeStream = fs.createWriteStream("../backup/item/items.csv");
//	alert("you startred");
	db.items.find({}).sort({
		"num": 1
	, }).exec(function (err, docs) {
		for (var i = 0, j = docs.length; i < j; i++) {
             var row1 = "\"" +  docs[i].name + "\"" + "\t" + "\"" + docs[i].price + "\"" + "\t" + "\"" + docs[i].num + "\"" + "\t" + "\"" + docs[i].category + "\"" + "\t" + "\"" + docs[i].pic + "\"" + "\n";
             writeStream.write(row1);
		}
	});
};

nControl.localBackups = function(){
var fs = require('fs');
var writeStream = fs.createWriteStream("../backup/sale/sales"+Date().substr(4, 12)+".csv");
//	alert("you startred");
	db.sales.find({date1: Date().substr(4, 12)}).sort({
		"entrynum": 1
	, }).exec(function (err, docs) {
		//call set true f()
		nControl.flushUpadate();
		nControl.syncArray1 = [];
		for (var i = 0, j = docs.length; i < j; i++) {
			for (var k=0,n =docs[i].details.items.length; k<n; k++){
			var row = "\"" +   docs[i].entrynum + "\"" + "\t" +"\"" +  docs[i].date + "\"" + "\t" +"\"" +  docs[i].amount + "\"" + "\t" +"\"" +  docs[i].from + "\"" + "\t" +"\"" +  docs[i].show + "\"" + "\t" +"\"" + docs[i].mode + "\"" + "\t" +"\"" +  docs[i].direction + "\"" + "\t" +"\"" +  docs[i].details.customer + "\"" + "\t" +"\"" +  docs[i].details.contact + "\"" + "\t" +"\"" +  docs[i].details.summary + "\"" + "\t" +"\"" +  docs[i].details.items[k].name + "\"" + "\t" +"\"" +  docs[i].details.items[k].price + "\"" + "\t" +"\"" +  docs[i].details.items[k].qty + "\"" + "\t" + "\"" +  docs[i].details.items[k].num + "\"" + "\t" + "\"" + docs[i].details.items[k].category + "\"" + "\n";
			writeStream.write(row);
		} }

	});
};
