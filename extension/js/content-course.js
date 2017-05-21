/**
 * content-course.js
 * Author: JeffreyCA
 * 
 * Script that is executed on query results page.
 */

function main() {
    function cleanQueryResults() {
        function expandTermInfo(queryInfo) {
            const MIN_TERM = 1071;
            // Calculate next term with possibly available info
            const MAX_TERM = (function() {
                var current = new Date();
                var yr = parseInt(current.getFullYear().toString().substr(2, 2), 10);
                var month = current.getMonth();

                if (month >= 0 && month < 4) {
                    return "1" + yr + "5";
                } else if (month >= 4 && month < 8) {
                    return "1" + yr + "9";
                } else {
                    return "1" + yr + "1";
                }
            })();

            var exp = /(Term: )(.*)/g;
            var match = exp.exec(queryInfo.innerText);
            var term = match[2];

            if (term && term >= MIN_TERM && term <= MAX_TERM) {
                var year = "20" + ('' + term)[1] + ('' + term)[2];
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

                var extra = " (" + season + " " + year + ")";

                exp = new RegExp(term.toString(), "g");
                queryInfo.innerHTML = queryInfo.innerHTML.replace(exp, term + extra);
            }
        }

        var queryInfo = document.getElementsByTagName("p")[1];

        document.getElementsByTagName("p")[0].outerHTML = ""; // Remove entire element

        queryInfo.innerHTML = queryInfo.innerHTML.replace(/Your selection was:<br>/g, "");
        queryInfo.innerHTML = queryInfo.innerHTML.replace(/ , /g, "<br>").trim();

        expandTermInfo(queryInfo);
        var courseNumber = queryInfo.innerText.split("Course Number:")[1];

        if (!courseNumber) {
            queryInfo.innerHTML = queryInfo.innerHTML.replace(/Course Number:/g, "Course Number: N/A");
        }

        queryInfo.innerHTML = queryInfo.innerHTML.replace(/([\w ]+?):/gm, "<b>$1</b>:");
    }

    function removeHyperlinks() {
        var links = document.getElementsByTagName("a");

        for (var i = 0, max = links.length; i < max; i++) {
            links[i].removeAttribute("href");
        }

        $('a').contents().unwrap();
    }

    cleanQueryResults();
    removeHyperlinks();

    // Global variable
    var outerTable = document.getElementsByTagName("table")[0];

    // Invalid query, end script here
    if (!outerTable || outerTable.innerHTML.trim() == "") {
        return;
    }

    // Variables used for valid queries
    var mainParagraph = document.getElementsByTagName("p")[1];
    var tableRowElements = mainParagraph.getElementsByTagName("tr");
    var idCount = -1;
    var tableCount = document.getElementsByTagName("table").length - 1;

    function transformTable() {
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

        function remove(tableIndex, header) {
            // Get target th with the name you want to remove.
            var target = $('table').find('th:contains("' + header + '")');
            // Find its index among other ths 
            var index = (target).index() + 1;
            // For each tr, remove all th and td that match the index.
            $('table th:nth-child(' + index + ')').eq(tableIndex).remove();
        }

        function collapseOuterTable(table) {
            const ROWS_TO_REMOVE = 4;
            var innerTable = document.getElementsByTagName("table")[table + 1];

            function getInnerTableIndex(outerTableRows) {
                for (var i = 0; i < outerTableRows.length; i++) {
                    if (outerTableRows[i].contains(innerTable)) {
                        return i;
                    }
                }
                return -1;
            }

            var outerTableRows = outerTable.getElementsByTagName("tr");
            var outerCourseElements = outerTableRows[1].getElementsByTagName("td");

            var name = outerCourseElements[0].innerHTML.trim();
            var cat = outerCourseElements[1].innerHTML.trim();
            var unit = outerCourseElements[2].innerHTML.trim();
            var title = outerCourseElements[3].innerHTML.trim();

            var innerTableIndex = getInnerTableIndex(outerTableRows);

            var line1 = name + " " + cat;
            var line2 = title;
            var line3 = unit + " units";

            var insert = '';

            if (table != 0) {
                insert = `<br>`;
            }

            insert += `
                    <h2>${line1}</h2>
                    <h3>${line2}</h3>
                    <h4>${line3}</h4>
                    `;

            var extra = false;
            for (var i = 2; i < innerTableIndex; i++) {
                var content = outerTableRows[i].innerText;
                insert += "<h4><b>" + content + "</b></h4>";
                extra = true;
            }

            for (var row = 0; row < ROWS_TO_REMOVE; row++) {
                outerTable.deleteRow(0);
            }

            if (extra) {
                outerTable.deleteRow(0);
            }

            outerTable.insertAdjacentHTML('beforebegin', insert);
            outerTable.insertAdjacentHTML('beforebegin', innerTable.outerHTML);
        }

        function resizeTable(tableRowElements) {
            const COLUMNS = 13;

            for (var i = 1; i < tableRowElements.length; i++) {
                var colLen = getlen(tableRowElements[i]);

                if (colLen < COLUMNS) {
                    var newCol = tableRowElements[i].insertCell();
                    newCol.colSpan = COLUMNS - colLen;

                    if (tableRowElements[i].getElementsByTagName("td")[0].colSpan == 1) {
                        idCount++;
                    }
                }
                // Organize columns
                else {
                    tableRowElements[i].style.cursor = "pointer";
                    idCount++;
                }

                tableRowElements[i].className = idCount;
            }
        }

        function mergeEnrolCells(tableRowElements, table) {
            function getEnrolCapCol(tableRow) {
                const FIXED_ENROL_CAP_COL = 6;

                var colLen = getlen(tableRow);
                return FIXED_ENROL_CAP_COL - (colLen - tableRow.cells.length);
            }

            for (var i = 1; i < tableRowElements.length; i++) {
                var enrolCapCol = getEnrolCapCol(tableRowElements[i]);
                var enrolCap;
                var enrol;

                // No such enrol cap column
                if (enrolCapCol < 0) {
                    tableRowElements[i].deleteCell(tableRowElements[i].cells.length - 1);
                    continue;
                }

                enrolCap = tableRowElements[i].getElementsByTagName("td")[enrolCapCol].innerHTML.trim();
                enrol = tableRowElements[i].getElementsByTagName("td")[enrolCapCol + 1].innerHTML.trim();

                if (!isNaN(enrolCap) && !isNaN(enrol)) {
                    tableRowElements[i].getElementsByTagName("td")[enrolCapCol + 1].innerHTML = enrol + "/" + enrolCap;
                }
                tableRowElements[i].deleteCell(enrolCapCol);
            }
            remove(table, 'Enrl Cap');
        }

        function mergeWaitlistCells(tableRowElements, table) {
            function getWaitCapCol(tableRow) {
                const FIXED_WAIT_CAP_COL = 7;

                var colLen = getlen(tableRow);
                return FIXED_WAIT_CAP_COL - (colLen - tableRow.cells.length);
            }

            for (var i = 1; i < tableRowElements.length; i++) {
                var waitCapCol = getWaitCapCol(tableRowElements[i]);
                var waitCap;
                var wait;

                if (waitCapCol < 0) {
                    tableRowElements[i].deleteCell(tableRowElements[i].cells.length - 1);
                    continue;
                }

                waitCap = tableRowElements[i].getElementsByTagName("td")[waitCapCol].innerHTML.trim();
                wait = tableRowElements[i].getElementsByTagName("td")[waitCapCol + 1].innerHTML.trim();

                if (!isNaN(waitCap) && !isNaN(wait)) {
                    tableRowElements[i].getElementsByTagName("td")[waitCapCol + 1].innerHTML = wait + "/" + waitCap;
                }
                tableRowElements[i].deleteCell(waitCapCol);
            }
            remove(table, 'Wait Cap');
        }

        function splitDateTimeCells(tableRowElements) {
            const DATE_TIME_COL = 8;

            var allDays = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

            for (var i = 1; i < tableRowElements.length; i++) {
                var dateTimeCell = tableRowElements[i].cells[DATE_TIME_COL];

                if (dateTimeCell && dateTimeCell.innerText != "TBA") {
                    var dateTime = dateTimeCell.innerText;
                    // Split date/time into time, day of week, and specific dates (for tests)
                    var exp = /(.*?)([A-Z|a-z][\S]*)[\s]*(.*)/g;
                    var match = exp.exec(dateTime);

                    var time = match[1];
                    var days = match[2];
                    var date = match[3];

                    // Split days into array
                    var daysArr = days.split(/(?=[A-Z])/);

                    days = "";

                    // Display all days of week: MTWThFSSu, but make inactive days light grey and active days black
                    for (var p = 0; p < allDays.length; p++) {
                        var found = false;

                        for (var q = 0; q < daysArr.length; q++) {
                            if (allDays[p] == daysArr[q]) {
                                found = true;
                                days += allDays[p];
                                daysArr.splice(q, 1);
                                break;
                            }
                        }

                        if (!found) {
                            days += "<span class='inactive_day'>" + allDays[p] + "</span>";
                        }
                    }

                    // Date is given (i.e. for a TST)
                    if (date) {
                        var arr = date.split("-");
                        var beginDate = Date.parseExact(arr[0], 'MM/dd');
                        var endDate = Date.parseExact(arr[1], 'MM/dd');

                        if (beginDate && endDate)
                            if (beginDate.toDateString == endDate.toDateString) {
                                date = "(" + beginDate.toString("MMMM d") + ")";
                            } else {
                                date = "(" + beginDate.toString("MMMM d") + " - " + endDate.toString("MMMM d") + ")";
                            }
                    }

                    // Original page does not provide AM/PM info, maybe it could be deduced somehow?
                    // Ambiguity lies in 8-10 AM/PM
                    var warningMsg = 'Check UWFlow or Quest to determine whether classes are AM or PM.';

                    dateTimeCell.innerHTML = "<span class='under' title='" + warningMsg + "'>" + time + "</span><br>" + days + "<br>" + date;
                }
            }
        }

        function invertInstructorNames(tableRowElements) {
            function invert(name) {
                var split = name.split(",");
                var given = split[1];
                var surname = split[0];

                return given + " " + surname;
            }

            for (var i = 1; i < tableRowElements.length; i++) {
                var cell = tableRowElements[i].cells[10];

                if (cell && cell.innerHTML) {
                    var name = cell.innerHTML;
                    cell.innerHTML = invert(name);
                }
            }
        }

        // Collapse all tables first
        for (var t = 0; t < tableCount; t++) {
            collapseOuterTable(t);
        }

        // Transform tables for each course
        for (var t = 0; t < tableCount; t++) {
            var tableRowElements = document.getElementsByTagName("table")[t].getElementsByTagName("tr");

            resizeTable(tableRowElements);
            mergeEnrolCells(tableRowElements, t);
            mergeWaitlistCells(tableRowElements, t);
            splitDateTimeCells(tableRowElements);
            invertInstructorNames(tableRowElements);
        }
    }

    function updateText() {
        function changeLastUpdatedText() {
            var date = mainParagraph.innerHTML.split("Information last updated: ").pop();
            date = date.replace(/<(?:.|\n)*?>/gm, ""); // Get rid of unused characters

            var newDate = new Date(date);
            mainParagraph.innerHTML = mainParagraph.innerHTML.replace(/Information last updated:(.*?)<\/b>/g,
                "Last updated on: <b>" + newDate.toDateString() + "</b>");
        }

        function renameTableHeadings() {
            function rename(original, newValue) {
                // Get target th with the name you want to remove.
                var target = $('table').find('th:contains("' + original + '")');
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
        }

        function trimTableWhiteSpaces() {
            // Trim table elements
            $('table td').each(function() {
                var current = $(this);
                current.html($.trim(current.html().replace(/\s+/g, ' ')));
            });
        }

        changeLastUpdatedText();
        renameTableHeadings();
        trimTableWhiteSpaces();
    }

    function setToggleBehaviour() {
        function setCursors() {
            // Do not show pointer cursor if no child elements to hide
            for (var i = 0; i <= idCount; i++) {
                var numItems = $("." + i).length;

                if (numItems == 1 && $("." + i).first().css("cursor") == "pointer") {
                    $("." + i).first().css("cursor", "auto");
                }
            }
        }

        function setToggleListeners() {
            for (let i = 0; i <= idCount; i++) {
                $("." + i + ":not(:first)").hide('fast');
                $("." + i + ":first").on("click",
                    function() {
                        $("." + i + ":not(:first)").toggle('slow');
                    });
            }
        }
        setCursors();
        setToggleListeners();
    }

    transformTable();
    updateText();
    setToggleBehaviour();
}

if (window.location.href != "http://www.adm.uwaterloo.ca/infocour/CIR/SA/under.html") {
    main();
}