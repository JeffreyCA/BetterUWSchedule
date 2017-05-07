/**
 * content.js
 * 
 * Version: 1.0
 * Build Date: May 6, 2017
 * 
 */

// TODO: Fix for multiple course queries (Fine XXX for example).

function main() {
    function cleanQueryResults() {
        var queryInfo = document.getElementsByTagName("p")[1];

        document.getElementsByTagName("p")[0].outerHTML = ""; // Remove entire element

        queryInfo.innerHTML = queryInfo.innerHTML.replace(/Your selection was:<br>/g, "");
        queryInfo.innerHTML = queryInfo.innerHTML.replace(/ , /g, "<br>").trim();

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

    // Global variables
    var outerTable = document.getElementsByTagName("table")[0];

    cleanQueryResults();
    removeHyperlinks();

    // Invalid query, end script here
    if (outerTable.innerHTML.trim() == "") {
        return;
    }

    var tableArr = document.getElementsByTagName("table");

    var courseCount = tableArr.length;
    console.log("course count: " + courseCount);

    var mainParagraph = document.getElementsByTagName("p")[1];

    function updateText() {
        function changeLastUpdatedText() {
            var date = mainParagraph.innerHTML.split("Information last updated: ").pop();
            date = date.replace(/<(?:.|\n)*?>/gm, ""); // Get rid of unused characters

            var newDate = new Date(date);
            mainParagraph.innerHTML = mainParagraph.innerHTML.replace(/Information last updated:(.*?)<\/b>/g,
                "Last updated on: <b>" + newDate.toDateString() + "</b>");
        }

        function trimTableWhiteSpaces() {
            // Trim table elements
            $('table td').each(function () {
                var current = $(this);
                current.html($.trim(current.html().replace(/\s+/g, ' ')));
            });
        }

        changeLastUpdatedText();
        trimTableWhiteSpaces();
    }

    updateText();

    for (var k = 1; k < courseCount; k++) {
        var tableRowElements = tableArr[k].getElementsByTagName("tr");
        var innerTable = tableArr[k];
        var idCount = -1;

        function collapseOuterTable() {
            function getInnerTableIndex(outerTableRows) {
                for (var i = 0; i < outerTableRows.length; i++) {
                    if (outerTableRows[i].contains(innerTable)) {
                        return i;
                    }
                }
                return -1;
            }

            var outerTableRows = outerTable.getElementsByTagName("tr");
            var outerCourseElements = outerTableRows[1 + k].getElementsByTagName("td");

            var name = outerCourseElements[0].innerHTML.trim();
            var cat = outerCourseElements[1].innerHTML.trim();
            var unit = outerCourseElements[2].innerHTML.trim();
            var title = outerCourseElements[3].innerHTML.trim();

            var innerTableIndex = getInnerTableIndex(outerTableRows);
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
                var content = outerTableRows[i].innerText;
                insert += "<h4><b>" + content + "</b></h4>";
            }

            outerTable.insertAdjacentHTML('beforebegin', insert);
            outerTable.innerHTML = innerTable.innerHTML;
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

            function remove(header) {
                // Get target th with the name you want to remove.
                var target = $('table').find('th:contains("' + header + '")');
                // Find its index among other ths 
                var index = (target).index() + 1;
                // For each tr, remove all th and td that match the index.
                $('table th:nth-child(' + index + ')').remove();
            }

            function resizeTable() {
                for (var i = 1; i < tableRowElements.length; i++) {
                    var colLen = getlen(tableRowElements[i]);

                    if (colLen < 13) {
                        var newCol = tableRowElements[i].insertCell();
                        newCol.colSpan = 13 - colLen;

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

            function mergeEnrolCells() {
                function getEnrolCapCol(tableRow) {
                    const FIXED_ENROL_CAP_COL = 6;

                    var colLen = getlen(tableRow);
                    return FIXED_ENROL_CAP_COL - (colLen - tableRow.cells.length);
                }

                for (var i = 1; i < tableRowElements.length; i++) {
                    var enrolCapCol = getEnrolCapCol(tableRowElements[i]);
                    var enrolCap;
                    var enrol;

                    enrolCap = tableRowElements[i].getElementsByTagName("td")[enrolCapCol].innerHTML.trim();
                    enrol = tableRowElements[i].getElementsByTagName("td")[enrolCapCol + 1].innerHTML.trim();

                    if (!isNaN(enrolCap) && !isNaN(enrol)) {
                        tableRowElements[i].getElementsByTagName("td")[enrolCapCol + 1].innerHTML = enrol + "/" + enrolCap;
                    }
                    tableRowElements[i].deleteCell(enrolCapCol);

                    console.log("Enrolled: " + enrol + "/" + enrolCap);
                }
                remove('Enrl Cap');
            }

            function mergeWaitlistCells() {
                function getWaitCapCol(tableRow) {
                    const FIXED_WAIT_CAP_COL = 7;

                    var colLen = getlen(tableRow);
                    return FIXED_WAIT_CAP_COL - (colLen - tableRow.cells.length);
                }

                for (var i = 1; i < tableRowElements.length; i++) {
                    var waitCapCol = getWaitCapCol(tableRowElements[i]);
                    var waitCap;
                    var wait;

                    waitCap = tableRowElements[i].getElementsByTagName("td")[waitCapCol].innerHTML.trim();
                    wait = tableRowElements[i].getElementsByTagName("td")[waitCapCol + 1].innerHTML.trim();

                    if (!isNaN(waitCap) && !isNaN(wait)) {
                        tableRowElements[i].getElementsByTagName("td")[waitCapCol + 1].innerHTML = wait + "/" + waitCap;
                    }
                    tableRowElements[i].deleteCell(waitCapCol);
                }
                remove('Wait Cap');
            }

            function splitDateTimeCells() {
                const DATE_TIME_COL = 8;

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

                        // Date is given (i.e. for a TST)
                        if (date) {
                            var arr = date.split("-");
                            var beginDate = Date.parseExact(arr[0], 'MM/dd');
                            var endDate = Date.parseExact(arr[1], 'MM/dd');
                            var dateRange = [];

                            while (beginDate <= endDate) {
                                dateRange.push(beginDate.toString("MMMM d"));
                                beginDate.addDays(1);
                            }

                            // Process range of dates
                            date = "(";
                            for (var j = 0; j < dateRange.length; j++) {
                                if (j != 0) {
                                    date += ", ";
                                }
                                date += dateRange[j];
                            }
                            date += ")";
                        }

                        // Update cell content
                        dateTimeCell.innerHTML = "<span class='under'>" + time + "</span><br>" + days + "<br>" + date;

                        // Original page does not provide AM/PM info, maybe it could be deduced somehow?
                        // Ambiguity lies in 8-10 AM/PM
                        $(".under").hover(function () {
                            $(this).attr('title', 'Check UWFlow or Quest to determine whether classes are AM or PM.');
                        });
                    }
                }
            }

            function invertInstructorNames() {
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

            resizeTable();
            mergeEnrolCells();
            mergeWaitlistCells();
            splitDateTimeCells();
            invertInstructorNames();
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
                        function () {
                            $("." + i + ":not(:first)").toggle('slow');
                        });
                }
            }
            setCursors();
            setToggleListeners();
        }

        /*
        // Variables used for valid queries
        var innerTable = document.getElementsByTagName("table")[1];
    
        var courseCount = document.getElementsByTagName("table").length - 1;
        console.log("Count: " + courseCount);
    
        var mainParagraph = document.getElementsByTagName("p")[1];
        var tableRowElements = mainParagraph.getElementsByTagName("tr");
        var idCount = -1;
        
        for (var j = 0; j < courseCount; j++) {
            var innerTable = document.getElementsByTagName("table")[1 + j];
            var mainParagraph = document.getElementsByTagName("p")[1];
            var tableRowElements = mainParagraph.getElementsByTagName("tr");
            var idCount = -1;
        }
    */


        collapseOuterTable();
        renameTableHeadings();
        transformTable();
        setToggleBehaviour();
    }
}

main();
