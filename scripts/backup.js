var local;
db.prefs.find({}, function (err,docs){local = docs[0].local});
nControl.localBackupi = function(){
db.prefs.find({}, function (err,docs){local = docs[0].local});
	if(local==0){
//		alert("local storage is off for items");
	} else {
//		alert("backup item on");
var fs = require('fs');
var writeStream = fs.createWriteStream("../backup/item/items.csv");
//	alert("you startred 1");
	db.items.find({}).sort({
		"num": 1
	, }).exec(function (err, docs) {
		for (var i = 0, j = docs.length; i < j; i++) {
             var row1 =   docs[i].name  + "," + docs[i].price  + "," +  docs[i].num + "," +  docs[i].category + "," +  docs[i].pic + "\n";
             writeStream.write(row1);
		}
	});
}};

nControl.localBackups = function(){
	db.prefs.find({}, function (err,docs){local = docs[0].local});
	if(local==0){
//		alert("local storage is off for sales");
	} else {
//		alert("local sales backup on");
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
			var row =   docs[i].entrynum  + "," + docs[i].date + "," + docs[i].amount + "," + docs[i].details.customer + "," + docs[i].details.contact+ "," + docs[i].details.summary + "," + docs[i].details.items[k].name + "," +  docs[i].details.items[k].price + "," + docs[i].details.items[k].qty + "," +  docs[i].details.items[k].num + "," +  docs[i].details.items[k].category  + "\n";
			writeStream.write(row);
		} }

	});
}};
 nControl.Upload = function() {
    var fileUpload = document.getElementById("fileUpload");
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();
            reader.onload = function (e) {
                var table = document.createElement("table");
                var rows = e.target.result.split("\n");
                for (var i = 0; i < rows.length; i++) {
                    var row = table.insertRow(-1);
                    var cells = rows[i].split(",");
                    for (var j = 0; j < cells.length; j++) {
                        var cell = row.insertCell(-1);
                        cell.innerHTML = cells[j];
                    }
                }
                var dvCSV = document.getElementById("dvCSV");
                dvCSV.innerHTML = "";
                dvCSV.appendChild(table);
            }
            reader.readAsText(fileUpload.files[0]);
        } else {
            alert("Error.");
        }
    } else {
        alert("Please upload a valid CSV file.");
    }
}

nControl.iteminsert = function(){
	 var fileUpload = document.getElementById("fileUpload1");
       var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
	if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();
            reader.onload = function (e) {
                var table = document.createElement("table");
                var rows = e.target.result.split("\n");
                for (var i = 0; i < rows.length-1; i++) {
                    var row = table.insertRow(-1);
                    var cells = rows[i].split(",");
			    db.items.insert([
		    {
			 name: cells[0]
			,price: parseInt(cells[1])
			,num: parseInt(cells[2])
			,category: cells[3]
			,pic: cells[4]

		     }
	       ]);

                }

            }
             reader.readAsText(fileUpload.files[0]);
        } else {
            alert("Error.");
        }
    } else {
        alert("Please upload a valid CSV file.");
    }
	alert("items are restored"+ "/n"+ "Please restart nControl!!!")
}
