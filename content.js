var array = [];
var links = document.getElementsByTagName("a");

for (var i = 0, max = links.length; i < max; i++) {
    links[i].removeAttribute("href");
}

$('a').contents().unwrap();

var first = document.getElementsByTagName("p")[0];
var second = document.getElementsByTagName("p")[1];
var third = document.getElementsByTagName("p")[2];

first.outerHTML = "";
delete first;

second.innerHTML = second.innerHTML.replace(/Your selection was:<br>/g, "");
second.innerHTML = second.innerHTML.replace(/ ,/g, "<br>");

var Y = "Course Number: "
var Z = second.innerHTML.split(Y).pop();

if (Z === "") {
    second.innerHTML = second.innerHTML.replace(/Course Number: /g, "Course Number: N/A");
}

var table = document.getElementsByTagName("table")[0];

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
    
    console.log(title + " - " + name + " " + cat + ", " + unit + " units");
    
    var nested = trs[2].getElementsByTagName("td")[1].getElementsByTagName("table")[0];
    
    table.innerHTML = nested.innerHTML;
    
    var line1 = name + " " + cat;
    var line2 = title;
    var line3 = unit + " units";
    
    var insert = `
        <hr>
        <h2>${line1}</h2>
        <h3>${line2}</h3>
        <h4>${line3}</h4>
    `;
    table.insertAdjacentHTML('beforebegin', insert);
}

var date = third.innerHTML.split("Information last updated: ").pop();
date = date.replace(/<(?:.|\n)*?>/gm, "");

console.log("Date: " + date);
var d = new Date(date);

third.innerHTML = third.innerHTML.replace(/Information last updated:(.*?)<\/b>/g, "Last updated on: <b>" + d.toDateString() + "</b>");

// $('table th:nth-child(3), table td:nth-child(3)').remove();

function remove(header) {
    // Get target th with the name you want to remove.
    var target = $('table').find('th:contains("' + header +'")');
    // Find its index among other ths 
    var index = (target).index() + 1;
    console.log("index: " + index);
    // For each tr, remove all th and td that match the index.
    $('table th:nth-child(' + index + '), table td:nth-child(' + index + ')').remove();
}

remove('Rel 1');
remove('Rel 2');
   
var el = third.getElementsByTagName("tr");
var curId = -1;
var lastId = -1;

for (var i = 1; i < el.length; i++) {
    if (el[i].getElementsByTagName("td")[0].colSpan == 6) {
        el[i].getElementsByTagName("td")[0].colSpan = 4;
        var newCol = el[i].insertCell(); 
        newCol.colSpan = 3;
    }
    else if (el[i].getElementsByTagName("td")[0].colSpan == 10) {
        el[i].getElementsByTagName("td")[0].colSpan = 9;
    }
    else if (el[i].cells.length != 11) {
        var newCol = el[i].insertCell(); 
        newCol.colSpan = 11 - el[i].cells.length;
        curId++;
    }
    else {
        el[i].style.cursor = "pointer";
        curId++;
    }
    
    el[i].className = curId;
}

// Do not show pointer cursor if no child elements to hide
for (var i = 0; i < curId; i++) {
    var numItems = $("." + i).length;
    
    if (numItems == 1 && $("." + i).first().css("cursor") == "pointer") {
        $("." + i).first().css("cursor", "auto");
    }
}

console.log(curId);

for (let i = 0; i < curId; i++) {
    $("." + i + ":not(:first)").hide('fast');
    
    $("." + i + ":first").on("click",
        function() {
            $("." + i + ":not(:first)").toggle('slow');
    });
}
