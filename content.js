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

    cleanQueryResults();
    removeHyperlinks();

    // Global variable
    var outerTable = document.getElementsByTagName("table")[0];

    // Invalid query, end script here
    if (outerTable.innerHTML.trim() == "") {
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
            console.log("Inner Table Index: " + innerTableIndex);

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

            for (var i = 2; i < innerTableIndex; i++) {
                var content = outerTableRows[i].innerText;
                insert += "<h4><b>" + content + "</b></h4>";
            }

            outerTable.deleteRow(0);
            outerTable.deleteRow(0);
            outerTable.deleteRow(0);
            outerTable.deleteRow(0);

            outerTable.insertAdjacentHTML('beforebegin', insert);
            outerTable.insertAdjacentHTML('beforebegin', innerTable.outerHTML);
        }

        function resizeTable(tableRowElements) {
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
                    console.log(enrolCapCol);
                    tableRowElements[i].deleteCell(tableRowElements[i].cells.length - 1);
                    continue;
                }

                enrolCap = tableRowElements[i].getElementsByTagName("td")[enrolCapCol].innerHTML.trim();
                enrol = tableRowElements[i].getElementsByTagName("td")[enrolCapCol + 1].innerHTML.trim();

                if (!isNaN(enrolCap) && !isNaN(enrol)) {
                    tableRowElements[i].getElementsByTagName("td")[enrolCapCol + 1].innerHTML = enrol + "/" + enrolCap;
                }
                tableRowElements[i].deleteCell(enrolCapCol);

                console.log("Enrolled: " + enrol + "/" + enrolCap);
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

                        if (beginDate == endDate) {
                            date = "(" + beginDate.toString("MMMM d") + ")";
                        }
                        else {
                            date = "(" + beginDate.toString("MMMM d") + " - " + endDate.toString("MMMM d") + ")";
                        }
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
            $('table td').each(function () {
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
                    function () {
                        $("." + i + ":not(:first)").toggle('slow');
                    });
            }
        }
        setCursors();
        setToggleListeners();
    }

    /*
        for (var b = 0; b < tableCount; b++) {
            collapseOuterTable(b);
        }
    */

    transformTable();
    updateText();
    setToggleBehaviour();
}

main();
