/**
 * content-form.js
 * Author: JeffreyCA
 * 
 * Script that is executed on the form page (http://www.adm.uwaterloo.ca/infocour/CIR/SA/under.html)
 */

function setUpdateText() {
    var body = document.getElementsByTagName("body")[0];
    var dateStr = body.innerText.split("Page last generated: ").pop();
    var date = new Date(dateStr);

    var txt = date.toDateString() + " " + date.toString("hh:mm tt");

    body.innerHTML = body.innerHTML.replace(/Page last generated:(.*)/g,
        "Page last generated: <b>" + txt + "</b>");
}

function organizeElements() {
    var body = document.getElementsByTagName("body")[0];

    $('p:not(:first)').find('br').remove();
    $('p:not(:first, :last)').contents().unwrap().wrapAll('<p>');
    $('p:nth-last-child(2)').css('text-align', 'center');
    $("select[name=sess]").insertBefore('select[name=subject]');

    var form = body.getElementsByTagName("form")[0];
    form.innerHTML = form.innerHTML.replace(/(What term are you looking for).*(<br>)/g, "");
    form.innerHTML = form.innerHTML.replace(/(<br>)(<h2>.*<\/h2>)(<br>)/g, "$2");

    var para = body.getElementsByTagName("p");
    var select = para[para.length - 2];

    select.innerHTML = select.innerHTML.replace(/(What subject are you looking for)(.*)/g, "<br>Term: ");
    select.innerHTML = select.innerHTML.replace(/(Type part)(.*)/g, "Number: ");

    $('p:last').css('text-align', 'center');
    $("select[name=subject]").before("\t Subject: ");
    $("select[name=subject]").chosen({ width: '100px' });
}

function addAdditionalTerms() {
    const ABS_MIN_TERM = 1071; // Earliest term that has properly formatted tables

    // Calculate next term
    // E.g, if current term is 1175, then MAX_TERM is 1179.
    const MAX_TERM = parseInt((function() {
        var current = new Date();
        var yr = parseInt(current.getFullYear().toString().substr(2, 2), 10);
        var month = current.getMonth();

        if (month >= 0 && month < 4) {
            return "1" + yr + "9";
        } else if (month >= 4 && month < 8) {
            return "1" + (yr + 1) + "1";
        } else {
            return "1" + yr + "5";
        }
    })());

    // MAX_TERM - ABS_MIN_TERM would be too many terms in between, 
    // limit to last 6 terms (2 years) + next term
    const TERM_DIFF = 4;
    const MIN_TERM = MAX_TERM - 6 * TERM_DIFF;

    var termSelect = $('select[name=sess]');
    termSelect.empty();
    var select = document.getElementsByName('sess')[0];

    function termToString(term) {
        // Year is the second and third digits of term number
        var year = "20" + ('' + term)[1] + ('' + term)[2];
        // Season is last digit of term number:
        // 1 - Winter
        // 5 - Spring
        // 9 - Fall
        var season = ('' + term)[3];
        season = (function(season) {
            if (season == 1)
                return "Winter";
            else if (season == 5)
                return "Spring"
            else if (season == 9)
                return "Fall"
            else
                return "???"
        })(season);

        return term + " - " + season + " " + year;
    }

    for (var i = MAX_TERM; i >= MIN_TERM;) {
        termSelect.append($('<option>', {
            value: i,
            text: termToString(i)
        }));

        var lastDigit = i.toString().slice(-1);

        // 1XX1 -> 1XY9
        if (lastDigit == '1') {
            i -= 2;
        }
        // 1XX9 -> 1XX5, 1XX5 -> 1XX1
        else {
            i -= TERM_DIFF;
        }
    }
    // Set selected option to current term
    termSelect.find('option').eq(1).prop('selected', true);

    // Activate Chosen
    $("select[name=sess]").chosen({ width: 'auto' });
}
setUpdateText();
organizeElements();
addAdditionalTerms();