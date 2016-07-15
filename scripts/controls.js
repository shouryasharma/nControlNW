var nControl = {},
    details = {},
    gui = require('nw.gui'),
    win = gui.Window.get(),
    amount = 0,
    from = 'control',
    direction,
    docs,
    stock = 0,
    authset = false,
    appendtable = "<thead><tr><th id='entrya'>Action</th><th id='entryb'>TRN-ID</th><th id='entryc'>Date</th><th id='entryd'>Details</th><th id='entrye'><span style='color:blue'>In</span><span style='color:#999'>/</span><span style='color:red'><b>Out</b></span></th><th id='entryf'>Amount</th></thead>",
    entrynum,
    flag = 0,
    appendinv = "<thead><tr><th id='entryia'>Action</th><th id='entryib'>Name</th><th id='entryic'>Price</th><th id='entryid'>Qty</th><th id='entryie'>PID/DN</th><th id='entryif'>Color</th><th id='entryig'>Category</th></thead>";

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
    $('#inventorymanager').hide();

    //Following are disabled without password
    $('.controlinventory').addClass('disabled');
    $('.execute').addClass('disabled');
    $('.totalpedigree').hide();

    $('#myModal').modal('show');
    $('#myModal .modal-title').html('Welcome to <b>nControl</b>');
    $('#myModal .modal-body').html('Enter admin password or click \'Ignore\'<br><br><div class="row"><div class="col-lg-6"></div><!-- /input-group --></div><!-- /.col-lg-6 --><div class="col-lg-6"><div class="input-group"><input class=\"authpass form-control\" type=\"password\" placeholder=\"Password\"><span class="input-group-btn"><button class="authbutton btn btn-primary" type="button">Go!</button></span></div><!-- /input-group --></div><!-- /.col-lg-6 --></div><!-- /.row --><br><br><div class="alert alert-warning" id=\"nmsg\"></div>');
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
    require('nw.gui').Shell.openItem('http://www.nemi.in');
};

//insert into db.sales
$('.execute').click(function () {
    'use strict';
    //Get entry data from user
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
        db.sales.count({}, function (err, count) {
            window.entrynum = count + 1;
        }, db.sales.insert({
            entrynum: entrynum,
            date: Date(),
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
            var x, i = 0,
                j = docs.length;
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
    } else {
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
var Datastore = require('nedb');
var db = {};
db.sales = new Datastore({
    filename: nControl.getUserDataPath() + '/data/sales.db',
    autoload: true
});
db.inventory = new Datastore({
    filename: nControl.getUserDataPath() + '/data/inventory.db',
    autoload: true
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
            var x, i = 0,
                j = docs.length;
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
                $("#entries").append("<tr style=\"display:" + x + "\"><td id=\"entrya\"><div class='btn-group'><button class='btn btn-xs btn-danger' onclick=\"nControl.confirmrementry(" + docs[i].entrynum + ");\">x</button>&nbsp;<button class='btn btn-xs btn-info' onclick=\"viewdetails(" + docs[i].entrynum + ");\" class='actionview'>View</button></div></td>" + "<td id='entryb'>" + docs[i].entrynum + "</td>" + "<td id='entryc' data-content='" + docs[i].date + "' >" + docs[i].date + "</td>" + "<td id='entryd'>" + docs[i].details.summary + "</td>" + "<td id='entrye' class='direction'>" + docs[i].direction + "</td>" + "<td id='entryf'>" + docs[i].amount + "</td></tr>");
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
            $("#parta").html("<b>Entry Number:</b> " + a + "<br><b>Date/Time:</b> " + docs.date + "<br><b>Entry Type:</b> " + docs.from + "<br><b>Mode:</b> " + docs.mode + "<br><b>Direction:</b> " + docs.direction + "<br><b>Amount:</b> " + docs.amount + "<br><b>Details:</b> " + docs.details.summary + "<br><br><b>Customer:</b> " + docs.details.customer + "<br><b>Contact Number:</b> " + docs.details.contact);
            $("#partb").html("");
            var i = 0,
                j = Object.keys(docs.details.items).length;
            for (i = 0; i < j; i++) {
                $("#partb").append("<tr><td><input class=\"form-control\" style=\"width:212px;\" type=\"text\" readonly=\"readonly\" value=\"" + docs.details.items[i].name + "\"\"></td><td><input type=\"number\" class=\"form-control\" style=\"width:70px;\" readonly=\"readonly\" value=\"" + docs.details.items[i].qty + "\"></td><td><input type=\"number\" class=\"form-control\" style=\"width:70px;\" readonly=\"readonly\" value=\"" + docs.details.items[i].price + "\"></td></tr>");
            }
        } else {
            $("#partb").html("");
            $("#parta").html("<b>Entry Number:</b> " + a + "<br><b>Date/Time:</b> " + docs.date + "<br><b>Direction:</b> " + docs.direction + "<br><b>Amount:</b> " + docs.amount + "<br><b>Details:</b> " + docs.details.summary);
        }
    });
}

//User Authenticaion
nControl.auth = function () {
    //do authorization
    $('.authgo').click(function () {
        var authpass = $('.authpass').val();
        if (authpass === 'test') {
            authset = true;
        }
        if (authset) {
            $('.controlinventory').removeClass('disabled');
            $('.execute').removeClass('disabled');
            $('.totalpedigree').show();
            window.authset = true;
            setTimeout(function () {
                $('#progressbar').css("width", "150px");
            }, 90);
            setTimeout(function () {
                //include a java applet
                /*$("#bill").append("<applet></applet>");
        $("applet").attr("code", "PrintApplet.class");
        $("applet").attr("name", "PrintApplet");
        $("applet").attr("width", "0");
        $("applet").attr("height", "0");*/
                $('#myModal').modal('hide');
            }, 100);
        } else {
            $('.authpass').val('');
            $('#nmsg').show();
            $("#nmsg").html("<b>Oh snap!</b> Incorrect password. Please try again.");
            setTimeout(function () {
                $('#nmsg').fadeOut();
            }, 1000);
        }
    });
    //print via java applet
    /*function printBill() {
    setTimeout(function () {
        document.PrintApplet.startPrint();
    }, 100);
}*/

    //print via default print dialog
    /*function printBill() {
    setTimeout(function () {
        window.print();
    }, 100);
}*/
};

//Print via javascript
nControl.print = function (elem) {
    'use strict';
    nControl.Popup($(elem).html());
};

//printing bill
nControl.Popup = function (data) {
    'use strict';
    var i = 0,
        j = nControl.billItems.length,
        mywindow = window.open('', 'billitem', 'width=230px');
    mywindow.document.write('<html><head><title>Receipt</title>');
    /*optional stylesheet*/
    mywindow.document.write('<link rel="stylesheet" href="styles/print.css" type="text/css">');
    mywindow.document.write('</head><body><div id="bill"><br><b>OD adda</b><br>Chai Coffee Cafe<br>B-150, 80ft Road, Shanti Nagar, Gurjar Ki Thadi, Jaipur<br>M: +91-9660188897<br>' + Date() + '<br>' + 'TRN ID: ' + entrynum + '<br>Customer: ' + $('.cname').val() + '<br>Contact: ' + $('.ccontact').val() +
        '<br><br><hr><table>');
    for (i = 0; i < j; i++) {
        mywindow.document.write("<tr style=\"width:230px;\"><td style=\"padding-right:20px;\">" + nControl.billItems[i].name + "</td><td style=\"padding-right:20px;\">" + nControl.billItems[i].qty + "</td><td>" + (nControl.billItems[i].qty) * (nControl.billItems[i].price) + "</td></tr>");
    }
    mywindow.document.write('</table><br><br><b>TOTAL: ' + nControl.total() + '<b><br>Thank you for visiting OD Adda<hr><div id="nemiinfo">nControl, Powered by Nemi<br>www.nemi.in</div></div><script type="text/javascript" src="scripts/print.js"></script></body></html>');
    setTimeout(function () {
        mywindow.print();
    }, 100);
    setTimeout(function () {
        mywindow.close();
    }, 100);

    return true;
};

//Popover quantity set
nControl.qtySet = function () {
    var x = parseInt($('#qtypop').val());
    var y = parseInt($('#example').val());
    if ($('#qin').is(':checked')) {
        $('#example').val(x + y);
        $('#example').popover('hide');
    } else if ($('#qout').is(':checked')) {
        $('#example').val(y - x);
        $('#example').popover('hide');
    } else {
        $('#myModal').modal('show');
        $('#notifaction').hide();
        $('#notifclosebutton').html('Close');
        $('#myModal .modal-title').html('Attention!');
        $('#myModal .modal-body').html('Neither In nor Out was selected. Please select any one of them to continue.');
    }
};

//Default view
$('#make.control').hide();

//Menu function
nControl.setView = function (view) {
    'use strict';
    switch (view) {
    case 0:
        $('#billitem').css("overflow-y", "scroll");
        $('#billitem').css("border", "1px solid #eee");
        $('#inventorymanager').hide();
        $('#inventorycontent').hide();
        $('#make.bill').hide();
        $('#money').fadeIn();
        $('#make.control').show();
        $('#inventory .panel-title.a').html('Control');
        $('#partc').hide();
        $('#parta').show();
        $('#parta').html('');
        $('#partb').show();
        $('#partb').html('');
        break;
    case 1:
        $('#money').hide();
        $('#make.control').hide();
        $('#inventorymanager').hide();
        $('#make.bill').show();
        $('#inventorycontent').fadeIn();
        $('#inventory .panel-title.a').html('Sell');
        break;
    case 2:
        if (nControl.billItems.length === 0) {
            nControl.pid();
            $('#billitem').css("overflow-y", "hidden");
            $('#billitem').css("border", "hidden");
            $('#money').hide();
            $('#parta').hide();
            $('#partb').hide();
            $('#inventorymanager').fadeIn();
            $('#partc').show();
            $('#inventory .panel-title.a').html('Inventory');
            break;
        } else {
            nControl.setView(1);
            $('#myModal').modal('show');
            $('#notifaction').hide();
            $('#notifclosebutton').html('Close');
            $('#myModal .modal-title').html('Attention!');
            $('#myModal .modal-body').html('You cannot modify inventory while you have a bill pending!');
        }
    }
};

//Adds items from Inventory to bill
nControl.addFromProducts = function (a) {
    'use strict';
    var pos = 0,
        i = 0,
        j = nControl.productList.length;
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
    } else {
        for (i = 0, j = nControl.billItems.length; i < j; i++) {
            flag = 0;
            //If a matching item is found, increment its quantity
            if (nControl.billItems[i].num === a) {
                nControl.billItems[i].qty++;
                break;
            } else {
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
    var i = 0,
        j = nControl.billItems.length;
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
    var tempName,
        tempQty,
        i = 0,
        j = nControl.billItems.length;
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
    var qty = parseInt($('.newqty').val()),
        i = 0,
        j = nControl.billItems.length;
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
    } else {
        $('#mySmallModal .modal-content').append('&nbsp;&nbsp;Please try again!');
    }
};
// remove item from bill
nControl.remove = function (index) {
    'use strict';
    var i = 0,
        j = nControl.billItems.length;
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
    var total = 0,
        i = 0,
        j = nControl.billItems.length;
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
    } else {
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
    } else {
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
    $('#myModal .modal-body').html('nControl pre-BETA version<br><br>Copyright 2011-14 <b>Nemi Consultancy Services</b>. All rights reserved.<br><br>Made with <3 for web technologies by <b>Nemi Consultancy Services</b>.<br><br>This software dedicated to my father: Mr. Nemi Chand Sharma and my cousin: Mr. Shreiansh Sharma.<br><div style="text-align:right;"> - <i>Shourya Sharma</i></span>');
    $('#notifaction').hide();
    $('#notifclosebutton').html('Close');
};
// search for customer
nControl.search = function () {
    //Clear previous filters
    filters = {
        "details.customer": $('.scustomername').val(),
        "details.contact": parseInt($('.scustomercontact').val())
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

//Data
//insert from pos [cash/card mode]

nControl.executepos = function (mode) {
    'use strict';
    details.items = nControl.billItems;
    details.customer = $('.cname').val();
    details.contact = parseInt($('.ccontact').val());
    window.details.summary = 'POS Entry';
    direction = 'In';

    db.sales.count({}, function (err, count) {
        window.entrynum = count + 1;
    }, db.sales.insert({
        entrynum: entrynum,
        date: Date(),
        details: details,
        amount: nControl.total(),
        from: 'pos',
        mode: mode,
        direction: direction,
        show: true
    }));
    //load entries from db.sales after user clicks on given button
    db.sales.find({}).sort({
        entrynum: -1
    }).exec(function (err, docs) {
        window.docs = docs;
        var x, i = 0,
            j = docs.length,
            l = 0,
            m = nControl.billItems.length;
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
            $("#entries").append("<tr style=\"display:" + x + "\"><td id=\"entrya\"><div class='btn-group'><button class='btn btn-xs btn-danger' onclick=\"nControl.confirmrementry(" + docs[i].entrynum + ");\">x</button>&nbsp;<button class='btn btn-xs btn-info' onclick=\"viewdetails(" + docs[i].entrynum + ");\" class='actionview'>View</button></div></td>" + "<td id='entryb'>" + docs[i].entrynum + "</td>" + "<td id='entryc' data-content='" + docs[i].date + "' >" + docs[i].date + "</td>" + "<td id='entryd'>" + docs[i].details.summary + "</td>" + "<td id='entrye' class='direction'>" + docs[i].direction + "</td>" + "<td id='entryf'>" + docs[i].amount + "</td></tr>");
        }
        $("entries").append("<tbody></table>");
        showbalance();
        for (l = 0; l < m; l++) {
            nControl.deduct(nControl.billItems[l].num, nControl.billItems[l].qty);
        }
        nControl.reset();
    });
};

//deduct the qty from inventory stock
nControl.deduct = function (dnum, dqty) {
    'use strict';
    db.inventory.find({
        num: dnum
    }, function (err, docs) {
        stock = docs[0].qty - dqty;
        if (docs.qty !== null && docs.qty !== NaN) {
            db.inventory.update({
                num: dnum
            }, {
                $set: {
                    qty: stock
                }
            }, {
                multi: false
            }, function (err, numReplaced) {});
        }
        //load inventory from db.inventory to display
        db.inventory.find({}).sort({
            num: 1
        }).exec(function (err, docs) {
            nControl.productList = docs;
            $('.inventoryitems .table').html('');
            $('.inventoryitems .table').append(appendinv);
            for (var i = 0, j = docs.length; i < j; i++) {
                $('.inventoryitems .table').append("<tr><td id='entryia'><div class='btn-group'><button class=\"btn btn-danger btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onClick=\"nControl.removeinv(" + docs[i].num + ");\">x</button><button class=\"btn btn-warning btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onclick=\"nControl.updateInv(" + docs[i].num + ")\">Update</button></div></td><td id='entryib'>" + docs[i].name + "</td><td id='entryic'>" + docs[i].price + "</td><td id='entryid'>" + docs[i].qty + "</td><td id='entryie'>" + docs[i].num + "</td><td id='entryif'>" + docs[i].color + "</td><td id='entryig'>" + docs[i].category + "</td></tr>");
            }
        });
    });
};

nControl.confirmrementry = function (a) {
    'use strict';
    if (authset) {
        $('#myModal').modal('show');
    } else {
        $('#myModal').modal('hide');
    }
    $('#notifaction').show();
    $('#myModal .modal-title').html('<b>Attention!</b>');
    $('#myModal .modal-body').html('Are you sure you want to remove this?');
    $('#notifaction').attr("onClick", "removeentry(" + a + ");");
    $('#notifaction').html('Yes');
    $('#notifclosebutton').html('No');
};

//Inventory
nControl.itemCategory = function () {
    $('#cattabs').html('');
    $('#catpanes').html('');
    var i = 0,
        arr = [],
        l = 0;
    db.inventory.find({}, function (err, docs) {
        var j = docs.length;
        for (i = 0; i < j; i++) {
            arr[i] = docs[i].category.toUpperCase();
        }
        var k = arr.length;
        //check if it exists
        while (l < k) {
            //if it doesnt exist push the value in the array
            if (nControl.itemCategories.indexOf(arr[l]) === -1) {
                nControl.itemCategories.push(arr[l]);
            } else {
                //if exists increment to check the next value
                l++;
            }
        }
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
    nControl.showInventory();
};
 //load inventory from databse to inventory
nControl.showInventory = function () {

    db.inventory.find({}).sort({
        num: 1
    }).exec(function (err, docs) {
        nControl.productList = docs;
        $('.inventoryitems .table').html('');
        $('.inventoryitems .table').append(appendinv);
        for (var i = 0, j = docs.length; i < j; i++) {
            $('.inventoryitems .table').append("<tr><td id='entryia'><div class='btn-group'><button class=\"btn btn-danger btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onClick=\"nControl.removeinv(" + docs[i].num + ");\">x</button><button class=\"btn btn-warning btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onclick=\"nControl.updateInv(" + docs[i].num + ")\">Update</button></div></td><td id='entryib'>" + docs[i].name + "</td><td id='entryic'>" + docs[i].price + "</td><td id='entryid'>" + docs[i].qty + "</td><td id='entryie'>" + docs[i].num + "</td><td id='entryif'>" + docs[i].color + "</td><td id='entryig'>" + docs[i].category + "</td></tr>");
            for (var m = 0, n = nControl.itemCategories.length; m < n; m++) {
                if (docs[i].category.toUpperCase() === nControl.itemCategories[m]) {
                    $('#' + nControl.itemCategories[m]).append("<div class=\"btn btn-default\" onclick=\"nControl.addFromProducts(" + docs[i].num + ");nControl.total();\">" + docs[i].name + "<br>" + docs[i].price + "</div>");
                }
            }
        }
    });
};

//load aready existing inventory
nControl.itemCategory();

var filters = {};

nControl.loadEntries = function (a) {
    //load entries from db.sales
    db.sales.find(a).sort({
        entrynum: -1
    }).exec(function (err, docs) {
        'use strict';
        var x, i = 0,
            j;
        window.docs = docs;
        $('#entries').html('');
        $('.amount').val('');
        $('.details').val('');
        for (i = 0, j = docs.length; i < j; i++) {
            if (docs[i].show === false) {
                x = 'none';
            } else {
                x = 'inline';
            }
            $("#entries").append("<tr style=\"display:" + x + "\"><td id=\"entrya\"><div class='btn-group'><button class='btn btn-xs btn-danger' onclick=\"nControl.confirmrementry(" + docs[i].entrynum + ");\">x</button>&nbsp;<button class='btn btn-xs btn-info' onclick=\"viewdetails(" + docs[i].entrynum + ");\" class='actionview'>View</button></div></td>" + "<td id='entryb'>" + docs[i].entrynum + "</td>" + "<td id='entryc' autocomplete='off' data-content='" + docs[i].date + "'>" + docs[i].date + "</td>" + "<td id='entryd'>" + docs[i].details.summary + "</td>" + "<td id='entrye' class='direction'>" + docs[i].direction + "</td>" + "<td id='entryf'>" + docs[i].amount + "</td></tr>");
        }
        $("#entries").prepend(appendtable);
        showbalance();
    });
};

//Add to inventory
$('.addtoinventory').click(function () {
    nControl.findInventory();
    nControl.pid();
    //get the data from the user    
    db.inventory.name = $('.inventoryitem').val();
    db.inventory.price = parseInt($('.inventoryprice').val());
    db.inventory.qty = parseInt($('.inventoryqty').val());
    db.inventory.num = parseInt($('.inventorynum').val());
    db.inventory.color = $('.inventorycolor').val();
    db.inventory.category = $('#inventorycategory').val();
    db.inventory.category = db.inventory.category.replace(/\s/g, "-");

    db.inventory.find({
        num: db.inventory.num
    }, function (err, docs) {
        nControl.productList = docs;
        if (docs.length === 0) {
            if (db.inventory.name !== '' && db.inventory.price !== '' && db.inventory.qty !== '' && db.inventory.num >= 1 && db.inventory.category !== '') {

                //save the data received from the user into the db.inventory
                db.inventory.insert([
                    {
                        name: db.inventory.name,
                        price: db.inventory.price,
                        qty: db.inventory.qty,
                        num: db.inventory.num,
                        color: db.inventory.color,
                        category: db.inventory.category.toUpperCase()
            }
        ]);
                setTimeout(function () {
                    nControl.itemCategory();
                }, 0);
                nControl.findInventory();
                nControl.pid();
                $('.inventoryitem').val('');
                $('.inventoryprice').val('');
                $('.inventoryqty').val('');
                $('.inventorynum').val('');
                $('.inventorycolor').val('');
                $('#inventorycategory').val('');
            } else {
                $('#myModal').modal('show');
                $('#notifaction').hide();
                $('#notifclosebutton').show();
                $('#notifclosebutton').html('Close');
                $('#myModal .modal-body').html("All fields are mandatory except color");
            }
        } else {
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
    $('#notifaction').attr("onClick", "nControl.reminventory(" + item + ");");
};
// update item confirmation
nControl.updateInv = function (item) {
    $('#myModal .modal-title').html('Attention!');
    $('#myModal .modal-body').html('Are you sure you want to update?<br><b>CAUTION!</b> Trying to update this will result in its removal but its contents will be copied above.');
    $('#notifaction').show();
    $('#notifaction').html('Yes');
    $('#notifclosebutton').html('No');
    $('#notifaction').attr("onClick", "nControl.updInventory(" + item + ");");
};

nControl.reminventory = function (item) {
    db.inventory.remove({
        num: item
    }, {}, function (err, numRemoved) {
        //load inventory from db.inventory to display
        nControl.itemCategory();
    });
    $('#myModal').modal('hide');
    nControl.findInventory();
    nControl.pid();
};

nControl.findInventory = function () {
    db.inventory.find({}).sort({
        num: 1
    }).exec(function (err, docs) {
        nControl.productList = docs;
    });
};
  //auto calculation of pid
nControl.pid = function () {

    nControl.findInventory();
    db.inventory.count({}, function (err, count) {
        'use strict';
        //count gives us the numbers to look for
            var searchFlag = 0,
            searchNum = 1,
            reqNum, i = 0;
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
        $('.inventorynum').val(searchNum);
    });
};
// remove item from invertry
nControl.updInventory = function (item) {
    db.inventory.find({
        num: item
    }, function (err, docs) {
        $('.inventoryitem').val(docs[0].name);
        $('.inventoryprice').val(docs[0].price);
        $('.inventoryqty').val(docs[0].qty);
        $('.inventorynum').val(docs[0].num);
        $('.inventorycolor').val(docs[0].color);
        $('#inventorycategory').val(docs[0].category);
    });

    //    $('.inventoryitems').val();
    db.inventory.remove({
        num: item
    }, {}, function (err, numRemoved) {
        //load inventory from db.inventory to display
        db.inventory.find({}).sort({
            num: 1
        }).exec(function (err, docs) {
            nControl.productList = docs;
            $('.inventoryitems .table').html('');
            $('#products').html('');
            $('.inventoryitems .table').append(appendinv);
            for (var i = 0, j = docs.length; i < j; i++) {
                $('.inventoryitems .table').append("<tr><td id='entryia'><div class='btn-group'><button class=\"btn btn-danger btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onClick=\"nControl.removeinv(" + docs[i].num + ");\">x</button><button class=\"btn btn-warning btn-xs\" data-toggle=\"modal\" data-target=\"#myModal\" onclick=\"nControl.updateInv(" + docs[i].num + ")\">Update</button></div></td><td id='entryib'>" + docs[i].name + "</td><td id='entryic'>" + docs[i].price + "</td><td id='entryid'>" + docs[i].qty + "</td><td id='entryie'>" + docs[i].num + "</td><td id='entryif'>" + docs[i].color + "</td><td id='entryig'>" + docs[i].category + "</td></tr>");
                $('#products').append("<div class=\"btn btn-default\" onclick=\"nControl.addFromProducts(" + docs[i].num + ");nControl.total();\">" + docs[i].name + "<br>" + docs[i].price + "</div>");
            }
        });
    });
    $('#myModal').modal('hide');
    nControl.findInventory();
    nControl.pid();
};

//initialize nControl
$(document).ready(function () {
    nControl.init();
});
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
};

//setInterval(send,3000);
