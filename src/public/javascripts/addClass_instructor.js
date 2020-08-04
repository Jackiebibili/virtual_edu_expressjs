NUM_WEEKS = 0;
NUM_15MINS = 0;
START_TIME = null;
END_TIME = null;
function addRowsToCalendar() {
    //get the starting and ending dates
    var reg = /-/g;
    var start = document.getElementById("classstartday").value;
    start = start.replace(reg, "/");
    var end = document.getElementById("classendday").value;
    end = end.replace(reg, "/");
    var startDate = new Date(start);
    var endDate = new Date(end);

    //get the starting and ending day of the week
    var startDay = startDate.getDay();
    var endDay = endDate.getDay();
    //# of full weeks
    var time_diff = endDate.getTime() - startDate.getTime();
    var numDays = Math.trunc(time_diff / (1000*60*60*24)) + 1;
    var numWeeks = Math.trunc((numDays - (8 - startDay + endDay)) / 7);

    //get the selected options
    var selectedOptions = [-1, -1, -1, -1, -1, -1, -1];
    var options = document.getElementById('classdayschedule').options;
    for(var i = 0; i < options.length; i++) {
        if(options[i].selected) {
            selectedOptions[options[i].value] = 1;
        }
    }

    //markup the days when the instructors will have class
    //mark the first week
    var pass = true;
    for(var i = 0; i < selectedOptions.length; i++) {
        if(selectedOptions[i] != -1 && i >= startDay) {
            pass = false;
            break;
        }
    }
    //need to mark the first week
    var weekNumber = 1;
    var lowerDateObj = new Date(start);
    var upperDateObj = new Date(start);
    //initialize the schedule grid
    var row = 0, col = 0;
    //Lower date is the date on every Sunday (the start of the week)
    //Upper date is the date on every Saturday (the end of the week)
    lowerDateObj.setDate(lowerDateObj.getDate() - startDay);
    upperDateObj.setDate(upperDateObj.getDate() + 6 - startDay);
    if(!pass) {
        var firstWeek = [];
        var hrefId = (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "/" + lowerDateObj.getFullYear() + "-" + (upperDateObj.getMonth() + 1) + "/" + upperDateObj.getDate() + "/" + upperDateObj.getFullYear();
        var datePrompt = "Week " + weekNumber + " (" + (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "--" + (upperDateObj.getMonth() + 1) + "/" + upperDateObj.getDate() + ")";
        //firstWeek.push(new Element('th', {scope:"row", text:datePrompt}));
        firstWeek.push(new Element('th', {scope:"row"}).adopt(new Element('a', {text: datePrompt, href:"#" + hrefId, id:"week" + weekNumber++ + "link"})));

        for(var i = 0; i < 7; i++) {
            if(selectedOptions[i] != -1 && i >= startDay) {
                firstWeek.push(new Element('td', {id:"loc=" + row + "$" + col++, class:"tdcss"}).adopt(new Element("div", {draggable:"true"}).adopt(new Element('img', {src:"/static/images/instructorDayScheduleIsNotSetBnt.svg", height:"16", width:"16", draggable:"false"})))); 
            } else if(i < startDay) {
                firstWeek.push(new Element('td', {id:"loc=" + row + "$" + col++, class:"tdcss"}).adopt(new Element('img', {src:"/static/images/notApplicableBnt.svg", height:"16", width:"16", draggable:"false"})));
            } else {
                firstWeek.push(new Element('td', {id:"loc=" + row + "$" + col++, class:"tdcss"}).adopt(new Element('div', {draggable:"true"}).adopt(new Element('img', {src:"/static/images/instructorAddOtherDayBnt.svg", height:"16", width:"16", draggable:"false"}))));
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
    for(var i = 0; i< numWeeks; i++) {
        var singleWeekList = [];
        var datePrompt = "Week " + weekNumber + " (" + (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "--" + (upperDateObj.getMonth() + 1) + "/" + upperDateObj.getDate() + ")";
        var hrefId = (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "/" + lowerDateObj.getFullYear() + "-" + (upperDateObj.getMonth() + 1) + "/" + upperDateObj.getDate() + "/" + upperDateObj.getFullYear();
        singleWeekList.push(new Element('th', {scope:"row"}).adopt(new Element('a', {text: datePrompt, href:"#" + hrefId, id:"week" + weekNumber++ + "link"})));

        for(var j = 0; j < 7; j++) {
            if(selectedOptions[j] != -1) {
                //on the jth day of the week, the instructor has a class
                singleWeekList.push(new Element('td', {id:"loc=" + row + "$" + col++, class:"tdcss"}).adopt(new Element("div", {draggable:"true"}).adopt(new Element('img', {src:"/static/images/instructorDayScheduleIsNotSetBnt.svg", height:"16", width:"16", draggable:"false"}))));
            } else {
                singleWeekList.push(new Element('td', {id:"loc=" + row + "$" + col++, class:"tdcss"}).adopt(new Element('div', {draggable:"true"}).adopt(new Element('img', {src:"/static/images/instructorAddOtherDayBnt.svg", height:"16", width:"16", draggable:"false"}))));
            }
        }
        col = 0;
        row++;
        document.getElementById('scheduletablebody').adopt(new Element('tr').adopt(singleWeekList));
        //increment the lower date and upper date for the next message
        lowerDateObj.setDate(lowerDateObj.getDate() + 7);
        upperDateObj.setDate(upperDateObj.getDate() + 7);
    }

    //markup the last week
    pass = true;
    for(var i = 0; i < selectedOptions.length; i++) {
        if(selectedOptions[i] != -1 && i <= endDay) {
            pass = false;
            break;
        }
    }
    //need to mark the last week
    if(!pass) {
        var lastWeek = [];
        var datePrompt = "Week " + weekNumber + " (" + (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "--" + (upperDateObj.getMonth() + 1)+ "/" + upperDateObj.getDate() + ")";
        var hrefId = (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "/" + lowerDateObj.getFullYear() + "-" + (upperDateObj.getMonth() + 1)+ "/" + upperDateObj.getDate() + "/" + upperDateObj.getFullYear();
        lastWeek.push(new Element('th', {scope:"row"}).adopt(new Element('a', {text: datePrompt, href:"#" + hrefId, id:"week" + weekNumber++ + "link"})));
        for(var i = 0; i < 7; i++) {
            if(selectedOptions[i] != -1 && i <= endDay) {
                lastWeek.push(new Element('td', {id:"loc=" + row + "$" + col++, class:"tdcss"}).adopt(new Element("div", {draggable:"true"}).adopt(new Element('img', {src:"/static/images/instructorDayScheduleIsNotSetBnt.svg", height:"16", width:"16", draggable:"false"}))));
            } else if(i > endDay) {
                lastWeek.push(new Element('td', {id:"loc=" + row + "$" + col++, class:"tdcss"}).adopt(new Element('img', {src:"/static/images/notApplicableBnt.svg", height:"16", width:"16", draggable:"false"})));
            } else {
                lastWeek.push(new Element('td', {id:"loc=" + row + "$" + col++, class:"tdcss"}).adopt(new Element('div', {draggable:"true"}).adopt(new Element('img', {src:"/static/images/instructorAddOtherDayBnt.svg", height:"16", width:"16", draggable:"false"}))));
            }
        }
        document.getElementById('scheduletablebody').adopt(new Element('tr').adopt(lastWeek));
    }
    //record the number of weeks (# of rows in monthly view)
    NUM_WEEKS = row + 1;
    //record the number of time slots (# of rows in weekly view)
    NUM_15MINS = getNumberOf15Mins();
    //get all empty schedule image elements
    var emptyScheduleList = document.querySelectorAll("img[src='/static/images/instructorDayScheduleIsNotSetBnt.svg']");
    //get all plus image elements
    var plusList = document.querySelectorAll("img[src='/static/images/instructorAddOtherDayBnt.svg']");

    //register the links for onclick
    for(var i = 1; i <= NUM_WEEKS; i++) {
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
    for(var i = 1; i <= NUM_WEEKS; i++) {
        var linkElem = document.getElementById("week" + i + "link");
        addWeekTimeSchedule(linkElem);
    }
}


document.getElementById('generateschedulebutton').addEventListener("click", handleOnclickGenerateSchedule);

function handleOnclickGenerateSchedule(e) {
    e.preventDefault();
    e.target.disabled = true;
    addRowsToCalendar();
}

document.body.onload = addDayScheduleOptions();

function handleDisplaySingleDaySchedule(e) {
    var tdElem = e.target.parentNode.parentNode;
    var day = Number(tdElem.id.slice(tdElem.id.indexOf("$") + 1));
    var weekNumber = Number(tdElem.id.slice(4, tdElem.id.indexOf("$")));
    emphasizeSelectedDay(weekNumber + 1, day + 1);
}

function addTime(select) {
    //populate a time every 15min, starting from 00:00 am
    var date = new Date('January 1, 1970 00:00:00 UTC');
    var time = "0" + date.getUTCHours() + ":0" + date.getUTCMinutes();
    select.add(new Element('option', {text:time, value:time}), null);
    date.setUTCMinutes(date.getUTCMinutes() + 15);

    while(date.getUTCHours() != 0 || date.getUTCMinutes() != 0) {
        if(date.getUTCHours() < 10 && date.getUTCHours() >= 0 && date.getUTCMinutes() < 10 && date.getUTCMinutes() >= 0) {
            time = "0" + date.getUTCHours() + ":0" + date.getUTCMinutes();
        } else if(date.getUTCHours() < 10 && date.getUTCHours() >= 0) {
            time = "0" + date.getUTCHours() + ":" + date.getUTCMinutes();
        } else if(date.getUTCMinutes() < 10 && date.getUTCMinutes() >= 0) {
            time = date.getUTCHours() + ":0" + date.getUTCMinutes();
        } else {
            time = date.getUTCHours() + ":" + date.getUTCMinutes();
        }
        select.add(new Element('option', {text:time, value:time}), null);
        date.setUTCMinutes(date.getUTCMinutes() + 15);
    }
}

function addTimeInRange(select) {
    //populate a time every 15min
    var date = new Date(START_TIME.toUTCString());
    var time = "";
    while(date.getUTCHours() != END_TIME.getUTCHours() || date.getUTCMinutes() != END_TIME.getUTCMinutes()) {
        if(date.getUTCHours() < 10 && date.getUTCHours() >= 0 && date.getUTCMinutes() < 10 && date.getUTCMinutes() >= 0) {
            time = "0" + date.getUTCHours() + ":0" + date.getUTCMinutes();
        } else if(date.getUTCHours() < 10 && date.getUTCHours() >= 0) {
            time = "0" + date.getUTCHours() + ":" + date.getUTCMinutes();
        } else if(date.getUTCMinutes() < 10 && date.getUTCMinutes() >= 0) {
            time = date.getUTCHours() + ":0" + date.getUTCMinutes();
        } else {
            time = date.getUTCHours() + ":" + date.getUTCMinutes();
        }
        select.add(new Element('option', {text:time, value:time}), null);
        date.setUTCMinutes(date.getUTCMinutes() + 15);
    }
    //for the last time slot
    if(date.getUTCHours() < 10 && date.getUTCHours() >= 0 && date.getUTCMinutes() < 10 && date.getUTCMinutes() >= 0) {
        time = "0" + date.getUTCHours() + ":0" + date.getUTCMinutes();
    } else if(date.getUTCHours() < 10 && date.getUTCHours() >= 0) {
        time = "0" + date.getUTCHours() + ":" + date.getUTCMinutes();
    } else if(date.getUTCMinutes() < 10 && date.getUTCMinutes() >= 0) {
        time = date.getUTCHours() + ":0" + date.getUTCMinutes();
    } else {
        time = date.getUTCHours() + ":" + date.getUTCMinutes();
    }
    select.add(new Element('option', {text:time, value:time}), null);
}


function addDays(select) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    daysList.forEach(day => {
        select.add(new Element('option', {value: day, text: day}), null);
    });
}

function addDayScheduleOptions() {
    var select = document.getElementById('instructordayschedulestartsat');
    addTime(select);
    select = document.getElementById('instructordayscheduleendsat');
    addTime(select);
}


function addWeekScheduleOptionsIframe() {
    for(var i = 1; i <= NUM_WEEKS; i++) {
        var iframe = document.getElementById("week" + i + "iframe");
        //add options to day selection box
        var select = iframe.contentWindow.document.getElementById('classscheduleday');
        if(select.options.length == 0) {
            addDays(select);
        }
        select = iframe.contentWindow.document.getElementById("classschedulestartsat");
        if(select.options.length == 0) {
            addTimeInRange(select);
        }
        select = iframe.contentWindow.document.getElementById("classscheduleendsat");
        if(select.options.length == 0) {
            addTimeInRange(select);
        }
    }
}

document.getElementById("classendday").addEventListener("blur", handleDateScheduleDuration);
function handleDateScheduleDuration(e) {
    //get the starting and ending dates
    var reg = /-/g;
    var start = document.getElementById("classstartday").value;
    start = start.replace(reg, "/");
    var end = document.getElementById("classendday").value;
    end = end.replace(reg, "/");
    var startDate = new Date(start);
    var endDate = new Date(end);
    
    //# of full weeks
    var time_diff = endDate.getTime() - startDate.getTime();
    var numDays = Math.trunc(time_diff / (1000*60*60*24)) + 1;
    var numWeeks = Math.ceil(numDays / 7);
    document.getElementById('classoverallduration').value = numDays + " days (" + numWeeks + " weeks)";
}

document.getElementById('instructordayscheduleendsat').addEventListener("blur", handleDayScheduleDuration);
function handleDayScheduleDuration(e) {
    var startTime = document.getElementById('instructordayschedulestartsat').options[document.getElementById('instructordayschedulestartsat').selectedIndex].value;
    var endTime = document.getElementById('instructordayscheduleendsat').options[document.getElementById('instructordayscheduleendsat').selectedIndex].value;
    var startHrs = Number(startTime.split(":")[0]);
    var startMins = Number(startTime.split(":")[1]);
    var endHrs = Number(endTime.split(":")[0]);
    var endMins = Number(endTime.split(":")[1]);
    var duration = endHrs * 60 + endMins - startHrs * 60 - startMins;
    if(startTime == "00:00" && endTime =="00:00") {
        document.getElementById('scheduledurationinhours').value = "";
    } else if (duration <= 0) {
        document.getElementById('scheduledurationinhours').value = "";
    } else {
        document.getElementById('scheduledurationinhours').value = Math.trunc(duration / 60) + "h " + (duration % 60) + "min";
    }
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


function getAllCreatedSchedule(iframe) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var sessionsList = [];
    for(var col = 1; col <= 7; col++) {
        var startTime = "";
        var endTime = "";
        var keep = false;
        var identifier = "";
        for(var row = 0; row < NUM_15MINS; row++) {
            var id = "pos=" + row + "$" + col;
            var tdElem = iframe.contentWindow.document.getElementById(id);
            var theadId = tdElem.parentNode.firstChild.id;
            if(tdElem.firstChild) {
                var imgElem = tdElem.firstChild;
                var theadId = tdElem.parentNode.firstChild.id;
                if(!keep) {
                    //a time session starts here
                    keep = true;
                    identifier = imgElem.alt;
                    startTime = theadId.split("=")[1];
                } else if(keep && identifier == imgElem.alt) {
                    //a time session continues
                    endTime = theadId.split("=")[1];
                } else if(keep && identifier != imgElem.alt) {
                    //a time session ends here
                    keep = true;
                    identifier = imgElem.alt;
                    endTime = theadId.split("=")[1];
                    sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime);
                    startTime = endTime;
                    endTime = "";
                }    
            } else {
                //empty slot or a time session may end here
                if(keep) {
                    keep = false;
                    endTime = theadId.split("=")[1];
                    sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime);
                    startTime = "";
                    endTime = "";
                }
            }
        }
    }
    return sessionsList;
}

function handleClearATimeSession(e) {
    var insideIframe = e.target.alt.split("_")[0];
    var iframeName = e.target.alt.split("_")[1];
    var iframe = document.getElementById('week' + iframeName.slice(6) + 'iframe');
    var identifier = insideIframe.slice(0, insideIframe.indexOf("$"));
    var row = Number(identifier.slice(1));
    var col = Number(insideIframe.slice(insideIframe.indexOf("$") + 1));
    var tdElem = iframe.contentWindow.document.getElementById('pos=' + row++ + "$" + col);
    while(tdElem.firstChild && tdElem.firstChild.alt == identifier) {
        tdElem.empty();
        tdElem.style = "";
        tdElem = iframe.contentWindow.document.getElementById('pos=' + row++ + "$" + col);
    }

    //clear the row in the log table
    removeScheduleLog(iframe);
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
    var tdElem = iframe.contentWindow.document.getElementById('pos=' + row++ + "$" + col);
    while(tdElem.firstChild && tdElem.firstChild.alt == identifier) {
        tdElem.empty();
        tdElem.style = "";
        tdElem = iframe.contentWindow.document.getElementById('pos=' + row++ + "$" + col);
    }
    //clear the corresponding row of logs
    e.target.parentNode.parentNode.dispose();
}

function splitSavedSchedule(s) {
    //s = DAYSTRING_STARTTIME-ENDTIME
    var dayName = s.split("_")[0];
    var timeRange = s.split("_")[1];
    var startTime = timeRange.split("-")[0];
    var endTime = timeRange.split("-")[1];
    return [dayName, startTime, endTime];
}

function getHrsAndMins(time) {
    var hrs = Number(time.split(":")[0]);
    var mins = Number(time.split(":")[1]);
    return [hrs, mins];
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

//can only be called in the iframe
function canAddNewTimeSchedule(s, list, iframe) {
    var arrayToInsert = getStartAndEndTotalMins(s);
    var dayName = arrayToInsert[0];
    var startTime = arrayToInsert[1];
    var endTime = arrayToInsert[2];
    for(var i = 0; i < list.length; i++) {
        var scheduleItems = getStartAndEndTotalMins(list[i]);
        //schedules conflict
        if(scheduleItems[0] == dayName && ((startTime >= scheduleItems[1] && startTime < scheduleItems[2]) || (endTime >= scheduleItems[1] && endTime <= scheduleItems[2]))) {
            return [false, ""];
        }
    }
    var hrs = Math.trunc((endTime - startTime) / 60);
    var mins = (endTime - startTime) % 60;
    var lasts = hrs + "h " + mins + "min";
    iframe.contentWindow.document.getElementById('classsessionduration').value = lasts;
    return [true, lasts];
}


function serializeAllCreatedSchedule() {
    var schedulesList = [];
    for(var i = 1; i <= NUM_WEEKS; i++) {
        var iframe = document.getElementById('week' + i + 'iframe');
        var iframeSchedulesList = getStartAndEndDateTime(iframe);
        iframeSchedulesList.forEach(item => {
            schedulesList.push(item);
        });
    }
    return schedulesList;
}

function getStartAndEndDateTime(iframe) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var schedulesList = [];
    var weekNumber = iframe.id.slice(4, iframe.id.length - 6);
    var dateDur = document.getElementById('week' + weekNumber + 'link').href;
    var dateStr = dateDur.split("#")[1];
    var weekSchedulesList = getAllCreatedSchedule(iframe);
    for(var k = 0; k < weekSchedulesList.length; k++) {
        var startDate = new Date(dateStr.split("-")[0]);
        var endDate = new Date(dateStr.split("-")[0]);    
        var arrayToInsert = getStartAndEndNumbers(weekSchedulesList[k]);
        var dayName = arrayToInsert[0];
        var startHrs = arrayToInsert[1];
        var startMin = arrayToInsert[2];
        var endHrs = arrayToInsert[3];
        var endMin = arrayToInsert[4]; 
        var dayNumber;
        for(var j = 0; j < daysList.length; j++) {
            if(dayName == daysList[j]) {
                dayNumber = j;
                break;
            }
        }
        startDate.setDate(startDate.getDate() + dayNumber);
        endDate.setDate(endDate.getDate() + dayNumber);
        startDate.setHours(startHrs, startMin);
        endDate.setHours(endHrs, endMin);
        schedulesList.push([startDate, endDate]);    
    }
    return schedulesList;
}

function getSingleTimeSchedule(weekNumber, str) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var dateDur = document.getElementById('week' + weekNumber + 'link').href;
    var dateStr = dateDur.split("#")[1];
    var startDate = new Date(dateStr.split("-")[0]);
    var endDate = new Date(dateStr.split("-")[0]);    
    var arrayToInsert = getStartAndEndNumbers(str);
    var dayName = arrayToInsert[0];
    var startHrs = arrayToInsert[1];
    var startMin = arrayToInsert[2];
    var endHrs = arrayToInsert[3];
    var endMin = arrayToInsert[4]; 
    var dayNumber;
    for(var j = 0; j < daysList.length; j++) {
        if(dayName == daysList[j]) {
            dayNumber = j;
            break;
        }
    }
    startDate.setDate(startDate.getDate() + dayNumber);
    endDate.setDate(endDate.getDate() + dayNumber);
    startDate.setHours(startHrs, startMin);
    endDate.setHours(endHrs, endMin);
    return [startDate, endDate];    
}


function displayCreatedScheduleInText(iframe, weekNumber, row, str, duration) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var list = getStartAndEndDateTime(iframe);
    //check delete items and keep a updated list
    for(var i = 0; i < list.length; i++) {
        var date = (list[i][0].getMonth() + 1) + "/" + list[i][0].getDate();
        var dayName = daysList[list[i][0].getDay()];
        var start = getTimeString(list[i][0]);
        var end = getTimeString(list[i][1]);
        var time = start + "-" + end;
        var startTime = getHrsAndMins(start);
        var endTime = getHrsAndMins(end);
        var durInMins = (endTime[0] - startTime[0]) * 60 + endTime[1] - startTime[1];
        var last = Math.trunc(durInMins / 60) + "h " + (durInMins % 60) + "min";
        //skip the element if it already exists in the table row
        var allTableRows = document.getElementById('schedulelogbody').childNodes;
        var pass = false;
        for(var j = 0; j < allTableRows.length; j++) {
            if(allTableRows[j].nodeName == "TR") {
                var allRowCells = allTableRows[j].childNodes;
                if(allRowCells[0].innerText == date && allRowCells[2].innerText == time) {
                    pass = true;
                    break;
                }
            }
        }
        if(pass) {
            continue;
        }
        var rowStrs = [date, dayName, time, last];
        //create row elements
        var elemsList = [];
        rowStrs.forEach(str => {
            elemsList.push(new Element('td', {text: str}));
        });

        //
        var thead = iframe.contentWindow.document.getElementById('thead:time=' + start);
        var nextNodeId = thead.nextSibling.id;
        var rowNumber = nextNodeId.slice(4, nextNodeId.indexOf("$"));
        var dayNum = daysList.indexOf(dayName) + 1;
        var removeLink = new Element('a', {id:"s" + rowNumber + "$" + dayNum + "_iframe" + weekNumber, href:"#", text:"remove"});
        elemsList.push(removeLink);
        var tableBody = document.getElementById('schedulelogbody');
        tableBody.adopt(new Element('tr').adopt(elemsList));
        removeLink.addEventListener("click", handleRemoveLink);
    }

    //add the newly inserted item
    var newTime = getSingleTimeSchedule(weekNumber, str);
    var rowStr = [(newTime[0].getMonth() + 1) + "/" + newTime[0].getDate(), daysList[newTime[0].getDay()], getTimeString(newTime[0]) + "-" + getTimeString(newTime[1]), duration];
    var addList = [];
    rowStr.forEach(str => {
        addList.push(new Element('td', {text: str}));
    });
    //id format s0$3_iframe1
    var dayNumber = daysList.indexOf(str.split("_")[0]) + 1;
    var removeLink = new Element('a', {id:"s" + row + "$" + dayNumber + "_iframe" + weekNumber, href:"#", text:"remove"});
    addList.push(new Element('label', {class:"form-control"}).adopt(removeLink));
    document.getElementById('schedulelogbody').adopt(new Element('tr').adopt(addList));
    removeLink.addEventListener("click", handleRemoveLink);
}

function getTimeString(date) {
    var time = "";
    if(date.getHours() < 10 && date.getHours() >= 0 && date.getMinutes() < 10 && date.getMinutes() >= 0) {
        time = "0" + date.getHours() + ":0" + date.getMinutes();
    } else if(date.getHours() < 10 && date.getHours() >= 0) {
        time = "0" + date.getHours() + ":" + date.getMinutes();
    } else if(date.getMinutes() < 10 && date.getMinutes() >= 0) {
        time = date.getHours() + ":0" + date.getMinutes();
    } else {
        time = date.getHours() + ":" + date.getMinutes();
    }
    return time;
}

handleAddTimeSlot.colorSelect = 0;
function handleAddTimeSlot(e) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var borderColorList = ["#DEB887", "#5F9EA0", "#D2691E", "#FF7F50", "#6495ED", "#FFF8DC", "#BDB76B", "#8B008B", "#556B2F", "#FF8C00",
                            "#FF1493", "#00BFFF", "#696969", "#228B22", "#4B0082"];   //15 different colors for border colors
    var weekNumber = Number(e.target.id.split("=")[1]);
    var iframe = document.getElementById('week' + weekNumber + 'iframe');
    var timeArr = getStartTimeAndDuration(iframe);
    var startTime = timeArr[0];
    var endTime = timeArr[2];
    var numSlots = Math.ceil(timeArr[1] / 15);
    var dayName = iframe.contentWindow.document.getElementById('classscheduleday').options[iframe.contentWindow.document.getElementById('classscheduleday').selectedIndex].value;
    var col;
    for(var i = 0; i < daysList.length; i++) {
        if(dayName == daysList[i]) {
            col = i + 1;
            break;
        }
    }
    //get all filled-in sessions
    var inputFormat = dayName + "_" + startTime + "-" + endTime;
    var sessionsList = getAllCreatedSchedule(iframe);
    var canAdd = canAddNewTimeSchedule(inputFormat, sessionsList, iframe);
    if(!canAdd[0]) {
        console.log("Schedules conflict: cannot add a new schedule");
        return;
    }
    var durationStr = canAdd[1];
    var str = dayName + "_" + startTime + "-" + endTime;
    var thead = iframe.contentWindow.document.getElementById('thead:time=' + startTime);
    var nextNodeId = thead.nextSibling.id;
    var row = nextNodeId.slice(4, nextNodeId.indexOf("$"));
    const identifier = row;
    displayCreatedScheduleInText(iframe, weekNumber, row, str, durationStr);
    for(var i = 0; i < numSlots; i++) {
        var td = iframe.contentWindow.document.getElementById("pos=" + row + "$" + col);
        td.innerText = "";
        if(i == 0) {
            td.adopt([new Element('img', {src:"/static/images/sessionDurationMarkBnt.svg", class:"abscenter", height:"10", width:"10", draggable:"false", alt:"s" + identifier}), new Element('img', {src:"/static/images/deleteScheduledSessionBtn.svg", class:"absright", height:"12", style:"cursor: pointer;", width:"12", draggable:"false", alt:"s" + identifier + "$" + col + "_iframe" + weekNumber})]);
            var deleteBtn = td.firstChild.nextSibling;
            deleteBtn.addEventListener("click", handleClearATimeSession);

            //the first cell in the column, up, left, and right sides colored
            td.setStyles({
                "border-top": "3px solid " + borderColorList[handleAddTimeSlot.colorSelect],
                "border-left": "3px solid " + borderColorList[handleAddTimeSlot.colorSelect],
                "border-right": "3px solid " + borderColorList[handleAddTimeSlot.colorSelect]
            });
        } else if(i == numSlots - 1) {
            td.adopt(new Element('img', {src:"/static/images/sessionDurationMarkBnt.svg", height:"10", width:"10", draggable:"false", alt:"s" + identifier}));
            var div_cell = td.firstChild;    

            //the last cell in the column, down, left and right sides colored
            td.setStyles({
                "border-bottom": "3px solid " + borderColorList[handleAddTimeSlot.colorSelect],
                "border-left": "3px solid " + borderColorList[handleAddTimeSlot.colorSelect],
                "border-right": "3px solid " + borderColorList[handleAddTimeSlot.colorSelect]
            });
        } else {
            td.adopt(new Element('img', {src:"/static/images/sessionDurationMarkBnt.svg", height:"10", width:"10", draggable:"false", alt:"s" + identifier}));
            var div_cell = td.firstChild;    

            //the cells in the middle of the column, only left and right sides colored
            td.setStyles({
                "border-left": "3px solid " + borderColorList[handleAddTimeSlot.colorSelect],
                "border-right": "3px solid " + borderColorList[handleAddTimeSlot.colorSelect]
            });
        }
        row++;
    }
    if(handleAddTimeSlot.colorSelect < borderColorList.length - 1) {
        handleAddTimeSlot.colorSelect++;
    } else {
        handleAddTimeSlot.colorSelect = 0;
    }

}

function removeScheduleLog(iframe) {
    var tableList = [];
    var scheduleList = [];
    //get all logged schedule time sessions
    var allTableRows = document.getElementById('schedulelogbody').childNodes;
    for(var j = 0; j < allTableRows.length; j++) {
        if(allTableRows[j].nodeName == "TR") {
            var allRowCells = allTableRows[j].childNodes;
            tableList.push([allRowCells[0].innerText, allRowCells[2].innerText, allRowCells[4].firstChild.id]);
        }
    }
    var list = getStartAndEndDateTime(iframe);

    //get all scheduled time sessions
    for(var i = 0; i < list.length; i++) {
        var date = (list[i][0].getMonth() + 1) + "/" + list[i][0].getDate();
        var start = getTimeString(list[i][0]);
        var end = getTimeString(list[i][1]);
        var time = start + "-" + end;
        scheduleList.push([date, time]);
    }

    for(var i = 0; i < tableList.length; i++) {
        var include = false;
        for(var j = 0 ; j < scheduleList.length; j++) {
            if(tableList[i][0] == scheduleList[j][0] && tableList[i][1] == scheduleList[j][1]) {
                //a match is found
                include = true;
                break;
            }
        }
        if(!include) {
            //none of a match if found, delete the row in the log table
            var removelink = document.getElementById(tableList[i][2]);
            removelink.parentNode.parentNode.dispose();
        }
    }
}


function handleChangingEmptyScheduleSign(e) {
    if(e.type == "mouseover") {
        e.target.src = "/static/images/instructorDayScheduleNotSetHover.svg";
    } else if(e.type =="mouseout") {
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

function getNumberOf15Mins() {
    var startIndex = document.getElementById('instructordayschedulestartsat').selectedIndex;
    var endIndex = document.getElementById('instructordayscheduleendsat').selectedIndex;
    var startTimeStr = document.getElementById('instructordayschedulestartsat').options[startIndex].value;
    var endTimeStr = document.getElementById('instructordayscheduleendsat').options[endIndex].value;
    var endHrs = Number(endTimeStr.split(":")[0]);
    var endMins = Number(endTimeStr.split(":")[1]);
    var startHrs = Number(startTimeStr.split(":")[0]);
    var startMins = Number(startTimeStr.split(":")[1]);
    return 1 + ((endHrs - startHrs) * 60 + (endMins - startMins)) / 15;
}

function addWeekScheduleTable() {
    var startIndex = document.getElementById('instructordayschedulestartsat').selectedIndex;
    var endIndex = document.getElementById('instructordayscheduleendsat').selectedIndex;
    var startTimeStr = document.getElementById('instructordayschedulestartsat').options[startIndex].value;
    var endTimeStr = document.getElementById('instructordayscheduleendsat').options[endIndex].value;
    var endHrs = Number(endTimeStr.split(":")[0]);
    var endMins = Number(endTimeStr.split(":")[1]);
    var dateIterator = new Date("January 1, 1970 " + startTimeStr + ":00 UTC");
    START_TIME = new Date("January 1, 1970 " + startTimeStr + ":00 UTC");
    END_TIME = new Date("January 1, 1970 " + endTimeStr + ":00 UTC");
    var time = "";
    var rowPos = 0;
    var colPos = 0;

    //add a iframe for time schedule
    var rowElems = [];
    //var iframeTbody = document.getElementById('weekscheduleiframe').contentWindow.document.getElementById("weekscheduletablebody");
    //var iframe = document.getElementById('weekscheduleiframe');

    while(dateIterator.getUTCHours() != endHrs || dateIterator.getUTCMinutes() != endMins) {
        var rowList = [];
        //for each row, get the time slot string
        if(dateIterator.getUTCHours() < 10 && dateIterator.getUTCHours() >= 0 && dateIterator.getUTCMinutes() < 10 && dateIterator.getUTCMinutes() >= 0) {
            time = "0" + dateIterator.getUTCHours() + ":0" + dateIterator.getUTCMinutes();
        } else if(dateIterator.getUTCHours() < 10 && dateIterator.getUTCHours() >= 0) {
            time = "0" + dateIterator.getUTCHours() + ":" + dateIterator.getUTCMinutes();
        } else if(dateIterator.getUTCMinutes() < 10 && dateIterator.getUTCMinutes() >= 0) {
            time = dateIterator.getUTCHours() + ":0" + dateIterator.getUTCMinutes();
        } else {
            time = dateIterator.getUTCHours() + ":" + dateIterator.getUTCMinutes();
        }
        rowList.push(new Element('th', {scope:"row", text: time, id:"thead:time=" + time, class:"thcss"}));
        colPos++;
        //iterate over the days in a week
        for(var i = 0; i < 7; i++) {
            rowList.push(new Element('td', {id:"pos=" + rowPos + "$" + colPos++, class:"tdcss"}));
        }
        rowElems.push(new Element('tr').adopt(rowList));
        rowPos++;
        colPos = 0;
        dateIterator.setUTCMinutes(dateIterator.getUTCMinutes() + 15);
    }

    //add the last row
    time = endTimeStr;
    var lastRowList = [];
    lastRowList.push(new Element('th', {scope:"row", text: time, id:"thead:time=" + time, class:"thcss"}));
    colPos++;
    for(var i = 0; i < 7; i++) {
        lastRowList.push(new Element('td', {id:"pos=" + rowPos + "$" + colPos++, class:"tdcss"}));
    }
    rowElems.push(new Element('tr').adopt(lastRowList));

    return rowElems;
}


function filterDisplayCreatedScheduleInText(dayName) {

}


function emphasizeSelectedDay(week, day) {
    //search by id. id format: pos=[row]$[col]
    var iframe = document.getElementById('week' + week + "iframe");

    //froze the day selection and set to the correct day
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var dayName = daysList[day - 1];
    var selectDayElem = iframe.contentWindow.document.getElementById('classscheduleday');
    for(var i = 0; i < selectDayElem.options.length; i++) {
        if(selectDayElem.options[i].value == dayName) {
            selectDayElem.options[i].selected = "selected";
            selectDayElem.disabled= true;
            break;
        }
    }

    //for the first row thead: search for the ids
    for(var i = 1; i < 8; i++) {
        var id = "thead=" + i;
        if(i == day) {
            //set the style to ""
            iframe.contentWindow.document.getElementById(id).removeClass("hideRow");
        } else {
            //set the style to display none
            iframe.contentWindow.document.getElementById(id).addClass("hideRow");

        }
    }
    iframe.contentWindow.document.getElementById("thead=" + day).colspan = "7";
    
    for(var i = 0; i < NUM_15MINS; i++) {
        //for each row, search for the ids
        var id = "";
        for(var j = 1; j < 8; j++) {
            id = "pos=" + i + "$" + j;
            if(j == day) {
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

function undoEmphasisDay(week) {
    var iframe = document.getElementById('week' + week + "iframe");
    //for the first row thead: search for the ids
    for(var i = 1; i < 8; i++) {
        var id = "thead=" + i;
        //set the style to ""
        iframe.contentWindow.document.getElementById(id).removeClass("hideRow");
        iframe.contentWindow.document.getElementById(id).colspan = "1";
    }
    
    for(var i = 0; i < NUM_15MINS; i++) {
        //for each row, search for the ids
        var id = "";
        for(var j = 1; j < 8; j++) {
            id = "pos=" + i + "$" + j;
            //set style to ""
            iframe.contentWindow.document.getElementById(id).removeClass("hideRow");
            iframe.contentWindow.document.getElementById(id).colspan = "1";
        }
    }
}

function addWeekTimeSchedule(a) {
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var weekNumber = Number(a.id.slice(4, a.id.length - 4));
    //add the week schedule iframe to the row below
    var tbody = document.getElementById('scheduletablebody');
    var nextRow = a.parentNode.parentNode.nextSibling;
    var rowElems = addWeekScheduleTable();
    var iframeRow = new Element('tr', {class:"hideRow"}).adopt(new Element('td', {colspan:"8"}).adopt(new Element('iframe', {id:"week" + weekNumber + "iframe", src:"/static/html/weekScheduleSetup.html", class:"container"}))); 
    if(nextRow) {
        tbody.insertBefore(iframeRow, nextRow);
    } else {
        tbody.adopt(iframeRow);
    }
    var iframe = document.getElementById("week" + weekNumber + "iframe");
    iframe.addEventListener('load', () => {
        iframe.contentWindow.document.getElementById('weekscheduletablebody').adopt(rowElems);
        addWeekScheduleOptionsIframe();
        iframe.contentWindow.document.getElementById('addtimeschedulebutton').addEventListener("click", handleAddTimeSlot);
        iframe.contentWindow.document.getElementById('addtimeschedulebutton').id = "addtimeschedulebutton" + "_iframe=" + weekNumber;
        //remove unreachable days from the selection box
        var notApplicableList = document.querySelectorAll("img[src='/static/images/notApplicableBnt.svg']");
        notApplicableList.forEach(imgElem => {
            var week = 1 + Number(imgElem.parentNode.id.slice(4, imgElem.parentNode.id.indexOf("$")));
            if(week == weekNumber) {
                var day = Number(imgElem.parentNode.id.slice(imgElem.parentNode.id.indexOf("$") + 1));
                var daySelect = document.getElementById('week' + week + 'iframe').contentWindow.document.getElementById('classscheduleday');
                var dayName = daysList[day];
                for(var i = 0; i < daySelect.options.length; i++) {
                    if(daySelect.options[i].value == dayName) {
                        daySelect.options[i] = null;
                        return;
                    }
                }
            }
        });
    });
}

function handleOnclickWeekSchedule(e) {
    e.preventDefault();
    var weekNumber = Number(e.target.id.slice(4, e.target.id.length - 4));
    undoEmphasisDay(weekNumber);
    var iframe = document.getElementById("week" + weekNumber + "iframe");
    var iframeRow = iframe.parentNode.parentNode;
    iframeRow.toggleClass("hideRow");
    if(!iframeRow.hasClass("hideRow")) {
        var daySelect = iframe.contentWindow.document.getElementById('classscheduleday');
        daySelect.disabled = false;
        daySelect.options[0].selected = "selected";
        //display the selection box for day in a week
        iframe.contentWindow.document.getElementById('classscheduleday').parentNode.removeClass('hideRow');
    }

    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
}

document.getElementById("validatebutton").addEventListener("click", handleOnclickValidateSchedule);
function handleOnclickValidateSchedule(e) {
    e.preventDefault();
    //validation
    if(!isScheduleValidated()) {
        console.log("validation failed");
        return;
    }

    //change the button to disable clicking
    e.target.disabled = true;

    //show loading and let the user wait for the upload
    e.target.innerText = "Wait";
    e.target.adopt(new Element('i', {class:"fa fa-refresh fa-spin"}));

    //send ajax to server to save the record
    var request = new Request({
        url: "create-schedule", //"/instructor/dashboard/create-schedule"
        contentType: 'application/json',
        onSuccess: function(resText) {
            e.target.empty();
            e.target.innerText = "Success";
            document.getElementById('html').innerHTML = resText;
        },
        onFailure: function(resText) {
            e.target.empty();
            e.target.innerText = "Failed to upload";
            e.target.disabled = false;
            console.log("Error: " + resText);
        }
    });
    request.post({
        scheduletitle: document.getElementById("scheduletitle").value,
        scheduledescription: document.getElementById("scheduledescription").value,
        schedulearray: JSON.stringify(serializeAllCreatedSchedule())
    });
}


function isScheduleValidated() {
    //validate the schedule title is empty
    if(!isTextFieldEmpty(document.getElementById('scheduletitle'))) {
        return false;
    }
    //validate the schedule description is empty
    if(!isTextFieldEmpty(document.getElementById('scheduledescription'))) {
        return false;
    }
    //validate if no sessions is make
    var scheduleList = serializeAllCreatedSchedule();
    if(scheduleList.length <= 0) {
        return false;
    }

    return true;
}

function isTextFieldEmpty(elem) {
    if(elem.value == "") {
        return false;
    } else {
        return true;
    }
}
