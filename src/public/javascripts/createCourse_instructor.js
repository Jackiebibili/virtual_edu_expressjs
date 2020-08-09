document.body.onload = handlePageOnload();
function handlePageOnload() {
    //month array
    months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
        ];

    //subjects list --testing
    subjects = [{parent: "English or Language Arts", list: ["Literature", "Speech", "Composition"]},
                {parent: "Mathematics", list: ["Algebra I", "Algebra II", "Geometry", "Statistics", "Trigonometry", "Pre-Calculus", "Calculus"]},
                {parent: "Science", list: ["Biology", "Psychology", "Chemistry", "Geology", "Enviromental Science", "Physics I", "Physics II"]},
                {parent: "Social Studies", list: ["Micro Economics", "Macro Economics", "Geography", "US Government", "US History I", "US History II", "World History"]},
                {parent: "Foreign Languages", list: ["French I", "French II", "German I", "German II", "Spanish I", "Spanish II", "Japanese I", "Japanese II", "Mandarin I", "Mandarin II"]},
                {parent: "Arts", list: ["Music", "Performing Art", "Choris"]}];
    
    //poplulate the subject selection box
    var subjectSelect = document.getElementById('coursesubjectlist');
    subjects.forEach(subject => {
        var options = [];
        subject.list.forEach(s => {
            options.push(new Element('option', {value: s, text: s}));
        });
        subjectSelect.adopt(new Element('optgroup', {label:  subject.parent}).adopt(options));
    });

    //populate the time session selection box
    var sessionSelect = document.getElementById('coursesessionlist');
    var request = new Request.JSON({
        url:"schedule",
        onSuccess: function(resJson) {
            var scheduleList = resJson.scheduleArray;
            scheduleList.forEach(scheduleItem => {
                var timeStr = getTimeString(new Date(scheduleItem[0])) + "--" + getTimeString(new Date(scheduleItem[1]));
                var dateStr = new Date(scheduleItem[0]).getDate() + " " + months[new Date(scheduleItem[0]).getMonth()] + ", " + new Date(scheduleItem[0]).getFullYear() + " (" + new Date(scheduleItem[0]).getFullYear() + "/" + (new Date(scheduleItem[0]).getMonth() + 1) + "/" + new Date(scheduleItem[0]).getDate() + ")";
                sessionSelect.add(new Element('option', {value:JSON.stringify(scheduleItem), text:dateStr + "  " + timeStr}), null);
            })
        }
    });
    request.get();

    //register the submit button
    document.getElementById('coursecreationvalidatebutton').addEventListener('click', handleCreateCourseSubmit);
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


function handleCreateCourseSubmit(e) {
    e.preventDefault();
    if(canSubmitCreateCourse()) {
        //change the button to disable clicking
        e.target.disabled = true;
        //show loading and let the user wait for the upload
        e.target.innerText = "Wait";
        e.target.adopt(new Element('i', {class:"fa fa-refresh fa-spin"}));

        var subjectSelect = document.getElementById('coursesubjectlist');
        var selectedOption = subjectSelect.options[subjectSelect.selectedIndex];
        var parentCategory = selectedOption.parentNode.label;
        var subjectTitle = selectedOption.value;
        //ajax submit the creation of the course
        var request = new Request({
            url: "create-course",
            onSuccess: function(resText) {
                e.target.empty();
                e.target.innerText = "Success";
    
                //refresh the window
                setTimeout(() => {
                    window.location.href = "/instructor/dashboard/course/create";
                }, 1500);
            }
        });
        request.post({
            courseSubject: JSON.stringify([parentCategory, subjectTitle]),
            courseTitle: document.getElementById('coursetitle').value.trim(),
            courseSession: document.getElementById('coursesessionlist').options[document.getElementById('coursesessionlist').selectedIndex].value,
            enrollmentCap: document.getElementById('courseenrollmentcap').value.trim(),
            courseDescription: document.getElementById('coursedescription').value.trim()
        });
    }
}

function canSubmitCreateCourse() {
    //check subject selected
    if(document.getElementById('coursesubjectlist').selectedIndex == 0) {
        console.log("please select a subject to continue");
        return false;
    }

    //check course title empty
    if(isTextFieldEmpty(document.getElementById('coursetitle'))) {
        console.log("course title is empty");
        return false;
    }
    //check enrollment cap empty
    var cap = document.getElementById('courseenrollmentcap');
    if(isTextFieldEmpty(cap)) {
        console.log("enrollment cap is empty");
        return false;
    }
    //check enrollment cap is in pure numeric
    var regCap = /^\d+$/;
    if(!regCap.test(cap.value)) {
        console.log("enrollment cap must be an integer");
        return false;
    }
    if(Number(cap.value) <= 0) {
        console.log("enrollment cap must be a positive integer");
        return false;
    }
    //check course description empty
    if(isTextFieldEmpty(document.getElementById('coursedescription'))) {
        console.log("course description is empty");
        return false;
    }
    return true;
}


function isTextFieldEmpty(elem) {
    if(elem.value == "") {
        return true;
    } else {
        return false;
    }
}

