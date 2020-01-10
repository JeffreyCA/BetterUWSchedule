/**
 * background.js
 * Author: JeffreyCA
 * 
 * Script that deals with loading CSS and JS files depending on current page.
 */

// On load, set icon according to setting in localStorage
(function setInitialIcon() {
    if (!localStorage['enabled'] || localStorage['enabled'] == 'true') {
        chrome.browserAction.setIcon({ path: "icon/on.png" });
    } else {
        chrome.browserAction.setIcon({ path: "icon/off.png" });
    }
})();

// Inject CSS, JS files according to current URL
function injectResources(tab) {
    const FORM_URL1 = "adm.uwaterloo.ca/infocour/CIR/SA/under.html";
    const FORM_URL2 = "info.uwaterloo.ca/infocour/CIR/SA/under.html";

    var tabUrl = tab.url;

    // Current tab is form page
    if (tabUrl.includes(FORM_URL1) || tabUrl.includes(FORM_URL2)) {
        chrome.tabs.executeScript(tab.id, { file: "js/jquery-3.4.1.min.js" });
        chrome.tabs.insertCSS(tab.id, {
            file: "css/form.css"
        }, function() {
            chrome.tabs.insertCSS(tab.id, {
                file: "css/chosen.css"
            }, function() {
                chrome.tabs.executeScript(tab.id, { file: "js/chosen.jquery.min.js" },
                    function() {
                        chrome.tabs.executeScript(tab.id, { file: "js/content-form.js" });
                    });
            });
        });
    }
    // Current tab is course page
    else if (tabUrl.includes("info.uwaterloo.ca") ||
        tabUrl.includes("adm.uwaterloo.ca/cgi-bin/cgiwrap/infocour/salook.pl") ||
        tabUrl.includes("adm.uwaterloo.ca/infocour/CIR/SA/under.html")) {

        chrome.tabs.executeScript(tab.id, { file: "js/jquery-3.4.1.min.js" });
        chrome.tabs.executeScript(tab.id, { file: "js/content-course.js" }, function() {
            chrome.tabs.insertCSS(tab.id, {
                file: "css/course.css"
            });
        });
    }
}

// Execute when page is loaded
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    // Set corresponding extension icon
    if (!localStorage['enabled'] || localStorage['enabled'] == 'true') {
        chrome.browserAction.setIcon({ path: "icon/on.png" });
    } else {
        chrome.browserAction.setIcon({ path: "icon/off.png" });
    }

    // Page finished loading
    if (info.status == 'complete') {
        // Inject resources if extension is enabled
        if (!localStorage['enabled'] || localStorage['enabled'] == 'true') {
            injectResources(tab);
        }
    }
});

// Set behaviour for toggling extension icon
chrome.browserAction.onClicked.addListener(function(tab) {
    // Add toggle state to localStorage if not set yet
    if (!localStorage['enabled'] || localStorage['enabled'] == 'true') {
        localStorage['enabled'] = 'false';
        chrome.browserAction.setIcon({ path: "icon/off.png" });
    } else {
        localStorage['enabled'] = 'true';
        chrome.browserAction.setIcon({ path: "icon/on.png" });
    }
    // Refresh current tab
    chrome.tabs.reload(tab.id);
});