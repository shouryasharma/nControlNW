//sending to cloud
function send(){
	db.inventory.find({}).sort({
        "num": 1,
 }).exec(function (err, docs) {
nControl.productList = docs;
for (var i = 0, j = docs.length; i < j; i++) {
 var harry= "&name="  + docs[i].name + "&price=" + docs[i].price + "&qty=" + docs[i].qty + "&num=" + docs[i].num + "&category=" + docs[i].category + "&id=" + docs[i]._id;
  var dat = new XMLHttpRequest();
   var url = "http://127.0.0.1/jsphp/my_parse_file.php";
   var file = harry;
   var vars="file="+file;
   dat.open("POST", url, true);
   dat.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   dat.onreadystatechange = function() {
	    if(dat.readyState == 4 && dat.status == 200) {
		    var return_data = dat.responseText; }
    }
    dat.send(vars);
	 }
		 });
   alert("data send");
	del();

};
function del(){
	var dat = new XMLHttpRequest();
   var url = "http://127.0.0.1/jsphp/delete.php";
   dat.open("POST", url, true); var vars="";
   dat.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   dat.onreadystatechange = function() {
	    if(dat.readyState == 4 && dat.status == 200) {
		    var return_data = dat.responseText; }
    }
    dat.send(vars);
	alert("deleted");

}

function startWorker() {
    if(typeof(Worker) !== "undefined") {
        if(typeof(w) == "undefined") {
         var w = new Worker("cloud.js");
        }}}
