var array = [];
var links = document.getElementsByTagName("a");
for (var i=0, max=links.length; i<max; i++) {
    links[i].removeAttribute("href");
}

var first = document.getElementsByTagName("p")[0];
var second = document.getElementsByTagName("p")[1];

first.outerHTML = "";
delete first;

second.innerHTML = second.innerHTML.replace(/Your selection was:<br>/g,'');
second.innerHTML = second.innerHTML.replace(/ ,/g,'<br>');

var Y = "Course Number: "
var Z = second.innerHTML.split(Y).pop();

if (Z === "") {
    second.innerHTML = second.innerHTML.replace(/Course Number: /g,'Course Number: N/A');
}

console.log("Log: " + Z);