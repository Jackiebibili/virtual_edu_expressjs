var startDate;
var endDate;
var NUM_WEEKS = 0;
var NUM_15MINS = 0;
var START_TIME = null, END_TIME = null;
var filteredScheduleArray = [];
borderColorList = ["#DEB887", "#5F9EA0", "#D2691E", "#FF7F50", "#6495ED", "#FFF8DC", "#BDB76B", "#8B008B", "#556B2F", "#FF8C00",
   "#FF1493", "#00BFFF", "#696969", "#228B22", "#4B0082"];   //15 different colors for border colors

function showSchedule(resJson) {
   filteredScheduleArray = resJson.courses;
   startDate = new Date();
   startDate.setHours(0, 0, 0);
   //sort the schedule in ascending order
   filteredScheduleArray.sort((a, b) => new Date(a.sessioninterval[0]).getTime() - new Date(b.sessioninterval[0]).getTime());

   //get today's course schedule
   var todayCourseScheduleList = [];
   var now = new Date();
   var endOfToday = new Date();
   endOfToday.setDate(endOfToday.getDate() + 1);
   endOfToday.setHours(0, 0, 0, 0);

   for (var i = 0; i < filteredScheduleArray.length; i++) {
      var temp = new Date(filteredScheduleArray[i].sessioninterval[0]);
      if (temp.getTime() > now.getTime() && temp.getTime() <= endOfToday.getTime()) {
         todayCourseScheduleList.push(filteredScheduleArray[i]);
      }
   }
   //show the today's courses in the today's focus table
   displayTodayScheduleInText(todayCourseScheduleList, now);

   //show the day course schedule logs table
   if (!displayScheduleLogTable()) {
      //none of courses has been created
      return;
   }


   //get the end date
   var minDate = new Date(filteredScheduleArray[0].sessioninterval[0]);
   endDate = new Date(filteredScheduleArray[0].sessioninterval[1]);
   for (var i = 0; i < filteredScheduleArray.length; i++) {
      var temp2 = new Date(filteredScheduleArray[i].sessioninterval[1]);
      if (temp2.getTime() > endDate.getTime()) {
         endDate = temp2;
      }
      var temp1 = new Date(filteredScheduleArray[i].sessioninterval[0]);
      if (temp1.getTime() < minDate.getTime()) {
         minDate = temp1;
      }
   }
   endDate.setHours(0, 0, 0);
   //adjust the startDate to minDate if the minDate is in advance of today
   minDate.setHours(0, 0, 0);
   if (minDate.getTime() > startDate.getTime()) {
      startDate = minDate;
   }

   //get the earliest start time in the schedule to be row 0
   var minTime = new Date(filteredScheduleArray[0].sessioninterval[0]);
   var maxTime = new Date(filteredScheduleArray[0].sessioninterval[1]);
   for (var i = 0; i < filteredScheduleArray.length; i++) {
      //check cross-day or -week schedule input, if so, schedule layout spanss 24h automatically
      var tempStart = new Date(filteredScheduleArray[i].sessioninterval[0]);
      var tempEnd = new Date(filteredScheduleArray[i].sessioninterval[1]);
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
            firstWeek.push(new Element('td', { id: "loc=" + row + "$" + col++, class: "tdcss" }).adopt(new Element("div", { draggable: "true" }).adopt(new Element('img', { src: "/static/images/instructorDayScheduleIsNotSetBnt.svg", height: "16", width: "16", draggable: "false" }))));
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
            singleWeekList.push(new Element('td', { id: "loc=" + row + "$" + col++, class: "tdcss" }).adopt(new Element("div", { draggable: "true" }).adopt(new Element('img', { src: "/static/images/instructorDayScheduleIsNotSetBnt.svg", height: "16", width: "16", draggable: "false" }))));
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
         //need to mark the last week
         if (true) {
            var lastWeek = [];
            var datePrompt = "Week " + weekNumber + " (" + (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "--" + (upperDateObj.getMonth() + 1) + "/" + upperDateObj.getDate() + ")";
            var hrefId = (lowerDateObj.getMonth() + 1) + "/" + lowerDateObj.getDate() + "/" + lowerDateObj.getFullYear() + "-" + (upperDateObj.getMonth() + 1) + "/" + upperDateObj.getDate() + "/" + upperDateObj.getFullYear();
            lastWeek.push(new Element('th', { scope: "row" }).adopt(new Element('a', { text: datePrompt, href: "#" + hrefId, id: "week" + weekNumber++ + "link" })));
            for (var i = 0; i < 7; i++) {
               lastWeek.push(new Element('td', { id: "loc=" + row + "$" + col++, class: "tdcss" }).adopt(new Element("div", { draggable: "true" }).adopt(new Element('img', { src: "/static/images/instructorDayScheduleIsNotSetBnt.svg", height: "16", width: "16", draggable: "false" }))));
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
      var iframeRow = new Element('tr', { class: "hideRow" }).adopt(new Element('td', { colspan: "8" }).adopt(new Element('iframe', { id: "week" + weekNumber + "iframe", src: "/static/html/weekCourseScheduleView.html", class: "container" })));
      if (nextRow) {
         tbody.insertBefore(iframeRow, nextRow);
      } else {
         tbody.adopt(iframeRow);
      }
      var iframe = document.getElementById("week" + weekNumber + "iframe");
      iframe.addEventListener('load', () => {
         iframe.contentWindow.document.getElementById('weekscheduletablebody').adopt(rowElems);

         addWeekTimeSchedule(index + 1);
      });
   } else {
      //load complete
      //read and display the schedule

      for (var i = 0; i < filteredScheduleArray.length; i++) {
         var startToEnd = [new Date(filteredScheduleArray[i].sessioninterval[0]), new Date(filteredScheduleArray[i].sessioninterval[1])];
         var weekNumber = getSessionWeekNumber(startToEnd);
         var temp = getRowAndSlotsNumber(startToEnd);    //[iframe_ref, #slots, row, col]
         var iframe = document.getElementById("week" + weekNumber + "iframe");
         addVisualTimeSlot(iframe, temp[1], temp[0], temp[2] + 1);
      }
   }
}


function displayTodayScheduleInText(todayList, today) {
   var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
   var body = document.getElementById('todayschedulebody');
   var label = document.getElementById('todayschedulelabel');
   var msg = daysList[today.getDay()] + ", " + (today.getMonth() + 1) + "/" + today.getDate() + " | updated at " + getTimeString(today);
   label.adopt(new Element("i", { text: msg }));

   if (typeof todayList == "undefined" || todayList.length == 0) {
      //empty today's schedule, hide the table
      var msg = "You don't have any active courses TODAY. By creating a course on your dashboard, you can therefore view the course schedule.";
      document.getElementById('todayscheduletable').addClass("hideRow");
      //display a message
      var parent = document.getElementById('todayscheduleemptymsgdiv');
      var lowerBound;
      if (parent.firstChild.nodeType == 3) {
         lowerBound = parent.firstChild.nextSibling;
      } else {
         lowerBound = parent.firstChild;
      }
      parent.insertBefore(new Element("p", { text: msg }), lowerBound);
      parent.removeClass("hideRow");
      return;
   }

   for (var i = 0; i < todayList.length; i++) {
      var rowElems = [];
      var time = getTimeString(new Date(todayList[i].sessioninterval[0])) + "-" + getTimeString(new Date(todayList[i].sessioninterval[1]));
      rowElems.push(new Element("td", { text: time }));
      rowElems.push(new Element("td", { text: getDuration([new Date(todayList[i].sessioninterval[0]), new Date(todayList[i].sessioninterval[1])]) }));
      rowElems.push(new Element("td", { text: todayList[i].coursetitle }));
      rowElems.push(new Element("td", { text: todayList[i].enrollmentcap }));
      rowElems.push(new Element("td", { text: "" + todayList[i].sessioninterval[2].length }));
      body.adopt(new Element("tr").adopt(rowElems));
   }
}

function getDuration(startToEnd) {
   var startMins = startToEnd[0].getHours() * 60 + startToEnd[0].getMinutes();
   var endMins = startToEnd[0].getDate() == startToEnd[1].getDate() ? startToEnd[1].getHours() * 60 + startToEnd[1].getMinutes() : startToEnd[1].getHours() * 60 + startToEnd[1].getMinutes() + 24 * 60;
   var diff_mins = endMins - startMins;
   var hrs = Math.trunc(diff_mins / 60);
   var mins = diff_mins % 60;
   return hrs + "h " + mins + "min";
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
         tableList.push([allRowCells[0].innerText, allRowCells[2].innerText, allRowCells[4].firstChild.id]);
      }
   }
   var list = serializeAllCreatedSchedule();

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
         var removelink = document.getElementById(tableList[i][2]);
         removelink.parentNode.parentNode.dispose();
      }
   }
}


function serializeAllCreatedSchedule() {
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



function displayScheduleLogTable() {
   var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
   if (typeof filteredScheduleArray == "undefined" || filteredScheduleArray.length == 0) {
      //none of courses would be on today
      var msg = "You don't have any active courses in the record. By creating a course on your dashboard, you can therefore view the course schedule.";
      //hide the table log and the calendar table
      document.getElementById('scheduletablelogh4').addClass("hideRow");
      document.getElementById('scheduletablelogtable').addClass("hideRow");
      document.getElementById('scheduletablediv').addClass("hideRow");
      var parent = document.getElementById('scheduletablelogemptymsgdiv');
      parent.removeClass('hideRow');
      var lowerBound;
      if (parent.firstChild.nodeType == 3) {
         lowerBound = parent.firstChild.nextSibling;
      } else {
         lowerBound = parent.firstChild;
      }
      //add the message
      parent.insertBefore(new Element("p", { text: msg }), lowerBound);
      //toggle the table log card body
      var cardBody = document.getElementById('cardbodyscheduletablelogdiv');
      var img = document.getElementById('extendscheduletablelogbutton');
      cardBody.removeClass("hideRow");
      if (cardBody.hasClass("hideRow")) {
         //change the icon to extend down bar
         img.src = "/static/images/extendBarDownBtn.svg";
      } else {
         img.src = "/static/images/extendBarUpBtn.svg";
      }

      return false;
   }

   //create the row in the schedule log table
   var tableBody = document.getElementById('schedulelogbody');

   for (var i = 0; i < filteredScheduleArray.length; i++) {
      var rowElems = [];
      var date = new Date(filteredScheduleArray[i].sessioninterval[0]);
      var dateStr = (date.getMonth() + 1) + "/" + date.getDate();
      var time = getTimeString(new Date(filteredScheduleArray[i].sessioninterval[0])) + "-" + getTimeString(new Date(filteredScheduleArray[i].sessioninterval[1]));

      rowElems.push(new Element("td", { text: dateStr }));
      rowElems.push(new Element("td", { text: daysList[date.getDay()] }));
      rowElems.push(new Element("td", { text: filteredScheduleArray[i].coursetitle }));
      rowElems.push(new Element("td", { text: time }));
      rowElems.push(new Element("td", { text: getDuration([new Date(filteredScheduleArray[i].sessioninterval[0]), new Date(filteredScheduleArray[i].sessioninterval[1])]) }));
      rowElems.push(new Element("td", { text: filteredScheduleArray[i].enrollmentcap }));
      rowElems.push(new Element("td", { text: "" + filteredScheduleArray[i].sessioninterval[2].length }));

      tableBody.adopt(new Element("tr").adopt(rowElems));
   }
   return true;
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
      var arrayToInsert = getStartAndEndNumbers(weekSchedulesList[k]);
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
      schedulesList.push([startDate, endDate]);
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
      for (var row = 0; row < NUM_15MINS; row++) {
         var id = "pos=" + row + "$" + col;
         var tdElem = iframe.contentWindow.document.getElementById(id);
         var theadId = tdElem.parentNode.firstChild.id;
         if (tdElem.firstChild) {
            var imgElem = tdElem.firstChild;
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
                  sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime);
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
                     sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime);
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
                     sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime);
                  } else if (keep && identifier != imgElem.alt.split("_")[0]) {
                     //a time session ends and another starts immediately
                     endTime = theadId.split("=")[1];
                     identifier = imgElem.alt.split("_")[0];
                     sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime);
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
                     sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime);
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
               sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + endTime);
               startTime = "";
               endTime = "";
            }
         }
      }
      //if the schedule ends at the last row, record it
      if (keep) {
         keep = false;
         sessionsList.push(daysList[col - 1] + "_" + startTime + "-" + "00:00");
         startTime = "";
         endTime = "";
      }
   }
   return sessionsList;
}



function hasItem(list, item) {
   for (var i = 0; i < list.length; i++) {
      if (item == list[i]) {
         return true;
      }
   }
   return false;
}


function addScheduleToNextDay(iframe, slotsRemain, col, identifier) {
   var row = 0;
   for (var i = 0; i < slotsRemain; i++) {
      var td = iframe.contentWindow.document.getElementById("pos=" + row + "$" + col);
      td.innerText = "";
      if (i == slotsRemain - 1) {
         td.adopt(new Element('img', { src: "/static/images/courseScheduleBtn.svg", height: "10", width: "10", draggable: "false", alt: "s" + identifier + "_skip" }));

         //the last cell in the column, down, left and right sides colored
         td.setStyles({
            "border-bottom": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
            "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
            "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
         });
      } else {
         td.adopt(new Element('img', { src: "/static/images/courseScheduleBtn.svg", height: "10", width: "10", draggable: "false", alt: "s" + identifier + "_skip" }));

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

function addScheduleToNextWeek(iframe, slotsRemain, identifier) {
   var row = 0, col = 1;
   for (var i = 0; i < slotsRemain; i++) {
      var td = iframe.contentWindow.document.getElementById("pos=" + row + "$" + col);
      td.innerText = "";
      if (i == slotsRemain - 1) {
         td.adopt(new Element('img', { src: "/static/images/courseScheduleBtn.svg", height: "10", width: "10", draggable: "false", alt: "s" + identifier + "_skip" }));

         //the last cell in the column, down, left and right sides colored
         td.setStyles({
            "border-bottom": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
            "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
            "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
         });
      } else {
         td.adopt(new Element('img', { src: "/static/images/courseScheduleBtn.svg", height: "10", width: "10", draggable: "false", alt: "s" + identifier + "_skip" }));

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
function addVisualTimeSlot(iframe, numSlots, row, col) {
   var weekNumber = Number(iframe.id.slice(4, iframe.id.length - 6));
   const identifier = row;
   for (var i = 0; i < numSlots; i++, row++) {
      //control for cross-day and -week schedule intervals
      var td = iframe.contentWindow.document.getElementById("pos=" + row + "$" + col);
      if (row == 95 && numSlots - i > 1) {
         if (i == 0) {
            td.adopt(new Element('img', { src: "/static/images/courseScheduleBtn.svg", class: "abscenter", height: "10", width: "10", draggable: "false", alt: "s" + identifier + "_next" }));

            //the first cell in the column, up, left, and right sides colored
            td.setStyles({
               "border-top": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
               "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
               "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
            });
         } else {
            //handle the last element
            td.adopt(new Element('img', { src: "/static/images/courseScheduleBtn.svg", height: "10", width: "10", draggable: "false", alt: "s" + identifier + "_next" }));

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
         addScheduleToNextDay(iframe, numSlots - i, col + 1, identifier);
         return;

      } else if (row > 95 && col == 7) {
         //add the rest of time slots to the start day of the next week
         var nextIframe = document.getElementById('week' + (weekNumber + 1) + 'iframe');
         addScheduleToNextWeek(nextIframe, numSlots - i, identifier);
         return;
      }

      var td = iframe.contentWindow.document.getElementById("pos=" + row + "$" + col);
      td.innerText = "";
      if (i == 0 && numSlots != 1) {
         td.adopt(new Element('img', { src: "/static/images/courseScheduleBtn.svg", class: "abscenter", height: "10", width: "10", draggable: "false", alt: "s" + identifier }));

         //the first cell in the column, up, left, and right sides colored
         td.setStyles({
            "border-top": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
            "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
            "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
         });
      } else if (i == 0 && numSlots == 1) {
         td.adopt(new Element('img', { src: "/static/images/courseScheduleBtn.svg", class: "abscenter", height: "10", width: "10", draggable: "false", alt: "s" + identifier }));

         //if the slot is the only slot --session time == 15min
         td.setStyles({
            "border-top": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
            "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
            "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
            "border-bottom": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
         });
      } else if (i == numSlots - 1) {
         td.adopt(new Element('img', { src: "/static/images/courseScheduleBtn.svg", height: "10", width: "10", draggable: "false", alt: "s" + identifier }));

         //the last cell in the column, down, left and right sides colored
         td.setStyles({
            "border-bottom": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
            "border-left": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect],
            "border-right": "3px solid " + borderColorList[addVisualTimeSlot.colorSelect]
         });
      } else {
         td.adopt(new Element('img', { src: "/static/images/courseScheduleBtn.svg", height: "10", width: "10", draggable: "false", alt: "s" + identifier }));

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
   var arrayToInsert = getStartAndEndNumbers(str);
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
   return [startDate, endDate];
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
   addVisualTimeSlot(iframe, numSlots, row, col);
}


function displayCreatedScheduleInText(iframe, weekNumber, row, str, duration) {
   var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

   //add the newly inserted item
   var newTime = getSingleTimeSchedule(weekNumber, str);
   var rowStr = [(newTime[0].getMonth() + 1) + "/" + newTime[0].getDate(), daysList[newTime[0].getDay()], getTimeString(newTime[0]) + "-" + getTimeString(newTime[1]), duration];
   var addList = [];
   rowStr.forEach(str => {
      addList.push(new Element('td', { text: str }));
   });
   document.getElementById('schedulelogbody').adopt(new Element('tr').adopt(addList));
}



//can only be called in the iframe
function canAddNewTimeSchedule(s, list, iframe) {
   var arrayToInsert = getStartAndEndTotalMins(s);
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
      if (scheduleItems[0] == dayName && ((startTime >= scheduleItems[1] && startTime < scheduleItems[2]) || (endTime >= scheduleItems[1] && endTime <= scheduleItems[2]))) {
         return [false, "schedule conflicts"];
      } else if (scheduleItems[0] == dayName && (startTime < scheduleItems[1] && (endTime <= scheduleItems[2] && endTime > scheduleItems[1]))) {
         return [false, "schedule conflicts"];
      } else if (scheduleItems[0] == dayName && (endTime > scheduleItems[2] && (startTime <= scheduleItems[1] && startTime > scheduleItems[2]))) {
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



document.body.onload = handlePageOnload();
function handlePageOnload() {
   var request = new Request.JSON({
      url: "view-upcoming-courses-schedule",
      onSuccess: showSchedule,
   });
   request.get();

   //register the extend buttons
   document.getElementById('extendtodayscheduletablebutton').addEventListener('click', handleExtendCardBody);
   document.getElementById('extendscheduletablelogbutton').addEventListener('click', handleExtendCardBody);
   document.getElementById('extendscheduletablebutton').addEventListener('click', handleExtendCardBody);

}


function handleExtendCardBody(e) {
   var cardBody = document.getElementById(e.target.alt);
   cardBody.toggleClass("hideRow");
   if (cardBody.hasClass("hideRow")) {
      //change the icon to extend down bar
      e.target.src = "/static/images/extendBarDownBtn.svg";
   } else {
      e.target.src = "/static/images/extendBarUpBtn.svg";
   }
}

