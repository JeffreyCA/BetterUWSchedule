/**
 * content-form.js
 * Author: JeffreyCA
 * 
 * Script that is executed on the form page (http://www.adm.uwaterloo.ca/infocour/CIR/SA/under.html)
 */

var body = document.getElementsByTagName("body")[0];

function changeLastUpdatedText() {
    $('p:not(:first)').find('br').remove();

    $('p:not(:first, :last)').contents().unwrap().wrapAll('<p>');
    $('p:nth-last-child(2)').css('text-align', 'center');
    $("select[name=sess]").insertBefore('select[name=subject]');

    var form = body.getElementsByTagName("form")[0];
    form.innerHTML = form.innerHTML.replace(/(What term are you looking for).*(<br>)/g, "");
    form.innerHTML = form.innerHTML.replace(/(<br>)(<h2>.*<\/h2>)(<br>)/g, "$2");

    console.log(form.innerHTML);
    var para = body.getElementsByTagName("p");
    var select = para[para.length - 2];

    select.innerHTML = select.innerHTML.replace(/(What subject are you looking for)(.*)/g, "<br>Term: ");
    select.innerHTML = select.innerHTML.replace(/(Type part)(.*)/g, "Number: ");

    $('p:last').css('text-align', 'center');

    $("select[name=subject]").attr('style', 'width: 10%');
    $("select[name=subject]").before("\t Subject: ");
    $("select[name=subject]").chosen();
}

changeLastUpdatedText();