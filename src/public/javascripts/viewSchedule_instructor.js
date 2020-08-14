var startDate;
var endDate;
var NUM_WEEKS = 0;
var NUM_15MINS = 0;
var filteredScheduleArray = [];
var START_TIME = null, END_TIME = null;
borderColorList = ["#DEB887", "#5F9EA0", "#D2691E", "#FF7F50", "#6495ED", "#FFF8DC", "#BDB76B", "#8B008B", "#556B2F", "#FF8C00",
    "#FF1493", "#00BFFF", "#696969", "#228B22", "#4B0082"];   //15 different colors for border colors

function showSchedule(resJson) {
    var selectedOptions = resJson.schedule.daynumberslist;
    var description = resJson.schedule.scheduledescription;
    var title = resJson.schedule.scheduletitle;
    var scheduleArray = resJson.schedule.schedulearray;

    var courseArray = resJson.courses;

    var numberNow = new Date();
    numberNow.setHours(0, 0, 0, 0);
    numberNow = numberNow.getTime();

    startDate = new Date();
    startDate.setHours(0, 0, 0);

    //show title
    document.getElementById('scheduletitle').value = title;

    //show description
    document.getElementById('scheduledescription').value = description;


    //filter schedule
    filteredScheduleArray = [];
    scheduleArray.forEach(schedule => {
        var dateSchedule = new Date(schedule[0]);
        if (dateSchedule.getTime() >= numberNow) {
            filteredScheduleArray.push(schedule);
        }
    });

    //schedule is obsolete:
    if (filteredScheduleArray.length == 0) {
        //hide the action buttons
        document.getElementById('scheduleactiondiv').addClass("hideRow");

        var id = "schedulemessageparagraph";
        var paraElem = document.getElementById(id);
        if (paraElem) {
            paraElem.dispose();
        }
        var closeButton = document.getElementById('schedulemessageclosebutton');
        var parent = closeButton.parentNode;
        var msg = "This schedule you selected is obsolete. Please select another schedule entry or create a new schedule.";

        parent.insertBefore(new Element('p', { id: id, text: msg }), closeButton);
        document.getElementById('scheduleviewmessage').removeClass("hideRow");
        return;
    }

    //filter the overlapping schedule (courses take precedence before schedule)
    var filteredSchedule = [];
    var removed = false;
    for (var i = 0; i < filteredScheduleArray.length; i++) {
        var startToEnd = [new Date(filteredScheduleArray[i][0]), new Date(filteredScheduleArray[i][1])];
        for (var j = 0; j < courseArray.length; j++) {
            var original = [new Date(courseArray[j].sessioninterval[0]), new Date(courseArray[j].sessioninterval[1])];
            if ((startToEnd[0].getTime() >= original[0].getTime() && startToEnd[0].getTime() < original[1].getTime()) && (startToEnd[1].getTime() >= original[0].getTime() && startToEnd[1].getTime() <= original[1].getTime())) {
                //the new schedule all in the original schedule
                removed = true;
                break;
            } else if ((startToEnd[0].getTime() < original[0].getTime() && (startToEnd[1].getTime() <= original[1].getTime() && startToEnd[1].getTime() > original[0].getTime()))) {
                //the new schedule's bottom half in the original schedule
                removed = true;
                break;
            } else if ((startToEnd[1].getTime() > original[1].getTime() && (startToEnd[0].getTime() >= original[0].getTime() && startToEnd[0].getTime() < original[1].getTime()))) {
                //the new schedule's upper half in the original schedule
                removed = true;
                break;
            } else if (startToEnd[0].getTime() < original[0].getTime() && startToEnd[1].getTime() > original[1].getTime()) {
                //the original schedule is part of the new schedule
                removed = true;
                break;
            }

        }
        if (!removed) {
            filteredSchedule.push(filteredScheduleArray[i]);
        }
        removed = false;
    }

    //replace the filtered array with the new array
    filteredScheduleArray = filteredSchedule;

    //push the courses into the schedule
    courseArray.forEach(course => {
        var temp = [course.sessioninterval[0], course.sessioninterval[1], "course"];
        filteredScheduleArray.push(temp);
    });

    //sort the schedule in ascending order
    filteredScheduleArray.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

    //get the end date
    var minDate = new Date(filteredScheduleArray[0][0]);
    endDate = new Date(filteredScheduleArray[0][1]);
    for (var i = 0; i < filteredScheduleArray.length; i++) {
        var temp2 = new Date(filteredScheduleArray[i][1]);
        if (temp2.getTime() > endDate.getTime()) {
            endDate = temp2;
        }
        var temp1 = new Date(filteredScheduleArray[i][0]);
        if (temp1.getTime() < minDate.getTime()) {
            minDate = temp1;
        }
    }
    endDate.setHours(0, 0, 0);
    startDate = minDate;
    //adjust the startDate to minDate if the minDate is in advance of today
    minDate.setHours(0, 0, 0);
    if (minDate.getTime() > startDate.getTime()) {
        startDate = minDate;
    }

    //get the earliest start time in the schedule to be row 0
    var minTime = new Date(filteredScheduleArray[0][0]);
    var maxTime = new Date(filteredScheduleArray[0][1]);
    for (var i = 0; i < filteredScheduleArray.length; i++) {
        //check cross-day or -week schedule input, if so, schedule layout spanss 24h automatically
        var tempStart = new Date(filteredScheduleArray[i][0]);
        var tempEnd = new Date(filteredScheduleArray[i][1]);
        if (isOvernightSchedule([tempStart, tempEnd])) {
            minTime.setHours(0, 0, 0);
            maxTime.setHours(0, 0, 0);
            break;
        }
        if (getTotalMins(tempStart) < getTotalMins(minTime)) {
            minTime.setHours(tempStart.getHours(), tempStart.getMinutes(), tempStart.getSeconds());
        }
        if (getTotalMins(tempEnd) > getTotalMins(maxTime)) {
            maxTime.setHours(tempEnd.getHours(), tempEnd.getMinutes(), tempEnd.getSeconds());
        }
    }
    //set the start and end time for iframe schedule's rows(time line)
    START_TIME = new Date(minTime.toString());
    END_TIME = new Date(maxTime.toString());

    //record the number of time slots (# of rows in weekly view)
    NUM_15MINS = getNumberOf15Mins();

    addRowsToCalendar();



    function isOvernightSchedule(startToEnd) {
        return getTotalMins(startToEnd[1]) - getTotalMins(startToEnd[0]) < 0;
    }

    function getNumberOf15Mins() {
        var mins15 = Math.round((getTotalMins(END_TIME) - getTotalMins(START_TIME)) / 15);
        if (mins15 == 0) {
            mins15 = 96;
        }
        return mins15;
    }


    function getTotalMins(date) {
        return date.getHours() * 60 + date.getMinutes();
    }


    function addRowsToCalendar() {
        //get the starting and ending day of the week
        var startDay = startDate.getDay();
        var endDay = endDate.getDay();

        //# of full weeks
        var time_diff = endDate.getTime() - startDate.getTime();
        var numDays = Math.round(time_diff / (1000 * 60 * 60 * 24)) + 1;
        var numWeeks = Math.trunc((numDays - (8 - startDay + endDay)) / 7) < 0 ? 0 : Math.trunc((numDays - (8 - startDay + endDay)) / 7);

        //need to mark the first week
        var weekNumber = 1;
        var lowerDateObj = new Date(startDate.toString());
        var upperDateObj = new Date(startDate.toString());
        //initialize the schedule grid
        var row = 0, col = 0;
        //Lower date is the date on every Sunday (the start of the week)
        //Upper date is the date on every Saturday (the end of the week)
        lowerDateObj.setDate(lowerDateObj.getDate() - startDay);
        upperDateObj.setDate(upperDateObj.getDate() + 6 - startDay);
        if (true) {
            var firstWeek = [];
            var hrefId = (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "/" + lowerDateObj.getFullYear() + "-" + (upperDateObj.getMonth() + 1) + "/" + upperDateObj.getDate() + "/" + upperDateObj.getFullYear();
            var datePrompt = "Week " + weekNumber + " (" + (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "--" + (upperDateObj.getMonth() + 1) + "/" + upperDateObj.getDate() + ")";
            //firstWeek.push(new Element('th', {scope:"row", text:datePrompt}));
            firstWeek.push(new Element('th', { scope: "row" }).adopt(new Element('a', { text: datePrompt, href: "#" + hrefId, id: "week" + weekNumber++ + "link" })));

            for (var i = 0; i < 7; i++) {
                if (selectedOptions[i] != -1 && i >= startDay) {
                    firstWeek.push(new Element('td', { id: "loc=" + row + "$" + col++, class: "tdcss" }).adopt(new Element("div", { draggable: "true" }).adopt(new Element('img', { src: "/static/images/instructorDayScheduleIsNotSetBnt.svg", height: "16", width: "16", draggable: "false" }))));
                } else if (i < startDay) {
                    firstWeek.push(new Element('td', { id: "loc=" + row + "$" + col++, class: "tdcss" }).adopt(new Element('img', { src: "/static/images/notApplicableBnt.svg", height: "16", width: "16", draggable: "false" })));
                } else {
                    firstWeek.push(new Element('td', { id: "loc=" + row + "$" + col++, class: "tdcss" }).adopt(new Element('div', { draggable: "true" }).adopt(new Element('img', { src: "/static/images/instructorAddOtherDayBnt.svg", height: "16", width: "16", draggable: "false" }))));
                }
            }
            col = 0;
            row++;
            //append the nodes in the array
            document.getElementById('scheduletablebody').adopt(new Element('tr').adopt(firstWeek));
        }
        //increment the lower date and upper date for the next message
        lowerDateObj.setDate(lowerDateObj.getDate() + 7);
        upperDateObj.setDate(upperDateObj.getDate() + 7);


        //markup the days in the full weeks
        for (var i = 0; i < numWeeks; i++) {
            var singleWeekList = [];
            var datePrompt = "Week " + weekNumber + " (" + (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "--" + (upperDateObj.getMonth() + 1) + "/" + upperDateObj.getDate() + ")";
            var hrefId = (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "/" + lowerDateObj.getFullYear() + "-" + (upperDateObj.getMonth() + 1) + "/" + upperDateObj.getDate() + "/" + upperDateObj.getFullYear();
            singleWeekList.push(new Element('th', { scope: "row" }).adopt(new Element('a', { text: datePrompt, href: "#" + hrefId, id: "week" + weekNumber++ + "link" })));

            for (var j = 0; j < 7; j++) {
                if (selectedOptions[j] != -1) {
                    //on the jth day of the week, the instructor has a class
                    singleWeekList.push(new Element('td', { id: "loc=" + row + "$" + col++, class: "tdcss" }).adopt(new Element("div", { draggable: "true" }).adopt(new Element('img', { src: "/static/images/instructorDayScheduleIsNotSetBnt.svg", height: "16", width: "16", draggable: "false" }))));
                } else {
                    singleWeekList.push(new Element('td', { id: "loc=" + row + "$" + col++, class: "tdcss" }).adopt(new Element('div', { draggable: "true" }).adopt(new Element('img', { src: "/static/images/instructorAddOtherDayBnt.svg", height: "16", width: "16", draggable: "false" }))));
                }
            }
            col = 0;
            row++;
            document.getElementById('scheduletablebody').adopt(new Element('tr').adopt(singleWeekList));
            //increment the lower date and upper date for the next message
            lowerDateObj.setDate(lowerDateObj.getDate() + 7);
            upperDateObj.setDate(upperDateObj.getDate() + 7);
        }

        //skip the last week's row if startDate and endDate are at the same week
        if (lowerDateObj.getTime() <= endDate.getTime()) {
            //markup the last week
            var pass = true;
            for (var i = 0; i < selectedOptions.length; i++) {
                if (selectedOptions[i] != -1 && i <= endDay) {
                    pass = false;
                    break;
                }
            }
            //need to mark the last week
            if (!pass) {
                var lastWeek = [];
                var datePrompt = "Week " + weekNumber + " (" + (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "--" + (upperDateObj.getMonth() + 1) + "/" + upperDateObj.getDate() + ")";
                var hrefId = (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "/" + lowerDateObj.getFullYear() + "-" + (upperDateObj.getMonth() + 1) + "/" + upperDateObj.getDate() + "/" + upperDateObj.getFullYear();
                lastWeek.push(new Element('th', { scope: "row" }).adopt(new Element('a', { text: datePrompt, href: "#" + hrefId, id: "week" + weekNumber++ + "link" })));
                for (var i = 0; i < 7; i++) {
                    if (selectedOptions[i] != -1 && i <= endDay) {
                        lastWeek.push(new Element('td', { id: "loc=" + row + "$" + col++, class: "tdcss" }).adopt(new Element("div", { draggable: "true" }).adopt(new Element('img', { src: "/static/images/instructorDayScheduleIsNotSetBnt.svg", height: "16", width: "16", draggable: "false" }))));
                    } else if (i > endDay) {
                        lastWeek.push(new Element('td', { id: "loc=" + row + "$" + col++, class: "tdcss" }).adopt(new Element('img', { src: "/static/images/notApplicableBnt.svg", height: "16", width: "16", draggable: "false" })));
                    } else {
                        lastWeek.push(new Element('td', { id: "loc=" + row + "$" + col++, class: "tdcss" }).adopt(new Element('div', { draggable: "true" }).adopt(new Element('img', { src: "/static/images/instructorAddOtherDayBnt.svg", height: "16", width: "16", draggable: "false" }))));
                    }
                }
                row++;
                document.getElementById('scheduletablebody').adopt(new Element('tr').adopt(lastWeek));
            }
        }
        //record the number of weeks (# of rows in monthly view)
        NUM_WEEKS = row;
        //get all empty schedule image elements
        var emptyScheduleList = document.querySelectorAll("img[src='/static/images/instructorDayScheduleIsNotSetBnt.svg']");
        //get all plus image elements
        var plusList = document.querySelectorAll("img[src='/static/images/instructorAddOtherDayBnt.svg']");

        //register the links for onclick
        for (var i = 1; i <= NUM_WEEKS; i++) {
            var id = "week" + i + "link";
            document.getElementById(id).addEventListener("click", handleOnclickWeekSchedule);
        }

        //onmouserover, change to the calendar icon with the plus sign
        emptyScheduleList.forEach(elem => {
            elem.addClass("liPointer");
            elem.addEventListener("mouseover", handleChangingEmptyScheduleSign);
            elem.addEventListener("click", handleDisplaySingleDaySchedule);

        });
        //onmouseout, change the icon back to empty schedule
        emptyScheduleList.forEach(elem => {
            elem.addEventListener("mouseout", handleChangingEmptyScheduleSign)
        })
        //onclick, add an empty schedule calendar
        plusList.forEach(elem => {
            elem.addClass("liPointer");
            elem.addEventListener("click", handleAddingEmptyScheduleSign);
        });

        //add week time schedule for each row
        addWeekTimeSchedule(1);
    }

    function handleDisplaySingleDaySchedule(e) {
        var tdElem = e.target.parentNode.parentNode;
        var day = Number(tdElem.id.slice(tdElem.id.indexOf("$") + 1));
        var weekNumber = Number(tdElem.id.slice(4, tdElem.id.indexOf("$")));
        emphasizeSelectedDay(weekNumber + 1, day + 1);
    }


    function handleChangingEmptyScheduleSign(e) {
        if (e.type == "mouseover") {
            e.target.src = "/static/images/instructorDayScheduleNotSetHover.svg";
        } else if (e.type == "mouseout") {
            e.target.src = "/static/images/instructorDayScheduleIsNotSetBnt.svg";
        }
    }

    function handleAddingEmptyScheduleSign(e) {
        e.target.src = "/static/images/instructorDayScheduleIsNotSetBnt.svg";
        e.target.addEventListener("mouseover", handleChangingEmptyScheduleSign);
        e.target.addEventListener("mouseout", handleChangingEmptyScheduleSign);
        e.target.removeEventListener("click", handleAddingEmptyScheduleSign);
        e.target.addEventListener("click", handleDisplaySingleDaySchedule);

    }


    function emphasizeSelectedDay(week, day) {
        //search by id. id format: pos=[row]$[col]
        var iframe = document.getElementById('week' + week + "iframe");

        //froze the day selection and set to the correct day
        var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var dayName = daysList[day - 1];
        var selectDayElem = iframe.contentWindow.document.getElementById('classscheduleday');
        for (var i = 0; i < selectDayElem.options.length; i++) {
            if (selectDayElem.options[i].value == dayName) {
                selectDayElem.options[i].selected = "selected";
                selectDayElem.disabled = true;
                break;
            }
        }

        //for the first row thead: search for the ids
        for (var i = 1; i < 8; i++) {
            var id = "thead=" + i;
            if (i == day) {
                //set the style to ""
                iframe.contentWindow.document.getElementById(id).removeClass("hideRow");
            } else {
                //set the style to display none
                iframe.contentWindow.document.getElementById(id).addClass("hideRow");

            }
        }
        iframe.contentWindow.document.getElementById("thead=" + day).colspan = "7";

        for (var i = 0; i < NUM_15MINS; i++) {
            //for each row, search for the ids
            var id = "";
            for (var j = 1; j < 8; j++) {
                id = "pos=" + i + "$" + j;
                if (j == day) {
                    //set style to ""
                    iframe.contentWindow.document.getElementById(id).removeClass("hideRow");
                } else {
                    //set style to "display: none !important"
                    iframe.contentWindow.document.getElementById(id).addClass("hideRow");
                }
            }
            id = "pos=" + i + "$" + day;
            iframe.contentWindow.document.getElementById(id).colspan = "7";
        }
        //iframe.parentNode.parentNode.toggleClass("hideRow");
        iframe.parentNode.parentNode.removeClass("hideRow");

        iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
    }


    function handleOnclickWeekSchedule(e) {
        e.preventDefault();
        var weekNumber = Number(e.target.id.slice(4, e.target.id.length - 4));
        undoEmphasisDay(weekNumber);
        var iframe = document.getElementById("week" + weekNumber + "iframe");
        var iframeRow = iframe.parentNode.parentNode;
        iframeRow.toggleClass("hideRow");
        if (!iframeRow.hasClass("hideRow")) {
            var daySelect = iframe.contentWindow.document.getElementById('classscheduleday');
            daySelect.disabled = false;
            daySelect.options[0].selected = "selected";
            //display the selection box for day in a week
            iframe.contentWindow.document.getElementById('classscheduleday').parentNode.removeClass('hideRow');
        }

        iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
    }


}


function undoEmphasisDay(week) {
    var iframe = document.getElementById('week' + week + "iframe");
    //for the first row thead: search for the ids
    for (var i = 1; i < 8; i++) {
        var id = "thead=" + i;
        //set the style to ""
        iframe.contentWindow.document.getElementById(id).removeClass("hideRow");
        iframe.contentWindow.document.getElementById(id).colspan = "1";
    }

    for (var i = 0; i < NUM_15MINS; i++) {
        //for each row, search for the ids
        var id = "";
        for (var j = 1; j < 8; j++) {
            id = "pos=" + i + "$" + j;
            //set style to ""
            iframe.contentWindow.document.getElementById(id).removeClass("hideRow");
            iframe.contentWindow.document.getElementById(id).colspan = "1";
        }
    }
}



function addWeekTimeSchedule(index) {
    var a = document.getElementById("week" + index + "link");
    if (a) {
        //load each row and iframe
        var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var weekNumber = Number(a.id.slice(4, a.id.length - 4));
        //add the week schedule iframe to the row below
        var tbody = document.getElementById('scheduletablebody');
        var nextRow = a.parentNode.parentNode.nextSibling;
        var rowElems = addWeekScheduleTable();
        var iframeRow = new Element('tr', { class: "hideRow" }).adopt(new Element('td', { colspan: "8" }).adopt(new Element('iframe', { id: "week" + weekNumber + "iframe", src: "/static/html/weekScheduleSetup.html", class: "container" })));
        if (nextRow) {
            tbody.insertBefore(iframeRow, nextRow);
        } else {
            tbody.adopt(iframeRow);
        }
        var iframe = document.getElementById("week" + weekNumber + "iframe");
        iframe.addEventListener('load', () => {
            iframe.contentWindow.document.getElementById('weekscheduletablebody').adopt(rowElems);
            addWeekScheduleOptionsIframe(iframe);
            iframe.contentWindow.document.getElementById('addtimeschedulebutton').addEventListener("click", handleAddTimeSlot);
            iframe.contentWindow.document.getElementById('duplicatebutton').addEventListener("click", handleDuplicateSchedule);
            iframe.contentWindow.document.getElementById('addtimeschedulebutton').id = "addtimeschedulebutton" + "_iframe=" + weekNumber;
            iframe.contentWindow.document.getElementById('duplicatemode').addEventListener("blur", handleDayOrWeekDuplicateSelect);
            iframe.contentWindow.document.getElementById('duplicatemode').id = "duplicatemode" + "_iframe=" + weekNumber;
            iframe.contentWindow.document.getElementById('duplicatebutton').id = "duplicatebutton" + "_iframe=" + weekNumber;

            //remove unreachable days from the selection box
            var notApplicableList = document.querySelectorAll("img[src='/static/images/notApplicableBnt.svg']");
            notApplicableList.forEach(imgElem => {
                var week = 1 + Number(imgElem.parentNode.id.slice(4, imgElem.parentNode.id.indexOf("$")));
                if (week == weekNumber) {
                    var day = Number(imgElem.parentNode.id.slice(imgElem.parentNode.id.indexOf("$") + 1));
                    var daySelect = document.getElementById('week' + week + 'iframe').contentWindow.document.getElementById('classscheduleday');
                    var dayName = daysList[day];
                    removeDayOption(daySelect, dayName);
                    daySelect = document.getElementById('week' + week + 'iframe').contentWindow.document.getElementById('duplicateday');
                    removeDayOption(daySelect, dayName);
                    daySelect = document.getElementById('week' + week + 'iframe').contentWindow.document.getElementById('duplicatetoanotherday');
                    removeDayOption(daySelect, dayName);
                }
            });
            addWeekTimeSchedule(index + 1);
        });
    } else {
        //load complete
        //read and display the schedule
        for (var i = 0; i < filteredScheduleArray.length; i++) {
            var startToEnd = [new Date(filteredScheduleArray[i][0]), new Date(filteredScheduleArray[i][1])];
            var weekNumber = getSessionWeekNumber(startToEnd);
            var temp = getRowAndSlotsNumber(startToEnd);    //[iframe_ref, #slots, row, col]
            var iframe = document.getElementById("week" + weekNumber + "iframe");
            //course schedule / pure unlinked schedule
            if (typeof filteredScheduleArray[i][2] != "undefined" && filteredScheduleArray[i][2] == "course") {
                addVisualTimeSlot(iframe, temp[1], temp[0], temp[2] + 1, "course");
            } else {
                addVisualTimeSlot(iframe, temp[1], temp[0], temp[2] + 1, "schedule");
            }
            updateScheduleLogTable(iframe);
        }
    }
}


function getSessionWeekNumber(startToEnd) {
    var startDay = startDate.getDay();
    var firstDate = new Date(startDate.toString());
    firstDate.setDate(firstDate.getDate() - startDay);
    firstDate.setHours(0, 0, 0);
    var targetDate = new Date(startToEnd[0]);
    targetDate.setHours(0, 0, 0);
    var diff_ms = targetDate.getTime() - firstDate.getTime();
    return Math.floor(diff_ms / (1000 * 60 * 60 * 24 * 7)) + 1;
}

function handleClearATimeSession(e) {
    var insideIframe = e.target.alt.split("_")[0];
    var iframeName = e.target.alt.split("_")[1];
    var iframe = document.getElementById('week' + iframeName.slice(6) + 'iframe');
    var identifier = insideIframe.slice(0, insideIframe.indexOf("$"));
    var row = Number(identifier.slice(1));
    var col = Number(insideIframe.slice(insideIframe.indexOf("$") + 1));
    var tdElem = iframe.contentWindow.document.getElementById('pos=' + row + "$" + col);
    var imgIdentifier = tdElem.firstChild.alt
    if (imgIdentifier.indexOf("_") != -1) {
        imgIdentifier = imgIdentifier.split("_")[0];
    }
    while (row < 96 && tdElem.firstChild && imgIdentifier == identifier) {

        //implementation for cross-day and -week schedule
        var imgElem = tdElem.firstChild;
        var atBottom = imgElem.alt.indexOf("_");

        tdElem.empty();
        tdElem.style = "";

        if (atBottom == -1) {
            //normal flow
            tdElem = iframe.contentWindow.document.getElementById('pos=' + ++row + "$" + col);
            if (tdElem && tdElem.firstChild) {
                imgIdentifier = tdElem.firstChild.alt;
                if (imgIdentifier.indexOf("_") != -1) {
                    imgIdentifier = imgIdentifier.split("_")[0];
                }
            }
        } else {
            //at the end of the row --has cross-day and -week schedule
            if (col != 7) {
                getRemovedScheduleNextDay(iframe, col + 1);
                break;
            } else {
                var weekNumber = Number(iframe.id.slice(4, iframe.id.length - 6)) + 1;
                var nextIframe = document.getElementById('week' + weekNumber + 'iframe');
                getRemovedScheduleNextWeek(nextIframe);
                break;
            }
        }

    }

    //clear the row in the log table
    removeScheduleLog(iframe);
}


function getRemovedScheduleNextWeek(nextIframe) {
    var row = 0, col = 1;
    var tdElem = nextIframe.contentWindow.document.getElementById('pos=' + row + "$" + col);
    var imgElem = tdElem.firstChild;
    while (typeof imgElem.alt.split("_")[1] != "undefined" && imgElem.alt.split("_")[1] == "skip") {
        tdElem.empty();
        tdElem.style = "";
        row++;
        tdElem = nextIframe.contentWindow.document.getElementById('pos=' + row + "$" + col);
        imgElem = tdElem.firstChild;
        if (!imgElem) {
            return;
        }
    }
}

function getRemovedScheduleNextDay(iframe, col) {
    var row = 0;
    var tdElem = iframe.contentWindow.document.getElementById('pos=' + row + "$" + col);
    var imgElem = tdElem.firstChild;
    while (typeof imgElem.alt.split("_")[1] != "undefined" && imgElem.alt.split("_")[1] == "skip") {
        tdElem.empty();
        tdElem.style = "";
        row++;
        tdElem = iframe.contentWindow.document.getElementById('pos=' + row + "$" + col);
        imgElem = tdElem.firstChild;
        if (!imgElem) {
            return;
        }
    }
}


function removeScheduleLog(iframe) {
    var tableList = [];
    var scheduleList = [];
    //get all logged schedule time sessions
    var allTableRows = document.getElementById('schedulelogbody').childNodes;
    for (var j = 0; j < allTableRows.length; j++) {
        if (allTableRows[j].nodeName == "TR") {
            var allRowCells = allTableRows[j].childNodes;
            tableList.push([allRowCells[0].innerText, allRowCells[2].innerText, allRowCells[0]]);
        }
    }
    var list = serializeAllCreatedScheduleAndCourse();

    //get all scheduled time sessions
    for (var i = 0; i < list.length; i++) {
        var date = (list[i][0].getMonth() + 1) + "/" + list[i][0].getDate();
        var start = getTimeString(list[i][0]);
        var end = getTimeString(list[i][1]);
        var time = start + "-" + end;
        scheduleList.push([date, time]);
    }

    for (var i = 0; i < tableList.length; i++) {
        var include = false;
        for (var j = 0; j < scheduleList.length; j++) {
            if (tableList[i][0] == scheduleList[j][0] && tableList[i][1] == scheduleList[j][1]) {
                //a match is found
                include = true;
                break;
            }
        }
        if (!include) {
            //none of a match if found, delete the row in the log table
            tableList[i][2].parentNode.dispose();
        }
    }
}


function serializeAllCreatedSchedule() {
    var schedulesList = [];
    for (var i = 1; i <= NUM_WEEKS; i++) {
        var iframe = document.getElementById('week' + i + 'iframe');
        var iframeSchedulesList = getStartAndEndDateTime(iframe);
        iframeSchedulesList.forEach(item => {
            //exclude the course list
            if (item[2] == "schedule") {
                schedulesList.push(item);
            }
        });
    }
    return schedulesList;
}

function serializeAllCreatedScheduleAndCourse() {
    var schedulesList = [];
    for (var i = 1; i <= NUM_WEEKS; i++) {
        var iframe = document.getElementById('week' + i + 'iframe');
        var iframeSchedulesList = getStartAndEndDateTime(iframe);
        iframeSchedulesList.forEach(item => {
            schedulesList.push(item);
        });
    }
    return schedulesList;

}



function removeDayOption(daySelect, dayName) {
    for (var i = 0; i < daySelect.options.length; i++) {
        if (daySelect.options[i].value == dayName) {
            daySelect.options[i] = null;
            return;
        }
    }
}



function handleDayOrWeekDuplicateSelect(e) {
    //clear all disabled features
    var weekNumber = e.target.id.split("_")[1].slice(7);
    var iframe = document.getElementById('week' + weekNumber + 'iframe');
    iframe.contentWindow.document.getElementById('duplicatetoanotherday').disabled = false;
    iframe.contentWindow.document.getElementById('duplicatetoanotherweek').disabled = false;

    if (e.target.selectedIndex == 2) {
        //weekly repeat selected, disable the copy to day selection box
        iframe.contentWindow.document.getElementById('duplicatetoanotherday').disabled = true;
        iframe.contentWindow.document.getElementById('duplicatetoanotherday').options[0].selected = true;
    } else if (e.target.selectedIndex == 0) {
        //day(s) repeat selected, disable the copy to weel selection box
        iframe.contentWindow.document.getElementById('duplicatetoanotherweek').disabled = true;
        iframe.contentWindow.document.getElementById('duplicatetoanotherweek').options[0].selected = true;
    } else {
        //single day spans a whole week, disable the copy to day selection box & the copy to weel selection box
        iframe.contentWindow.document.getElementById('duplicatetoanotherday').disabled = true;
        iframe.contentWindow.document.getElementById('duplicatetoanotherweek').disabled = true;
        iframe.contentWindow.document.getElementById('duplicatetoanotherday').options[0].selected = true;
        iframe.contentWindow.document.getElementById('duplicatetoanotherweek').options[0].selected = true;
    }
}



/**
 * range [0, 6]
 * returns the index of the dayName, otherwise -1
 * 
 * @param {String} dayName 
 */
function getDayNumber(dayName) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (var i = 0; i < daysList.length; i++) {
        if (daysList[i] == dayName) {
            return i;
        }
    }
    return -1;
}




function handleDuplicateSchedule(e) {
    var weekNumber = e.target.id.split("_")[1].slice(7);
    var iframe = document.getElementById('week' + weekNumber + 'iframe');
    var dayName = iframe.contentWindow.document.getElementById('duplicateday').options[iframe.contentWindow.document.getElementById('duplicateday').selectedIndex].value;
    var dayNumber = getDayNumber(dayName); //default for weekly duplicate options
    //filter the duplicate schedule options
    if (dayNumber == -1 && iframe.contentWindow.document.getElementById('duplicatemode' + '_iframe=' + weekNumber).selectedIndex == 2) {
        //weekly duplicate option
        var weekOption = iframe.contentWindow.document.getElementById('duplicatetoanotherweek').options[iframe.contentWindow.document.getElementById('duplicatetoanotherweek').selectedIndex].value;
        var targetWeekNumber = weekOption.slice(5);
        var targetIframe = document.getElementById('week' + targetWeekNumber + 'iframe');
        duplicateScheduleWeekly(iframe, targetIframe);
    } else if (dayNumber != -1 && iframe.contentWindow.document.getElementById('duplicatemode' + '_iframe=' + weekNumber).selectedIndex == 1) {
        //a day spans a whole week
        var mode = "a day spans a whole week";
        duplicateScheduleDaily(iframe, dayNumber, mode);
    } else if (dayNumber != -1 && iframe.contentWindow.document.getElementById('duplicatemode' + '_iframe=' + weekNumber).selectedIndex == 0) {
        //a day spans another day
        var mode = "a day spans another day";
        var targetDayName = iframe.contentWindow.document.getElementById('duplicatetoanotherday').options[iframe.contentWindow.document.getElementById('duplicatetoanotherday').selectedIndex].value;
        var targetDayNumber = getDayNumber(targetDayName);
        duplicateScheduleDaily(iframe, dayNumber, mode, targetDayNumber);
    } else {
        //error
        console.log("Invalid duplicate action.")

    }
    //update the schedule log table, scan through all weeks (iframes)
    for (var i = 1; i <= NUM_WEEKS; i++) {
        var elem = document.getElementById('week' + i + 'iframe');
        updateScheduleLogTable(elem);
    }
}



function updateScheduleLogTable(iframe) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var weekNumber = iframe.id.slice(4, iframe.id.length - 6);
    var list = getStartAndEndDateTime(iframe);
    //check delete items and keep a updated list
    for (var i = 0; i < list.length; i++) {
        var date = (list[i][0].getMonth() + 1) + "/" + list[i][0].getDate();
        var dayName = daysList[list[i][0].getDay()];
        var start = getTimeString(list[i][0]);
        var end = getTimeString(list[i][1]);
        var name = list[i][2];
        var time = start + "-" + end;
        var startTime = getHrsAndMins(start);
        var endTime = getHrsAndMins(end);
        var durInMins = ((endTime[0] - startTime[0]) * 60 + endTime[1] - startTime[1]) >= 0 ? (endTime[0] - startTime[0]) * 60 + endTime[1] - startTime[1] : (endTime[0] - startTime[0]) * 60 + endTime[1] - startTime[1] + 24 * 60;
        var last = Math.trunc(durInMins / 60) + "h " + (durInMins % 60) + "min";
        //skip the element if it already exists in the table row
        var allTableRows = document.getElementById('schedulelogbody').childNodes;
        var pass = false;
        for (var j = 0; j < allTableRows.length; j++) {
            if (allTableRows[j].nodeName == "TR") {
                var allRowCells = allTableRows[j].childNodes;
                if (allRowCells[0].innerText == date && allRowCells[2].innerText == time) {
                    pass = true;
                    break;
                }
            }
        }
        if (pass) {
            continue;
        }
        var rowStrs = [date, dayName, time, last, name];
        //create row elements
        var elemsList = [];
        rowStrs.forEach(str => {
            elemsList.push(new Element('td', { text: str }));
        });

        //create the row in the schedule log table
        if (name == "schedule") {
            var thead = iframe.contentWindow.document.getElementById('thead:time=' + start);
            var nextNodeId = thead.nextSibling.id;
            var rowNumber = nextNodeId.slice(4, nextNodeId.indexOf("$"));
            var dayNum = daysList.indexOf(dayName) + 1;
            var removeLink = new Element('a', { id: "s" + rowNumber + "$" + dayNum + "_iframe" + weekNumber, href: "#", text: "remove" });
            elemsList.push(new Element('label', { class: "form-control" }).adopt(removeLink));
            var tableBody = document.getElementById('schedulelogbody');
            tableBody.adopt(new Element('tr').adopt(elemsList));
            removeLink.addEventListener("click", handleRemoveLink);

        } else if (name == "course") {
            var tableBody = document.getElementById('schedulelogbody');
            tableBody.adopt(new Element('tr').adopt(elemsList));
        }
    }
}


function handleRemoveLink(e) {
    e.preventDefault();
    var clearBtnAlt = e.target.id;
    var weekNumber = clearBtnAlt.split("_")[1].slice(6);
    var iframe = document.getElementById('week' + weekNumber + 'iframe');
    var btnElem = iframe.contentWindow.document.querySelector("img[alt=" + CSS.escape(clearBtnAlt) + "]");
    var insideIframe = btnElem.alt.split("_")[0];
    var identifier = insideIframe.slice(0, insideIframe.indexOf("$"));
    var row = Number(identifier.slice(1));
    var col = Number(insideIframe.slice(insideIframe.indexOf("$") + 1));
    var tdElem = iframe.contentWindow.document.getElementById('pos=' + row + "$" + col);

    var imgIdentifier = tdElem.firstChild.alt
    if (imgIdentifier.indexOf("_") != -1) {
        imgIdentifier = imgIdentifier.split("_")[0];
    }
    while (row < 96 && tdElem.firstChild && imgIdentifier == identifier) {

        //implementation for cross-day and -week schedule
        var imgElem = tdElem.firstChild;
        var atBottom = imgElem.alt.indexOf("_");

        tdElem.empty();
        tdElem.style = "";

        if (atBottom == -1) {
            //normal flow
            tdElem = iframe.contentWindow.document.getElementById('pos=' + ++row + "$" + col);
            if (tdElem && tdElem.firstChild) {
                imgIdentifier = tdElem.firstChild.alt;
                if (imgIdentifier.indexOf("_") != -1) {
                    imgIdentifier = imgIdentifier.split("_")[0];
                }
            }
        } else {
            //at the end of the row --has cross-day and -week schedule
            if (col != 7) {
                getRemovedScheduleNextDay(iframe, col + 1);
                break;
            } else {
                var weekNumber = Number(iframe.id.slice(4, iframe.id.length - 6)) + 1;
                var nextIframe = document.getElementById('week' + weekNumber + 'iframe');
                getRemovedScheduleNextWeek(nextIframe);
                break;
            }
        }

    }

    //clear the corresponding row of logs
    e.target.parentNode.parentNode.dispose();
}




function getHrsAndMins(time) {
    var hrs = Number(time.split(":")[0]);
    var mins = Number(time.split(":")[1]);
    return [hrs, mins];
}




function getTimeString(date) {
    var time = "";
    if (date.getHours() < 10 && date.getHours() >= 0 && date.getMinutes() < 10 && date.getMinutes() >= 0) {
        time = "0" + date.getHours() + ":0" + date.getMinutes();
    } else if (date.getHours() < 10 && date.getHours() >= 0) {
        time = "0" + date.getHours() + ":" + date.getMinutes();
    } else if (date.getMinutes() < 10 && date.getMinutes() >= 0) {
        time = date.getHours() + ":0" + date.getMinutes();
    } else {
        time = date.getHours() + ":" + date.getMinutes();
    }
    return time;
}



function getStartAndEndDateTime(iframe) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var schedulesList = [];
    var weekNumber = iframe.id.slice(4, iframe.id.length - 6);
    var dateDur = document.getElementById('week' + weekNumber + 'link').href;
    var dateStr = dateDur.split("#")[1];
    var weekSchedulesList = getAllCreatedSchedule(iframe);
    for (var k = 0; k < weekSchedulesList.length; k++) {
        var startDate = new Date(dateStr.split("-")[0]);
        var endDate = new Date(dateStr.split("-")[0]);
        var temp = weekSchedulesList[k].split("_");
        var format = temp[0] + "_" + temp[1];
        var arrayToInsert = getStartAndEndNumbers(format);
        var dayName = arrayToInsert[0];
        var startHrs = arrayToInsert[1];
        var startMin = arrayToInsert[2];
        var endHrs = arrayToInsert[3];
        var endMin = arrayToInsert[4];
        var dayNumber;
        for (var j = 0; j < daysList.length; j++) {
            if (dayName == daysList[j]) {
                dayNumber = j;
                break;
            }
        }
        startDate.setDate(startDate.getDate() + dayNumber);
        endDate.setDate(endDate.getDate() + dayNumber);
        //increment the end date for cross-day and -week schedule
        if ((endHrs * 60 + endMin - startHrs * 60 - startMin) < 0) {
            endDate.setDate(endDate.getDate() + 1);
        }
        startDate.setHours(startHrs, startMin);
        endDate.setHours(endHrs, endMin);
        schedulesList.push([startDate, endDate, temp[2]]);
    }
    return schedulesList;
}


function getStartAndEndNumbers(s) {
    //s = DAYSTRING_STARTTIME-ENDTIME
    var savedScheduleItems = splitSavedSchedule(s);
    var dayName = savedScheduleItems[0];
    var startTime = savedScheduleItems[1];
    var start = getHrsAndMins(startTime);
    var endTime = savedScheduleItems[2];
    var end = getHrsAndMins(endTime);
    return [dayName, start[0], start[1], end[0], end[1]];
}

function splitSavedSchedule(s) {
    //s = DAYSTRING_STARTTIME-ENDTIME
    var dayName = s.split("_")[0];
    var timeRange = s.split("_")[1];
    var startTime = timeRange.split("-")[0];
    var endTime = timeRange.split("-")[1];
    return [dayName, startTime, endTime];
}


function getScheduleNextDay(iframe, col) {
    var row = 0;
    var id = "pos=" + row + "$" + col;
    var endTime = "";
    var tdElem = iframe.contentWindow.document.getElementById(id);
    var theadId = tdElem.parentNode.firstChild.id;
    var imgElem = tdElem.firstChild;
    var identifier = imgElem.alt;
    while (identifier.indexOf("_") != -1) {
        row++;
        id = "pos=" + row + "$" + col;
        tdElem = iframe.contentWindow.document.getElementById(id);
        theadId = tdElem.parentNode.firstChild.id;
        endTime = theadId.split("=")[1];
        imgElem = tdElem.firstChild;
        if (!imgElem) {
            break;
        }
        identifier = imgElem.alt;
    }
    return endTime;
}

function getScheduleNextWeek(nextIframe) {
    var row = 0, col = 1;
    var id = "pos=" + row + "$" + col;
    var endTime = "";
    var tdElem = nextIframe.contentWindow.document.getElementById(id);
    var theadId = tdElem.parentNode.firstChild.id;
    var imgElem = tdElem.firstChild;
    var identifier = imgElem.alt;
    while (identifier.indexOf("_") != -1) {
        row++;
        id = "pos=" + row + "$" + col;
        tdElem = nextIframe.contentWindow.document.getElementById(id);
        theadId = tdElem.parentNode.firstChild.id;
        endTime = theadId.split("=")[1];
        imgElem = tdElem.firstChild;
        if (!imgElem) {
            break;
        }
        identifier = imgElem.alt;
    }
    return endTime;
}


function getAllCreatedSchedule(iframe) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var sessionsList = [];
    for (var col = 1; col <= 7; col++) {
        var startTime = "";
        var endTime = "";
        var keep = false;
        var identifier = "";
        var name = "";
        for (var row = 0; row < NUM_15MINS; row++) {
            var id = "pos=" + row + "$" + col;
            var tdElem = iframe.contentWindow.document.getElementById(id);
            var theadId = tdElem.parentNode.firstChild.id;
            if (tdElem.firstChild) {
                var imgElem = tdElem.firstChild;
                name = imgElem.name;
                var atBottom = imgElem.alt.indexOf("_");
                if (atBottom == -1) {
                    if (!keep) {
                        //a time session starts here
                        keep = true;
                        identifier = imgElem.alt;
                        startTime = theadId.split("=")[1];
                    } else if (keep && identifier == imgElem.alt) {
                        //a time session continues
                        endTime = theadId.split("=")[1];
                    } else if (keep && identifier != imgElem.alt) {
                        //a time session ends here
                        keep = true;
                        identifier = imgElem.alt;
                        endTime = theadId.split("=")[1];
                        sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime + "_" + name);
                        startTime = endTime;
                        endTime = "";
                    }
                } else {
                    var key = imgElem.alt.split("_")[1];
                    if (key == "next") {
                        //a schedule in the last row continues to the next
                        if (!keep) {
                            //a time session starts here (non-immediate start)
                            startTime = theadId.split("=")[1];
                            if (col != 7) {
                                //next day is on the same week
                                endTime = getScheduleNextDay(iframe, col + 1);
                            } else {
                                var weekNumber = Number(iframe.id.slice(4, iframe.id.length - 6)) + 1;
                                var nextIframe = document.getElementById('week' + weekNumber + 'iframe');
                                endTime = getScheduleNextWeek(nextIframe);
                            }
                            sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime + "_" + name);
                        } else if (keep && identifier == imgElem.alt.split("_")[0]) {
                            //a time session continues here
                            if (col != 7) {
                                //next day is on the same week
                                endTime = getScheduleNextDay(iframe, col + 1);
                            } else {
                                var weekNumber = Number(iframe.id.slice(4, iframe.id.length - 6)) + 1;
                                var nextIframe = document.getElementById('week' + weekNumber + 'iframe');
                                endTime = getScheduleNextWeek(nextIframe);
                            }
                            sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime + "_" + name);
                        } else if (keep && identifier != imgElem.alt.split("_")[0]) {
                            //a time session ends and another starts immediately
                            endTime = theadId.split("=")[1];
                            identifier = imgElem.alt.split("_")[0];
                            sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime + "_" + name);
                            startTime = endTime;
                            endTime = "";

                            if (col != 7) {
                                //next day is on the same week
                                endTime = getScheduleNextDay(iframe, col + 1);
                            } else {
                                var weekNumber = Number(iframe.id.slice(4, iframe.id.length - 6)) + 1;
                                var nextIframe = document.getElementById('week' + weekNumber + 'iframe');
                                endTime = getScheduleNextWeek(nextIframe);
                            }
                            sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime + "_" + name);
                        }
                        startTime = "";
                        endTime = "";
                        keep = false;
                        continue;
                    } else if (key == "skip") {
                        continue;
                    }
                }
            } else {
                //empty slot or a time session may end here
                if (keep) {
                    keep = false;
                    endTime = theadId.split("=")[1];
                    sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime + "_" + name);
                    startTime = "";
                    endTime = "";
                }
            }
        }
        //if the schedule ends at the last row, record it
        if (keep) {
            keep = false;
            sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + "00:00" + "_" + name);
            startTime = "";
            endTime = "";
        }
    }
    return sessionsList;
}

function filterDateScheduleIntoCourse(list) {
    var courses = [];
    for (var i = 0; i < list.length; i++) {
        if (list[i][2] == "course") {
            courses.push(list[i]);
        }
    }
    return courses;
}

function filterDateScheduleIntoSchedule(list) {
    var schedule = [];
    for (var i = 0; i < list.length; i++) {
        if (list[i][2] == "schedule") {
            schedule.push(list[i]);
        }
    }
    return schedule;
}


function duplicateScheduleWeekly(iframe, targetIframe) {
    //validation
    if (!canDuplicateWeekScheduleToAnotherWeek(iframe, targetIframe)) {
        console.log("the day schedule column(s) in the week to which you want to copy are not clean");
        return;
    }

    var weeklyScheduleInDate = getStartAndEndDateTime(iframe);
    weeklyScheduleInDate = filterDateScheduleIntoSchedule(weeklyScheduleInDate);

    var copiesWeekScheduleInGridList = [];  //for each element, [iframe_ref, #slots, row, col]

    //get the applicable days list
    var dayNumbersList = [];
    var nextWeekDayOptions = targetIframe.contentWindow.document.getElementById('classscheduleday').options;
    for (var i = 0; i < nextWeekDayOptions.length; i++) {
        dayNumbersList.push(getDayNumber(nextWeekDayOptions[i].value));
    }

    for (var i = 0; i < weeklyScheduleInDate.length; i++) {
        //get the #slots and starting rows in array
        var temp = getRowAndSlotsNumber(weeklyScheduleInDate[i]);
        if (hasItem(dayNumbersList, temp[2])) {
            copiesWeekScheduleInGridList.push([targetIframe, temp[1], temp[0], temp[2] + 1]);
        }
    }

    //apply changes to visual blocks
    copiesWeekScheduleInGridList.forEach(block => {
        addVisualTimeSlot(block[0], block[1], block[2], block[3], "schedule");
    });
}

function hasItem(list, item) {
    for (var i = 0; i < list.length; i++) {
        if (item == list[i]) {
            return true;
        }
    }
    return false;
}


function addScheduleToNextDay(iframe, slotsRemain, col, identifier, src, option) {
    var row = 0;
    for (var i = 0; i < slotsRemain; i++) {
        var td = iframe.contentWindow.document.getElementById("pos=" + row + "$" + col);
        td.innerText = "";
        if (i == slotsRemain - 1) {
            td.adopt(new Element('img', { src: src, name: option, height: "10", width: "10", draggable: "false", alt: "s" + identifier + "_skip" }));

            //the last cell in the column, down, left and right sides colored
            td.setStyles({
                "border-bottom": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
            });
        } else {
            td.adopt(new Element('img', { src: src, name: option, height: "10", width: "10", draggable: "false", alt: "s" + identifier + "_skip" }));

            //the cells in the middle of the column, only left and right sides colored
            td.setStyles({
                "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
            });
        }
        row++;
    }
    if (addVisualTimeSlot.colorSelect < borderColorList.length - 1) {
        addVisualTimeSlot.colorSelect++;
    } else {
        addVisualTimeSlot.colorSelect = 0;
    }
}

function addScheduleToNextWeek(iframe, slotsRemain, identifier, src, option) {
    var row = 0, col = 1;
    for (var i = 0; i < slotsRemain; i++) {
        var td = iframe.contentWindow.document.getElementById("pos=" + row + "$" + col);
        td.innerText = "";
        if (i == slotsRemain - 1) {
            td.adopt(new Element('img', { src: src, name: option, height: "10", width: "10", draggable: "false", alt: "s" + identifier + "_skip" }));

            //the last cell in the column, down, left and right sides colored
            td.setStyles({
                "border-bottom": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
            });
        } else {
            td.adopt(new Element('img', { src: src, name: option, height: "10", width: "10", draggable: "false", alt: "s" + identifier + "_skip" }));

            //the cells in the middle of the column, only left and right sides colored
            td.setStyles({
                "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
            });
        }
        row++;
    }
    if (addVisualTimeSlot.colorSelect < borderColorList.length - 1) {
        addVisualTimeSlot.colorSelect++;
    } else {
        addVisualTimeSlot.colorSelect = 0;
    }
}


addVisualTimeSlot.colorSelect = 0;
function addVisualTimeSlot(iframe, numSlots, row, col, option) {
    var weekNumber = Number(iframe.id.slice(4, iframe.id.length - 6));
    const identifier = row;

    const srcSchedule = "/static/images/sessionDurationMarkBnt.svg";
    const srcCourse = "/static/images/courseScheduleBtn.svg";
    var src = "";
    if (option == null || option == "schedule") {
        src = srcSchedule;
    } else if (option == "course") {
        src = srcCourse;
    }

    for (var i = 0; i < numSlots; i++, row++) {
        //control for cross-day and -week schedule intervals
        var td = iframe.contentWindow.document.getElementById("pos=" + row + "$" + col);
        if (row == 95 && numSlots - i > 1) {
            if (i == 0) {
                td.adopt([new Element('img', { src: src, name: option, class: "abscenter", height: "10", width: "10", draggable: "false", alt: "s" + identifier + "_next" }), new Element('img', { src: "/static/images/deleteScheduledSessionBtn.svg", class: "absright", height: "12", style: "cursor: pointer;", width: "12", draggable: "false", alt: "s" + identifier + "$" + col + "_iframe" + weekNumber })]);
                var deleteBtn = td.firstChild.nextSibling;
                deleteBtn.addEventListener("click", handleClearATimeSession);

                //the first cell in the column, up, left, and right sides colored
                td.setStyles({
                    "border-top": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                    "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                    "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
                });
            } else {
                //handle the last element
                td.adopt(new Element('img', { src: src, name: option, height: "10", width: "10", draggable: "false", alt: "s" + identifier + "_next" }));

                //the cells in the middle of the column, only left and right sides colored
                td.setStyles({
                    "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                    "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
                });
            }
            continue;
        }
        else if (row > 95 && col != 7) {
            //add the rest of time slots to the start of the next day
            addScheduleToNextDay(iframe, numSlots - i, col + 1, identifier, src, option);
            return;

        } else if (row > 95 && col == 7) {
            //add the rest of time slots to the start day of the next week
            var nextIframe = document.getElementById('week' + (weekNumber + 1) + 'iframe');
            addScheduleToNextWeek(nextIframe, numSlots - i, identifier, src, option);
            return;
        }

        var td = iframe.contentWindow.document.getElementById("pos=" + row + "$" + col);
        td.innerText = "";
        if (i == 0 && numSlots != 1) {
            if (src == srcSchedule) {
                td.adopt([new Element('img', { src: src, name: option, class: "abscenter", height: "10", width: "10", draggable: "false", alt: "s" + identifier }), new Element('img', { src: "/static/images/deleteScheduledSessionBtn.svg", class: "absright", height: "12", style: "cursor: pointer;", width: "12", draggable: "false", alt: "s" + identifier + "$" + col + "_iframe" + weekNumber })]);
                var deleteBtn = td.firstChild.nextSibling;
                deleteBtn.addEventListener("click", handleClearATimeSession);
            } else if (src == srcCourse) {
                td.adopt(new Element('img', { src: src, name: option, class: "abscenter", height: "10", width: "10", draggable: "false", alt: "s" + identifier }));
            }

            //the first cell in the column, up, left, and right sides colored
            td.setStyles({
                "border-top": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
            });
        } else if (i == 0 && numSlots == 1) {
            if (src == srcSchedule) {
                td.adopt([new Element('img', { src: src, name: option, class: "abscenter", height: "10", width: "10", draggable: "false", alt: "s" + identifier }), new Element('img', { src: "/static/images/deleteScheduledSessionBtn.svg", class: "absright", height: "12", style: "cursor: pointer;", width: "12", draggable: "false", alt: "s" + identifier + "$" + col + "_iframe" + weekNumber })]);
                var deleteBtn = td.firstChild.nextSibling;
                deleteBtn.addEventListener("click", handleClearATimeSession);
            } else if (src == srcCourse) {
                td.adopt(new Element('img', { src: src, name: option, class: "abscenter", height: "10", width: "10", draggable: "false", alt: "s" + identifier }));
            }

            //if the slot is the only slot --session time == 15min
            td.setStyles({
                "border-top": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-bottom": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
            });
        } else if (i == numSlots - 1) {
            td.adopt(new Element('img', { src: src, name: option, height: "10", width: "10", draggable: "false", alt: "s" + identifier }));

            //the last cell in the column, down, left and right sides colored
            td.setStyles({
                "border-bottom": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
            });
        } else {
            td.adopt(new Element('img', { src: src, name: option, height: "10", width: "10", draggable: "false", alt: "s" + identifier }));

            //the cells in the middle of the column, only left and right sides colored
            td.setStyles({
                "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
                "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
            });
        }
    }
    if (addVisualTimeSlot.colorSelect < borderColorList.length - 1) {
        addVisualTimeSlot.colorSelect++;
    } else {
        addVisualTimeSlot.colorSelect = 0;
    }
}


function filterScheduleIntoCourse(schedule) {
    var courses = [];
    for (var i = 0; i < schedule.length; i++) {
        if (schedule[i].split("_")[2] == "course") {
            courses.push(schedule[i]);
        }
    }
    return courses;
}

function filterScheduleIntoSchedule(schedule) {
    var sch = [];
    for (var i = 0; i < schedule.length; i++) {
        if (schedule[i].split("_")[2] == "schedule") {
            sch.push(schedule[i]);
        }
    }
    return sch;
}

function canDuplicateWeekScheduleToAnotherWeek(iframe, targetIframe) {
    var targetWeekSchedule = getAllCreatedSchedule(targetIframe);
    var weekSchedule = getAllCreatedSchedule(iframe);
    var targetCourseSchedule = filterScheduleIntoCourse(targetWeekSchedule);
    targetWeekSchedule = filterScheduleIntoSchedule(targetWeekSchedule);
    weekSchedule = filterScheduleIntoSchedule(weekSchedule);
    //target week course conflicts with original week schedule
    for (var i = 0; i < weekSchedule.length; i++) {
        var temp1 = weekSchedule[i].split("_");
        var format1 = temp1[0] + "_" + temp1[1];
        var startToEnd = getStartAndEndTotalMins(format1);
        for (var j = 0; j < targetCourseSchedule.length; j++) {
            var temp2 = targetCourseSchedule[j].split("_");
            var format2 = temp2[0] + "_" + temp2[1];
            var original = getStartAndEndTotalMins(format2);
            if (startToEnd[0] == original[0]) {
                //on the same day number
                if ((startToEnd[1] >= original[1] && startToEnd[1] < original[2]) && (startToEnd[2] >= original[1] && startToEnd[2] <= original[2])) {
                    //the new schedule all in the original schedule
                    return false;
                } else if ((startToEnd[1] < original[1]) && (startToEnd[2] <= original[2] && startToEnd[2] > original[1])) {
                    //the new schedule's bottom half in the original schedule
                    return false;
                } else if ((startToEnd[2] > original[2] && (startToEnd[1] >= original[1] && startToEnd[1] < original[2]))) {
                    //the new schedule's upper half in the original schedule
                    return false;
                } else if (startToEnd[1] < original[1] && startToEnd[2] > original[2]) {
                    //the original schedule is part of the new schedule
                    return false;
                }
            }
        }
    }


    if (targetWeekSchedule.length != 0) {
        //target week has been occupied with at least one schedule
        return false;
    }

    //the start day(SUN) and end day(SAT) in the original week have cross-week schedule
    for (var i = 0; i < weekSchedule.length; i++) {
        if ("Saturday" == weekSchedule[i].split("_")[0]) {
            var startToEndInMins = getStartAndEndTotalMins(weekSchedule[i]);
            var time_diff = startToEndInMins[2] - startToEndInMins[1];
            if (time_diff < 0) {
                //has cross-day and -week schedule
                return false;
            }
        } else if ("Sunday" == weekSchedule[i].split("_")[0]) {
            var weekBeforeNumber = Number(iframe.id.slice(4, iframe.id.length - 6)) - 1;
            if (weekBeforeNumber >= 1) {
                var weekBeforeSchedule = getAllCreatedSchedule(document.getElementById('week' + weekBeforeNumber + 'iframe'));
                weekBeforeSchedule = filterScheduleIntoSchedule(weekBeforeSchedule);
                for (var j = 0; j < weekBeforeSchedule.length; j++) {
                    if ("Saturday" == weekBeforeSchedule[j].split("_")[0]) {
                        var startToEndInMins = getStartAndEndTotalMins(weekBeforeSchedule[j]);
                        var time_diff = startToEndInMins[2] - startToEndInMins[1];
                        if (time_diff < 0) {
                            //has cross-day and -week schedule
                            return false;
                        }
                    }
                }
            }

        }
    }

    //the first day (SUN) of the target week has cross-week schedule
    var weekBeforeNumber = Number(iframe.id.slice(4, iframe.id.length - 6)) - 1;
    if (weekBeforeNumber <= 0) {
        return true;
    } else {
        var weekBeforeSchedule = getAllCreatedSchedule(document.getElementById('week' + weekBeforeNumber + 'iframe'));
        for (var i = 0; i < weekBeforeSchedule.length; i++) {
            if ("Saturday" == weekBeforeSchedule[i].split("_")[0]) {
                var startToEndInMins = getStartAndEndTotalMins(weekBeforeSchedule[i]);
                var time_diff = startToEndInMins[2] - startToEndInMins[1];
                if (time_diff < 0) {
                    //has cross-day and -week schedule
                    return false;
                }
            }
        }
    }
    return true;
}




function duplicateScheduleDaily(iframe, dayNumber, mode, targetDayNumber) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


    //validate if it's possible to duplicate -- non empty day schedule?
    if (mode == "a day spans a whole week" && !canDuplicateDayScheduleToWeek(iframe, daysList[dayNumber])) {
        console.log("the day schedule columns to which you want to copy are not clean");
        return;
    } else if (mode == "a day spans another day" && !canDuplicateDayScheduleToAnotherDay(iframe, daysList[dayNumber], daysList[targetDayNumber])) {
        console.log("the day schedule column to which you want to copy are not clean");
        return;
    }

    //create an array of targeted day schedule
    var weekNumber = Number(iframe.id.slice(4, iframe.id.length - 6));
    var weeklyScheduleStringList = getAllCreatedSchedule(iframe);
    weeklyScheduleStringList = filterScheduleIntoSchedule(weeklyScheduleStringList);

    var dayScheduleList = [];
    for (var i = 0; i < weeklyScheduleStringList.length; i++) {
        if (weeklyScheduleStringList[i].split("_")[0] == daysList[dayNumber]) {
            dayScheduleList.push(weeklyScheduleStringList[i]);
        }
    }
    var dayScheduleInDateList = [];
    dayScheduleList.forEach(elem => {
        dayScheduleInDateList.push(getSingleTimeSchedule(weekNumber, elem));
    });
    var dayScheduleInGridList = []; //for each element, [iframe_ref, #slots, row, col]
    dayScheduleInDateList.forEach(date => {
        var temp = getRowAndSlotsNumber(date);
        dayScheduleInGridList.push([iframe, temp[1], temp[0], dayNumber + 1]);
    });

    var copiesDayScheduleInGridList = [];
    var colNumbersList = [];
    if (mode == "a day spans a whole week") {
        //create an array of copies
        var weekDayOptions = iframe.contentWindow.document.getElementById('classscheduleday').options;
        for (var i = 0; i < weekDayOptions.length; i++) {
            //find the dayNumber for each dayName
            for (var j = 0; j < daysList.length; j++) {
                if (j != dayNumber && weekDayOptions[i].value == daysList[j]) {
                    colNumbersList.push(j + 1);
                    break;
                }
            }
        }
    } else if (mode == "a day spans another day") {
        colNumbersList = [targetDayNumber + 1];
    }
    //length of this recursion: a week/a day
    for (var i = 0; i < colNumbersList.length; i++) {
        for (var j = 0; j < dayScheduleInGridList.length; j++) {
            var temp = [dayScheduleInGridList[j][0], dayScheduleInGridList[j][1], dayScheduleInGridList[j][2], colNumbersList[i]];
            copiesDayScheduleInGridList.push(temp);
        }
    }

    //apply changes as visual blocks
    copiesDayScheduleInGridList.forEach(block => {
        addVisualTimeSlot(block[0], block[1], block[2], block[3], "schedule");
    });

}


function getRowAndSlotsNumber(startToEnd) {
    var gridStartTime = START_TIME.getHours() * 60 + START_TIME.getMinutes();
    var startTime = startToEnd[0].getHours() * 60 + startToEnd[0].getMinutes();
    var endTime = startToEnd[0].getDate() == startToEnd[1].getDate() ? startToEnd[1].getHours() * 60 + startToEnd[1].getMinutes() : startToEnd[1].getHours() * 60 + 24 * 60 + startToEnd[1].getMinutes();
    var row = Math.trunc((startTime - gridStartTime) / 15);
    var numSlots = Math.trunc((endTime - startTime) / 15);
    return [row, numSlots, startToEnd[0].getDay()];
}



function getSingleTimeSchedule(weekNumber, str) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var dateDur = document.getElementById('week' + weekNumber + 'link').href;
    var dateStr = dateDur.split("#")[1];
    var startDate = new Date(dateStr.split("-")[0]);
    var endDate = new Date(dateStr.split("-")[0]);
    var temp = str.split("_");
    var format = temp[0] + "_" + temp[1];
    var arrayToInsert = getStartAndEndNumbers(format);
    var dayName = arrayToInsert[0];
    var startHrs = arrayToInsert[1];
    var startMin = arrayToInsert[2];
    var endHrs = arrayToInsert[3];
    var endMin = arrayToInsert[4];
    var dayNumber;
    for (var j = 0; j < daysList.length; j++) {
        if (dayName == daysList[j]) {
            dayNumber = j;
            break;
        }
    }
    startDate.setDate(startDate.getDate() + dayNumber);
    endDate.setDate(endDate.getDate() + dayNumber);
    //increment the end date for cross-day and -week schedule
    if ((endHrs * 60 + endMin - startHrs * 60 - startMin) < 0) {
        endDate.setDate(endDate.getDate() + 1);
    }
    startDate.setHours(startHrs, startMin);
    endDate.setHours(endHrs, endMin);
    return [startDate, endDate, temp[2]];
}



function canDuplicateDayScheduleToWeek(iframe, dayName) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var weekSchedule = getAllCreatedSchedule(iframe);
    var weekCourseSchedule = filterScheduleIntoCourse(weekSchedule);
    weekSchedule = filterScheduleIntoSchedule(weekSchedule);
    //target's course conflicts with the original day schedule
    for (var i = 0; i < weekSchedule.length; i++) {
        var temp1 = weekSchedule[i].split("_");
        var format1 = temp1[0] + "_" + temp1[1];
        var startToEnd = getStartAndEndTotalMins(format1);
        if (startToEnd[0] != dayName) {
            for (var j = 0; j < weekCourseSchedule.length; j++) {
                var temp2 = weekCourseSchedule[j].split("_");
                var format2 = temp2[0] + "_" + temp2[1];
                var original = getStartAndEndTotalMins(format2);
                if (original[0] != dayName && startToEnd[0] == original[0]) {
                    //on the same day number
                    if ((startToEnd[1] >= original[1] && startToEnd[1] < original[2]) && (startToEnd[2] >= original[1] && startToEnd[2] <= original[2])) {
                        //the new schedule all in the original schedule
                        return false;
                    } else if ((startToEnd[1] < original[1]) && (startToEnd[2] <= original[2] && startToEnd[2] > original[1])) {
                        //the new schedule's bottom half in the original schedule
                        return false;
                    } else if ((startToEnd[2] > original[2] && (startToEnd[1] >= original[1] && startToEnd[1] < original[2]))) {
                        //the new schedule's upper half in the original schedule
                        return false;
                    } else if (startToEnd[1] < original[1] && startToEnd[2] > original[2]) {
                        //the original schedule is part of the new schedule
                        return false;
                    }
                }
            }
        }
    }

    for (var i = 0; i < weekSchedule.length; i++) {
        if (dayName != weekSchedule[i].split("_")[0]) {
            return false;
        }
    }

    //check the day itself
    var originalDayNumber = daysList.indexOf(dayName);
    var originalDayBeforeNumber = originalDayNumber == 0 ? 6 : originalDayNumber - 1;
    if (originalDayBeforeNumber == 6) {
        var weekBeforeNumber = Number(iframe.id.slice(4, iframe.id.length - 6)) - 1;
        if (weekBeforeNumber >= 1) {
            var weekBeforeSchedule = getAllCreatedSchedule(document.getElementById('week' + weekBeforeNumber + 'iframe'));
            for (var i = 0; i < weekBeforeSchedule.length; i++) {
                if ("Saturday" == weekBeforeSchedule[i].split("_")[0]) {
                    var startToEndInMins = getStartAndEndTotalMins(weekBeforeSchedule[i]);
                    var time_diff = startToEndInMins[2] - startToEndInMins[1];
                    if (time_diff < 0) {
                        //has cross-day and -week schedule
                        return false;
                    }
                }
            }
        }
    } else {
        for (var i = 0; i < weekSchedule.length; i++) {
            if (daysList[originalDayBeforeNumber] == weekSchedule[i].split("_")[0]) {
                var startToEndInMins = getStartAndEndTotalMins(weekSchedule[i]);
                var time_diff = startToEndInMins[2] - startToEndInMins[1];
                if (time_diff < 0) {
                    //has cross-day and -week schedule
                    return false;
                }
            }
        }
    }

    for (var i = 0; i < weekSchedule.length; i++) {
        if (dayName == weekSchedule[i].split("_")[0]) {
            var startToEndInMins = getStartAndEndTotalMins(weekSchedule[i]);
            var time_diff = startToEndInMins[2] - startToEndInMins[1];
            if (time_diff < 0) {
                //has cross-day and -week schedule
                return false;
            }
        }
    }

    //check the last day of the last week for cross-day and -week schedule
    var weekBeforeNumber = Number(iframe.id.slice(4, iframe.id.length - 6)) - 1;
    if (weekBeforeNumber <= 0) {
        return true;
    } else {
        var weekBeforeSchedule = getAllCreatedSchedule(document.getElementById('week' + weekBeforeNumber + 'iframe'));
        for (var i = 0; i < weekBeforeSchedule.length; i++) {
            if ("Saturday" == weekBeforeSchedule[i].split("_")[0]) {
                var startToEndInMins = getStartAndEndTotalMins(weekBeforeSchedule[i]);
                var time_diff = startToEndInMins[2] - startToEndInMins[1];
                if (time_diff < 0) {
                    //has cross-day and -week schedule
                    return false;
                }
            }
        }
    }

    return true;
}


function canDuplicateDayScheduleToAnotherDay(iframe, dayName, targetDayName) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var weekSchedule = getAllCreatedSchedule(iframe);
    var weekCourseSchedule = filterScheduleIntoCourse(weekSchedule);
    weekSchedule = filterScheduleIntoSchedule(weekSchedule);
    //target's course conflicts with the original day schedule
    for (var i = 0; i < weekSchedule.length; i++) {
        var temp1 = weekSchedule[i].split("_");
        var format1 = temp1[0] + "_" + temp1[1];
        var startToEnd = getStartAndEndTotalMins(format1);
        if (startToEnd[0] == dayName) {
            for (var j = 0; j < weekCourseSchedule.length; j++) {
                var temp2 = weekCourseSchedule[j].split("_");
                var format2 = temp2[0] + "_" + temp2[1];
                var original = getStartAndEndTotalMins(format2);
                if (original[0] == targetDayName) {
                    //on the same day number
                    if ((startToEnd[1] >= original[1] && startToEnd[1] < original[2]) && (startToEnd[2] >= original[1] && startToEnd[2] <= original[2])) {
                        //the new schedule all in the original schedule
                        return false;
                    } else if ((startToEnd[1] < original[1]) && (startToEnd[2] <= original[2] && startToEnd[2] > original[1])) {
                        //the new schedule's bottom half in the original schedule
                        return false;
                    } else if ((startToEnd[2] > original[2] && (startToEnd[1] >= original[1] && startToEnd[1] < original[2]))) {
                        //the new schedule's upper half in the original schedule
                        return false;
                    } else if (startToEnd[1] < original[1] && startToEnd[2] > original[2]) {
                        //the original schedule is part of the new schedule
                        return false;
                    }
                }
            }
        }
    }

    for (var i = 0; i < weekSchedule.length; i++) {
        if (targetDayName == weekSchedule[i].split("_")[0]) {
            return false;
        }
    }

    //check the day itself has cross-day or -week schedule
    var originalDayNumber = daysList.indexOf(dayName);
    var originalDayBeforeNumber = originalDayNumber == 0 ? 6 : originalDayNumber - 1;
    if (originalDayBeforeNumber == 6) {
        var weekBeforeNumber = Number(iframe.id.slice(4, iframe.id.length - 6)) - 1;
        if (weekBeforeNumber >= 1) {
            var weekBeforeSchedule = getAllCreatedSchedule(document.getElementById('week' + weekBeforeNumber + 'iframe'));
            for (var i = 0; i < weekBeforeSchedule.length; i++) {
                if ("Saturday" == weekBeforeSchedule[i].split("_")[0]) {
                    var startToEndInMins = getStartAndEndTotalMins(weekBeforeSchedule[i]);
                    var time_diff = startToEndInMins[2] - startToEndInMins[1];
                    if (time_diff < 0) {
                        //has cross-day and -week schedule
                        return false;
                    }
                }
            }
        }
    } else {
        for (var i = 0; i < weekSchedule.length; i++) {
            if (daysList[originalDayBeforeNumber] == weekSchedule[i].split("_")[0]) {
                var startToEndInMins = getStartAndEndTotalMins(weekSchedule[i]);
                var time_diff = startToEndInMins[2] - startToEndInMins[1];
                if (time_diff < 0) {
                    //has cross-day and -week schedule
                    return false;
                }
            }
        }
    }

    for (var i = 0; i < weekSchedule.length; i++) {
        if (dayName == weekSchedule[i].split("_")[0]) {
            var startToEndInMins = getStartAndEndTotalMins(weekSchedule[i]);
            var time_diff = startToEndInMins[2] - startToEndInMins[1];
            if (time_diff < 0) {
                //has cross-day and -week schedule
                return false;
            }
        }
    }


    //check the day before the target day has cross-day and -week schedule
    var dayNumber = daysList.indexOf(targetDayName);
    var dayBeforeNumber = dayNumber == 0 ? 6 : dayNumber;
    if (dayBeforeNumber == 6) {
        //go back to the last day (SAT) of the previous week
        var weekBeforeNumber = Number(iframe.id.slice(4, iframe.id.length - 6)) - 1;
        if (weekBeforeNumber <= 0) {
            return true;
        } else {
            var weekBeforeSchedule = getAllCreatedSchedule(document.getElementById('week' + weekBeforeNumber + 'iframe'));
            for (var i = 0; i < weekBeforeSchedule.length; i++) {
                if (daysList[dayBeforeNumber] == weekBeforeSchedule[i].split("_")[0]) {
                    var startToEndInMins = getStartAndEndTotalMins(weekBeforeSchedule[i]);
                    var time_diff = startToEndInMins[2] - startToEndInMins[1];
                    if (time_diff < 0) {
                        //has cross-day and -week schedule
                        return false;
                    }
                }
            }
        }

    } else {
        //on the same week
        for (var i = 0; i < weekSchedule.length; i++) {
            if (daysList[dayBeforeNumber] == weekSchedule[i].split("_")[0]) {
                var startToEndInMins = getStartAndEndTotalMins(weekSchedule[i]);
                var time_diff = startToEndInMins[2] - startToEndInMins[1];
                if (time_diff < 0) {
                    //has cross-day and -week schedule
                    return false;
                }
            }
        }
    }
    return true;
}




function handleAddTimeSlot(e) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var weekNumber = Number(e.target.id.split("=")[1]);
    var iframe = document.getElementById('week' + weekNumber + 'iframe');
    var timeArr = getStartTimeAndDuration(iframe);
    var startTime = timeArr[0];
    var endTime = timeArr[2];
    var numSlots = Math.ceil(timeArr[1] / 15);
    var dayName = iframe.contentWindow.document.getElementById('classscheduleday').options[iframe.contentWindow.document.getElementById('classscheduleday').selectedIndex].value;
    var col;
    for (var i = 0; i < daysList.length; i++) {
        if (dayName == daysList[i]) {
            col = i + 1;
            break;
        }
    }
    //get all filled-in sessions
    var inputFormat = dayName + "_" + startTime + "-" + endTime;
    var sessionsList = getAllCreatedSchedule(iframe);
    var canAdd = canAddNewTimeSchedule(inputFormat, sessionsList, iframe);
    if (!canAdd[0]) {
        console.log(canAdd[1] + ": cannot add a new schedule");
        return;
    }
    var durationStr = canAdd[1];
    var str = dayName + "_" + startTime + "-" + endTime;
    var thead = iframe.contentWindow.document.getElementById('thead:time=' + startTime);
    var nextNodeId = thead.nextSibling.id;
    var row = nextNodeId.slice(4, nextNodeId.indexOf("$"));
    displayCreatedScheduleInText(iframe, weekNumber, row, str, durationStr);
    addVisualTimeSlot(iframe, numSlots, row, col, "schedule");
}


function displayCreatedScheduleInText(iframe, weekNumber, row, str, duration) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    //add the newly inserted item
    var newTime = getSingleTimeSchedule(weekNumber, str);
    var rowStr = [(newTime[0].getMonth() + 1) + "/" + newTime[0].getDate(), daysList[newTime[0].getDay()], getTimeString(newTime[0]) + "-" + getTimeString(newTime[1]), duration, "schedule"];
    var addList = [];
    rowStr.forEach(str => {
        addList.push(new Element('td', { text: str }));
    });
    //id format s0$3_iframe1
    var dayNumber = daysList.indexOf(str.split("_")[0]) + 1;
    var removeLink = new Element('a', { id: "s" + row + "$" + dayNumber + "_iframe" + weekNumber, href: "#", text: "remove" });
    addList.push(new Element('label', { class: "form-control" }).adopt(removeLink));
    document.getElementById('schedulelogbody').adopt(new Element('tr').adopt(addList));
    removeLink.addEventListener("click", handleRemoveLink);
}



//can only be called in the iframe
function canAddNewTimeSchedule(s, list, iframe) {
    var temp = s.split("_");
    var format = temp[0] + "_" + temp[1];
    var arrayToInsert = getStartAndEndTotalMins(format);
    var dayName = arrayToInsert[0];
    var startTime = arrayToInsert[1];
    var endTime = arrayToInsert[2];
    //validate start and end time order
    if (endTime - startTime <= 0) {
        //error
        return [false, "end time must come later than start time"];
    }
    for (var i = 0; i < list.length; i++) {
        var scheduleItems = getStartAndEndTotalMins(list[i]);
        //schedules conflict
        if (scheduleItems[0] == dayName && ((startTime >= scheduleItems[1] && startTime < scheduleItems[2]) && (endTime >= scheduleItems[1] && endTime <= scheduleItems[2]))) {
            return [false, "schedule conflicts"];
        } else if (scheduleItems[0] == dayName && (startTime < scheduleItems[1] && (endTime <= scheduleItems[2] && endTime > scheduleItems[1]))) {
            return [false, "schedule conflicts"];
        } else if (scheduleItems[0] == dayName && (endTime > scheduleItems[2] && (startTime >= scheduleItems[1] && startTime < scheduleItems[2]))) {
            return [false, "schedule conflicts"];
        } else if (scheduleItems[0] == dayName && (startTime < scheduleItems[1] && endTime > scheduleItems[2])) {
            return [false, "schedule conflicts"];
        }
    }
    var hrs = Math.trunc((endTime - startTime) / 60);
    var mins = (endTime - startTime) % 60;
    var lasts = hrs + "h " + mins + "min";
    iframe.contentWindow.document.getElementById('classsessionduration').value = lasts;
    return [true, lasts];
}


function getStartAndEndTotalMins(s) {
    //s = DAYSTRING_STARTTIME-ENDTIME
    var savedScheduleItems = splitSavedSchedule(s);
    var dayName = savedScheduleItems[0];
    var startTime = savedScheduleItems[1];
    var startHrs = getHrsAndMins(startTime)[0];
    var startMins = getHrsAndMins(startTime)[1];
    var endTime = savedScheduleItems[2];
    var endHrs = getHrsAndMins(endTime)[0];
    var endMins = getHrsAndMins(endTime)[1];
    var startInMins = startHrs * 60 + startMins;
    var endInMins = endHrs * 60 + endMins;
    return [dayName, startInMins, endInMins];
}



function getStartTimeAndDuration(iframe) {
    var startTime = iframe.contentWindow.document.getElementById('classschedulestartsat').options[iframe.contentWindow.document.getElementById('classschedulestartsat').selectedIndex].value;
    var endTime = iframe.contentWindow.document.getElementById('classscheduleendsat').options[iframe.contentWindow.document.getElementById('classscheduleendsat').selectedIndex].value;
    var startHrs = Number(startTime.split(":")[0]);
    var startMins = Number(startTime.split(":")[1]);
    var endHrs = Number(endTime.split(":")[0]);
    var endMins = Number(endTime.split(":")[1]);
    var duration = endHrs * 60 + endMins - startHrs * 60 - startMins;
    return [startTime, duration, endTime];
}



function addWeekScheduleOptionsIframe(iframe) {
    //add options to day selection box
    var select = iframe.contentWindow.document.getElementById('classscheduleday');
    if (select.options.length == 0) {
        addDays(select);
    }
    select = iframe.contentWindow.document.getElementById('duplicateday');
    if (select.options.length == 1) {
        addDays(select);
    }
    select = iframe.contentWindow.document.getElementById('duplicatetoanotherday');
    if (select.options.length == 1) {
        addDays(select);
    }
    select = iframe.contentWindow.document.getElementById('duplicatetoanotherweek');
    if (select.options.length == 1) {
        addWeeks(select);
    }
    select = iframe.contentWindow.document.getElementById("classschedulestartsat");
    if (select.options.length == 0) {
        addTime(select);
    }
    select = iframe.contentWindow.document.getElementById("classscheduleendsat");
    if (select.options.length == 0) {
        addTime(select);
    }
}


function addDays(select) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    daysList.forEach(day => {
        select.add(new Element('option', { value: day, text: day }), null);
    });
}

function addWeeks(select) {
    for (var i = 1; i <= NUM_WEEKS; i++) {
        select.add(new Element('option', { value: "Week " + i, text: "Week " + i }), null);
    }
}

function addTimeInRange(select) {
    //populate a time every 15min
    var date = new Date(START_TIME.toString());
    var time = "";
    while (date.getHours() != END_TIME.getHours() || date.getMinutes() != END_TIME.getMinutes()) {
        if (date.getHours() < 10 && date.getHours() >= 0 && date.getMinutes() < 10 && date.getMinutes() >= 0) {
            time = "0" + date.getHours() + ":0" + date.getMinutes();
        } else if (date.getHours() < 10 && date.getHours() >= 0) {
            time = "0" + date.getHours() + ":" + date.getMinutes();
        } else if (date.getMinutes() < 10 && date.getMinutes() >= 0) {
            time = date.getHours() + ":0" + date.getMinutes();
        } else {
            time = date.getHours() + ":" + date.getMinutes();
        }
        select.add(new Element('option', { text: time, value: time }), null);
        date.setMinutes(date.getMinutes() + 15);
    }
    //for the last time slot
    if (date.getHours() < 10 && date.getHours() >= 0 && date.getMinutes() < 10 && date.getMinutes() >= 0) {
        time = "0" + date.getHours() + ":0" + date.getMinutes();
    } else if (date.getHours() < 10 && date.getHours() >= 0) {
        time = "0" + date.getHours() + ":" + date.getMinutes();
    } else if (date.getMinutes() < 10 && date.getMinutes() >= 0) {
        time = date.getHours() + ":0" + date.getMinutes();
    } else {
        time = date.getHours() + ":" + date.getMinutes();
    }
    select.add(new Element('option', { text: time, value: time }), null);
}



function addWeekScheduleTable() {
    //start time
    var dateIterator = new Date(START_TIME.toString());
    //end time
    var endHrs = END_TIME.getHours();
    var endMins = END_TIME.getMinutes();

    var time = "";
    var rowPos = 0;
    var colPos = 0;

    //add a iframe for time schedule
    var rowElems = [];

    //make the first row: 00:00 - 00:15
    var firstRowList = [];
    var time = getTimeString(dateIterator);
    firstRowList.push(new Element('th', { scope: "row", text: time, id: "thead:time=" + time, class: "thcss" }));
    colPos++
    //iterate over the days in a week
    for (var i = 0; i < 7; i++) {
        firstRowList.push(new Element('td', { id: "pos=" + rowPos + "$" + colPos++, class: "tdcss" }));
    }
    rowElems.push(new Element('tr').adopt(firstRowList));
    rowPos++;
    colPos = 0;
    dateIterator.setMinutes(dateIterator.getMinutes() + 15);

    //make the rest of the rows(00:15 - 24:00(<==> 00:00))
    while (dateIterator.getHours() != endHrs || dateIterator.getMinutes() != endMins) {
        var rowList = [];
        //for each row, get the time slot string
        time = getTimeString(dateIterator);
        rowList.push(new Element('th', { scope: "row", text: time, id: "thead:time=" + time, class: "thcss" }));
        colPos++;
        //iterate over the days in a week
        for (var i = 0; i < 7; i++) {
            rowList.push(new Element('td', { id: "pos=" + rowPos + "$" + colPos++, class: "tdcss" }));
        }
        rowElems.push(new Element('tr').adopt(rowList));
        rowPos++;
        colPos = 0;
        dateIterator.setMinutes(dateIterator.getMinutes() + 15);
    }

    return rowElems;
}



for (var i = 0; i < document.getElementById("navfilter").childNodes.length; i++) {
    var elem = document.getElementById("navfilter").childNodes[i];
    if (elem.nodeName == "LI") {
        elem.firstChild.nextSibling.addEventListener("click", handleFilterScheduleLogTable);
    }
}
function handleFilterScheduleLogTable(e) {
    e.preventDefault();
    //display all rows
    var allTableRows = document.getElementById('schedulelogbody').childNodes;
    for (var j = 0; j < allTableRows.length; j++) {
        if (allTableRows[j].nodeName == "TR") {
            allTableRows[j].removeClass("hideRow");
        }
    }
    //change button status
    var text = e.target.innerText;
    var parentNode = e.target.parentNode.parentNode;
    for (var i = 0; i < parentNode.childNodes.length; i++) {
        if (parentNode.childNodes[i].nodeName == "LI" && parentNode.childNodes[i].firstChild.nextSibling.hasClass("active")) {
            parentNode.childNodes[i].firstChild.nextSibling.removeClass("active");
            break;
        }
    }
    e.target.addClass("active");

    if (text != "All") {
        //filter the schedule based on selected dayName
        for (var j = 0; j < allTableRows.length; j++) {
            if (allTableRows[j].nodeName == "TR") {
                var allRowCells = allTableRows[j].childNodes;
                if (allRowCells[1].innerText != text) {
                    //hide all unrelative rows
                    allTableRows[j].addClass("hideRow");
                }
            }
        }
    }
}


function addTime(select) {
    //populate a time every 15min, starting from 00:00 am
    var date = new Date('January 1, 1970 00:00:00 UTC');
    var time = "0" + date.getUTCHours() + ":0" + date.getUTCMinutes();
    select.add(new Element('option', { text: time, value: time }), null);
    date.setUTCMinutes(date.getUTCMinutes() + 15);

    while (date.getUTCHours() != 0 || date.getUTCMinutes() != 0) {
        if (date.getUTCHours() < 10 && date.getUTCHours() >= 0 && date.getUTCMinutes() < 10 && date.getUTCMinutes() >= 0) {
            time = "0" + date.getUTCHours() + ":0" + date.getUTCMinutes();
        } else if (date.getUTCHours() < 10 && date.getUTCHours() >= 0) {
            time = "0" + date.getUTCHours() + ":" + date.getUTCMinutes();
        } else if (date.getUTCMinutes() < 10 && date.getUTCMinutes() >= 0) {
            time = date.getUTCHours() + ":0" + date.getUTCMinutes();
        } else {
            time = date.getUTCHours() + ":" + date.getUTCMinutes();
        }
        select.add(new Element('option', { text: time, value: time }), null);
        date.setUTCMinutes(date.getUTCMinutes() + 15);
    }
}


function handleOnclickRemoveButtons(e) {
    e.preventDefault();
    if (e.target.innerText == "Remove") {
        e.target.innerText = "Confirm";
        setTimeout(() => {
            //change back to remove button if idle time detected
            e.target.innerText = "Remove";
        }, 2000);
    } else if (e.target.innerText == "Confirm") {
        //confirm the delete action
        //remove the stale contents
        document.getElementById('schedulelogbody').empty();
        document.getElementById('scheduletablebody').empty();

        //hide the visual schedule section
        document.getElementById('addsingletimeslotdiv').addClass('hideRow');
        document.getElementById('scheduleviewmessage').addClass('hideRow');
        document.getElementById('scheduletitlediv').addClass('hideRow');
        document.getElementById('scheduledescriptiondiv').addClass('hideRow');
        document.getElementById('scheduletablelogdiv').addClass('hideRow');
        document.getElementById('scheduletablediv').addClass('hideRow');
        document.getElementById('scheduleupdatebuttondiv').addClass('hideRow');
        document.getElementById('scheduleactiondiv').addClass('hideRow');

        //show the selection (buttons)
        document.getElementById('scheduleactiondiv').removeClass('hideRow');

        //get the schedule object id
        var id = e.target.id;
        var scheduleId = id.split("_")[1].split("=")[1];

        var request = new Request.JSON({
            url: "remove-schedule",
            onSuccess: function (resJson) {
                //remove the slot in the table if succeeds
                if (resJson.deleted) {
                    e.target.parentNode.parentNode.dispose();
                } else {
                    console.log("failed to delete the chosen schedule");
                }
            },
            onFailure: function (resJson) {
                console.log("failed to delete the chosen schedule");
            }
        });
        request.get({
            scheduleid: scheduleId
        });
    }
}




function handleOnclickViewButtons(e) {
    e.preventDefault();

    //remove the stale contents
    document.getElementById('schedulelogbody').empty();
    document.getElementById('scheduletablebody').empty();

    //get the schedule object id
    var id = e.target.id;
    var scheduleId = id.split("_")[1].split("=")[1];

    //associate the update button with the schedule object id
    document.getElementById('updateschedulebutton').name = scheduleId;
    document.getElementById('addsingletimeslotbutton').name = scheduleId;
    document.getElementById('viewselectedschedulebutton').name = scheduleId;

    //show the buttons
    document.getElementById('viewselectedschedulebutton').disabled = false;
    document.getElementById('addsingletimeslotbutton').disabled = false;

    //hide the visual schedule section
    document.getElementById('addsingletimeslotdiv').addClass('hideRow');
    document.getElementById('scheduleviewmessage').addClass('hideRow');
    document.getElementById('scheduletitlediv').addClass('hideRow');
    document.getElementById('scheduledescriptiondiv').addClass('hideRow');
    document.getElementById('scheduletablelogdiv').addClass('hideRow');
    document.getElementById('scheduletablediv').addClass('hideRow');
    document.getElementById('scheduleupdatebuttondiv').addClass('hideRow');
    document.getElementById('scheduleactiondiv').addClass('hideRow');

    //show the selection (buttons)
    document.getElementById('scheduleactiondiv').removeClass('hideRow');

    var request = new Request.JSON({
        url: "view-schedule",
        onSuccess: showSchedule,
    });
    request.get({
        scheduleid: scheduleId
    });
}

document.body.onload = handlePageOnload();
function handlePageOnload() {
    var tbody = document.getElementById('selectscheduletablebody');
    var viewButtonsList = tbody.querySelectorAll("button[class='btn btn-success']");
    var removeButtonsList = tbody.querySelectorAll("button[class='btn btn-danger']");
    for (var i = 0; i < viewButtonsList.length; i++) {
        viewButtonsList[i].addEventListener("click", handleOnclickViewButtons);
        removeButtonsList[i].addEventListener("click", handleOnclickRemoveButtons);
    }
    //add the time options to the selection boxes
    addTime(document.getElementById('addsingletimeslotselectstarttime'));
    addTime(document.getElementById('addsingletimeslotselectendtime'));

    //register the schedule action buttons
    document.getElementById('addsingletimeslotbutton').addEventListener('click', handleOnclickAddSingleTimeSlotButton);
    document.getElementById('viewselectedschedulebutton').addEventListener('click', handleOnclickViewScheduleButton);
    document.getElementById('addsingletimeslotvalidatebutton').addEventListener('click', handleOnclickAddSingleTimeSlotUpdate);
}


function handleOnclickAddSingleTimeSlotButton(e) {
    e.preventDefault();
    //disable the other button
    document.getElementById('viewselectedschedulebutton').disabled = true;

    document.getElementById('addsingletimeslotdiv').removeClass('hideRow');
}



function handleOnclickViewScheduleButton(e) {
    e.preventDefault();
    //disable the other button
    document.getElementById('addsingletimeslotbutton').disabled = true;

    //show the schedule
    document.getElementById('scheduletitlediv').removeClass('hideRow');
    document.getElementById('scheduledescriptiondiv').removeClass('hideRow');
    document.getElementById('scheduletablelogdiv').removeClass('hideRow');
    document.getElementById('scheduletablediv').removeClass('hideRow');
    document.getElementById('scheduleupdatebuttondiv').removeClass('hideRow');
}



function handleOnclickAddSingleTimeSlotUpdate(e) {
    e.preventDefault();

    var dateString = document.getElementById('addsingletimeslotinputdate').value;
    var startTimeStr = document.getElementById('addsingletimeslotselectstarttime').options[document.getElementById('addsingletimeslotselectstarttime').selectedIndex].value;
    var endTimeStr = document.getElementById('addsingletimeslotselectendtime').options[document.getElementById('addsingletimeslotselectendtime').selectedIndex].value;
    var reg = /-/g;
    var dateStr = dateString.replace(reg, "/");
    var startDate = new Date(dateStr + " " + startTimeStr + ":00");
    var endDate = new Date(dateStr + " " + endTimeStr + ":00");

    //validation
    //startDate before the current time
    if (startDate.getTime() <= Date.now()) {
        console.log("starting date/time must be in advance of current date/time");
        return;
    }
    //endDate before startDate
    if (startDate.getTime() >= endDate.getTime()) {
        console.log("ending date/time must be after the starting date/time");
        return;
    }

    //overlappins with original schedule
    var scheduleId = document.getElementById('addsingletimeslotbutton').name;
    if (hasScheduleConflicts(scheduleId, [startDate, endDate])) {
        console.log("schedule conflict, please select another session");
        return;
    }

    //change the button to disable clicking
    e.target.disabled = true;
    //show loading and let the user wait for the upload
    e.target.innerText = "Wait";
    e.target.adopt(new Element('i', { class: "fa fa-refresh fa-spin" }));

    //update the schedule
    var request = new Request({
        url: "view",
        onSuccess: function (resText) {
            e.target.empty();
            e.target.innerText = "Success";
            //refresh the page
            setTimeout(() => {
                window.location.href = "/instructor/dashboard/schedule/view";
            }, 1500);
        }
    });
    request.post({
        scheduleid: scheduleId,
        newtimeslot: JSON.stringify([startDate, endDate])
    });
}


function hasScheduleConflicts(scheduleId, startToEnd) {
    var conflict = false;
    var scheduleArray = filteredScheduleArray;
    for (var i = 0; i < scheduleArray.length; i++) {
        var original = [new Date(scheduleArray[i][0]), new Date(scheduleArray[i][1])];
        if ((startToEnd[0].getTime() >= original[0].getTime() && startToEnd[0].getTime() < original[1].getTime()) && (startToEnd[1].getTime() >= original[0].getTime() && startToEnd[1].getTime() <= original[1].getTime())) {
            //the new schedule all in the original schedule
            conflict = true;
            break;
        } else if ((startToEnd[0].getTime() < original[0].getTime() && (startToEnd[1].getTime() <= original[1].getTime() && startToEnd[1].getTime() > original[0].getTime()))) {
            //the new schedule's bottom half in the original schedule
            conflict = true;
            break;
        } else if ((startToEnd[1].getTime() > original[1].getTime() && (startToEnd[0].getTime() >= original[0].getTime() && startToEnd[0].getTime() < original[1].getTime()))) {
            //the new schedule's upper half in the original schedule
            conflict = true;
            break;
        } else if (startToEnd[0].getTime() < original[0].getTime() && startToEnd[1].getTime() > original[1].getTime()) {
            //the original schedule is part of the new schedule
            conflict = true;
            break;
        }
    }
    return conflict;
}


function isScheduleValidated() {
    //validate the schedule title is empty
    if (isTextFieldEmpty(document.getElementById('scheduletitle'))) {
        return false;
    }
    //validate the schedule description is empty
    if (isTextFieldEmpty(document.getElementById('scheduledescription'))) {
        return false;
    }
    //validate if no sessions is make
    var scheduleList = serializeAllCreatedSchedule();
    if (scheduleList.length <= 0) {
        return false;
    }

    return true;
}

function isTextFieldEmpty(elem) {
    if (elem.value == "") {
        return true;
    } else {
        return false;
    }
}

document.getElementById('updateschedulebutton').addEventListener('click', handleUploadSchedule);
function handleUploadSchedule(e) {
    e.preventDefault();
    //validation
    if (!isScheduleValidated()) {
        console.log("validation failed");
        return;
    }

    //change the button to disable clicking
    e.target.disabled = true;

    //show loading and let the user wait for the upload
    e.target.innerText = "Wait";
    e.target.adopt(new Element('i', { class: "fa fa-refresh fa-spin" }));

    //send ajax to server to save the record
    var request = new Request({
        url: "view",
        contentType: 'application/json',
        onSuccess: function (resText) {
            e.target.empty();
            e.target.innerText = "Success";
            //refresh the page
            setTimeout(() => {
                window.location.href = "/instructor/dashboard/schedule/view";
            }, 1500);
        },
        onFailure: function (resText) {
            e.target.empty();
            e.target.innerText = "Failed to upload";
            e.target.disabled = false;
            console.log("Error: " + resText);
        }
    });
    request.post({
        scheduleId: e.target.name,
        scheduletitle: document.getElementById('scheduletitle').value,
        scheduledescription: document.getElementById('scheduledescription').value,
        schedulearray: JSON.stringify(serializeAllCreatedSchedule())
    });
}



