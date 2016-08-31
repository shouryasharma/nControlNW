nControl.localBackupi = function(){
var fs = require('fs');
var writeStream = fs.createWriteStream("../backup/item/items.csv");
//	alert("you startred 1");
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
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid CSV file.");
    }
}
