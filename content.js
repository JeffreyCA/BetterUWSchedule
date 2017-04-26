var array = [];
var links = document.getElementsByTagName("a");
for (var i=0, max=links.length; i<max; i++) {
    links[i].removeAttribute("href");
}

var first = document.getElementsByTagName("p")[0];
var second = document.getElementsByTagName("p")[1];
var third = document.getElementsByTagName("p")[2];

first.outerHTML = "";
delete first;

second.innerHTML = second.innerHTML.replace(/Your selection was:<br>/g,'');
second.innerHTML = second.innerHTML.replace(/ ,/g,'<br>');

var Y = "Course Number: "
var Z = second.innerHTML.split(Y).pop();

if (Z === "") {
    second.innerHTML = second.innerHTML.replace(/Course Number: /g,'Course Number: N/A');
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
        <h2>${line1}</h2>
        <h3>${line2}</h3>
        <h4>${line3}</h4>
    `;
    table.insertAdjacentHTML('beforebegin', insert);
}

var date = third.innerHTML.split("Information last updated: ").pop();
date = date.replace(/<(?:.|\n)*?>/gm, '');

console.log("Date: " + date);
var d = new Date(date);

third.innerHTML = third.innerHTML.replace(/Information last updated:(.*?)<\/b>/g, "Last updated on: <b>" + d.toDateString() + "</b>");

