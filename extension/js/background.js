/**
 * background.js
 * Author: JeffreyCA
 * 
 * Script that deals with loading CSS and JS files depending on current page.
 */

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status == 'complete') {
        injectResources(tab);
    }
});

function injectResources(tab) {
    const FORM_URL = "http://www.adm.uwaterloo.ca/infocour/CIR/SA/under.html";
    var tabUrl = tab.url;

    if (tabUrl == FORM_URL) {
        chrome.tabs.insertCSS(tab.id, {
            file: "css/form.css"
        }, function() {
            chrome.tabs.insertCSS(tab.id, {
                file: "css/chosen.css"
            }, function() {
                chrome.tabs.executeScript(tab.id, { file: "js/chosen.jquery.js" },
                    function() {
                        chrome.tabs.executeScript(tab.id, { file: "js/content-form.js" });
                    });
            });
        });
    } else {
        chrome.tabs.insertCSS(tab.id, {
            file: "css/course.css"
        });
    }
}