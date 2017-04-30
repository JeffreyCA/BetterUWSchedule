var array = [];
var links = document.getElementsByTagName("a");

for (var i = 0, max = links.length; i < max; i++) {
    links[i].removeAttribute("href");
}

$('a').contents().unwrap();

var queryResponse = document.getElementsByTagName("p")[0];
var queryInfo = document.getElementsByTagName("p")[1];
var mainPara = document.getElementsByTagName("p")[2];

queryResponse.outerHTML = "";
delete queryResponse;

queryInfo.innerHTML = queryInfo.innerHTML.replace(/Your selection was:<br>/g, "");
queryInfo.innerHTML = queryInfo.innerHTML.replace(/ , /g, "<br>").trim();


var Y = "Course Number: "
var Z = queryInfo.innerHTML.split(Y).pop();

if (Z === "") {
    queryInfo.innerHTML = queryInfo.innerHTML.replace(/Course Number: /g, "Course Number: N/A");
}

queryInfo.innerHTML = queryInfo.innerHTML.replace(/([\w ]+?):/gm, "<b>$1</b>:");

var table = document.getElementsByTagName("table")[0];
var innerTable = document.getElementsByTagName("table")[1];

if (table.innerHTML.trim() == ""){
    console.log("true");
    table.parentNode.removeChild(table);
}
else {
    var trs = table.getElementsByTagName("tr");
    
    var courseRow = trs[1];
    var courseElements = trs[1].getElementsByTagName("td");
    
    var name = courseElements[0].innerHTML.trim();
    var cat = courseElements[1].innerHTML.trim();
    var unit = courseElements[2].innerHTML.trim();
    var title = courseElements[3].innerHTML.trim();
    
    function getInnerTableIndex(trs) {
        for (var i = 0; i < trs.length; i++) {
            if (trs[i].contains(innerTable)) {
                console.log("found! " + i);
                return i;
            }
        }
        return -1;
    }
    
    var innerTableIndex = getInnerTableIndex(trs);
    console.log("Inner Table Index: " + innerTableIndex);
    
    var line1 = name + " " + cat;
    var line2 = title;
    var line3 = unit + " units";
    
    var insert = `
        <hr>
        <h2>${line1}</h2>
        <h3>${line2}</h3>
        <h4>${line3}</h4>
    `;
    
    for (var i = 2; i < innerTableIndex; i++) {
        var content = trs[i].innerText;
        insert += "<h4><b>" + content + "</b></h4>";
    }
    
    table.insertAdjacentHTML('beforebegin', insert);
    table.innerHTML = innerTable.innerHTML;
}

var date = mainPara.innerHTML.split("Information last updated: ").pop();
date = date.replace(/<(?:.|\n)*?>/gm, "");

console.log("Date: " + date);
var d = new Date(date);

mainPara.innerHTML = mainPara.innerHTML.replace(/Information last updated:(.*?)<\/b>/g, "Last updated on: <b>" + d.toDateString() + "</b>");

// $('table th:nth-child(3), table td:nth-child(3)').remove();

function remove(header) {
    // Get target th with the name you want to remove.
    var target = $('table').find('th:contains("' + header +'")');
    // Find its index among other ths 
    var index = (target).index() + 1;
    console.log("index: " + index);
    // For each tr, remove all th and td that match the index.
    $('table th:nth-child(' + index + ')').remove();
}

function rename(original, newValue) {
    // Get target th with the name you want to remove.
    var target = $('table').find('th:contains("' + original +'")');
    target.text(newValue);
}


rename('Rel 1', 'Related Component 1');
rename('Rel 2', 'Related Component 2');
rename('Enrl Tot', 'Enrolled');
rename('Wait Tot', 'Waitlist');
rename('Comp Sec', 'Section');
rename('Camp Loc', 'Campus');
rename('Bldg Room', 'Location');
rename('Time Days/Date', 'Date & Time');

var el = mainPara.getElementsByTagName("tr");
var curId = -1;
var lastId = -1;

function getlen(row) {
    var len = 0;
    var cells = row.cells;

    for (var j = 0, jLen = cells.length; j < jLen; j++) {
        // This is very important. If you just take length you'll get the
        // the wrong answer when colspan exists
        len += cells[j].colSpan;
    }
    
    return len;
}

function trimElements() {
    // Trim table elements
    $('table td').each(function() {
        var current = $(this);
        current.html($.trim(current.html().replace(/\s+/g, ' ')));
    });
}

trimElements();

function resizeTable() {
    for (var i = 1; i < el.length; i++) {
        var colLen = getlen(el[i]);
        
        if (colLen < 13) {
            console.log("Inserted");
            var newCol = el[i].insertCell(); 
            newCol.colSpan = 13 - colLen;
            
            if (el[i].getElementsByTagName("td")[0].colSpan == 1) {
                curId++;
            }
        }
        // Organize columns
        else {
            console.log("reached");
            
            el[i].style.cursor = "pointer";
            curId++;
        }
        
        el[i].className = curId;
    }
}

resizeTable();

function mergeEnrol() {
    function getEnrolCapCol(tr) {
        const FIXED_ENROL_CAP_COL = 6;
        
        var colLen = getlen(tr);
        return FIXED_ENROL_CAP_COL - (colLen - tr.cells.length);
    }
    
    for (var i = 1; i < el.length; i++) {
        var enrolCapCol = getEnrolCapCol(el[i]);
        var enrolCap;
        var enrol;

        enrolCap = el[i].getElementsByTagName("td")[enrolCapCol].innerHTML.trim();
        enrol = el[i].getElementsByTagName("td")[enrolCapCol + 1].innerHTML.trim();
        
        if (!isNaN(enrolCap) && !isNaN(enrol)) {
            el[i].getElementsByTagName("td")[enrolCapCol + 1].innerHTML = enrol + "/" + enrolCap;
        }
        el[i].deleteCell(enrolCapCol);
        
        console.log("Enrolled: " + enrol + "/" + enrolCap);
    }
    remove('Enrl Cap');
}

mergeEnrol();

function mergeWait() {
    function getWaitCapCol(tr) {
        const FIXED_WAIT_CAP_COL = 7;
        
        var colLen = getlen(tr);
        return FIXED_WAIT_CAP_COL - (colLen - tr.cells.length);
    }
    
    for (var i = 1; i < el.length; i++) {
        var waitCapCol = getWaitCapCol(el[i]);
        var waitCap;
        var wait;

        waitCap = el[i].getElementsByTagName("td")[waitCapCol].innerHTML.trim();
        wait = el[i].getElementsByTagName("td")[waitCapCol + 1].innerHTML.trim();
        
        if (!isNaN(waitCap) && !isNaN(wait)) {
            el[i].getElementsByTagName("td")[waitCapCol + 1].innerHTML = wait + "/" + waitCap;
        }
        el[i].deleteCell(waitCapCol);
    }
    remove('Wait Cap');
}

mergeWait();

function under() {
    
    for (var i = 1; i < el.length; i++) {
        var dateTime = el[i].cells[8];
        
        var date = ... (dateTime) ...;
        var time = ... (dateTime) ...;
        
        dateTime.innerHTML = "<span class='under'>" + date + "</span> " time;
        console.log(dateTime);
    }
    remove('Wait Cap');
    
    console.log(el[0].cells.length);
}

under();

// Do not show pointer cursor if no child elements to hide
for (var i = 0; i <= curId; i++) {
    var numItems = $("." + i).length;
    
    if (numItems == 1 && $("." + i).first().css("cursor") == "pointer") {
        $("." + i).first().css("cursor", "auto");
    }
}

console.log("curId: " + curId);

for (let i = 0; i <= curId; i++) {
    $("." + i + ":not(:first)").hide('fast');
    
    $("." + i + ":first").on("click",
        function() {
            $("." + i + ":not(:first)").toggle('slow');
    });
}
