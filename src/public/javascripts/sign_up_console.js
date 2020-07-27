//form check list functions corresponding to each input/select field
//and prompt message for invalid field entries
var formCheckList = [
    {
        name:"fullnametext",
        method:[isNonEmptyField, fullnameFormatCheck],
        prompt:["Enter your full name", "Full name cannot be longer than 50 characters"]
    },
    {
        name:"regioncode",
        method:[],
        prompt:["Select a valid country code"]
    },
    {
        name:"phonetext",
        method:[phoneNumberCheck, submitPhoneNumber],
        prompt:["Enter a valid phone #", "This number has been registered"]
    },
    {
        name:"useremail",
        method:[emailCheck, submitEmail],
        prompt:["Enter a valid email address", "This email has been registered"]
    },
    {
        name:"usertypeselection",
        method:[selectionBoxNonDefault],
        prompt:["Select a valid type"]
    },
    {
        name:"file0",
        method:[isCertificateSelected],
        prompt:["Upload your certificate of one of the type above"]
    },
    {
        name:"usernametext",
        method:[isNonEmptyField, usernameFormatCheck, submitUsername],
        prompt:["Enter a valid username", "Enter a valid username", "This username has been registered"]
    },
    {
        name:"userpassword",
        method:[passwordCheck, passwordIdentityCheck],
        prompt:["Enter a valid password", "Passwords need to be matched"]
    },
    {
        name:"gradelevelselect",
        method:[selectionBoxNonDefault],
        prompt:["Select a valid grade"]
    },
    {
        name:"yearofbirthselect",
        method:[selectionBoxNonDefault],
        prompt:["Select a valid year"]
    },
    {
        name:"typeofinstructorselect",
        method:[selectionBoxNonDefault],
        prompt:["Select a valid type"]
    },
    {
        name:"institutionnametext",
        method:[isNonEmptyField],
        prompt:["Enter a valid institution"]
    },
    {
        name:"institutiontypeselection",
        method:[selectionBoxNonDefault],
        prompt:["Select a valid type"]
    },
    {
        name:"roleselection",
        method:[selectionBoxNonDefault],
        prompt:["Select a valid role"]
    },
    {
        name:"degreeselection",
        method:[selectionBoxNonDefault],
        prompt:["Select a valid degree"]
    }
];


//dynamically add options to country code selection box
function addCountryPhoneCodesListElements()
{
    var request = new Request.JSON({
        url:"/static/jsons/country_phone_codes.json",
        onSuccess:function(json){
            var countryList = json;
            var selectionBox = document.infoform.regioncode;
            countryList.forEach(function(obj){
                selectionBox.add(new Option("+" + obj.callingCode, obj.code), null);
            });
            //select the default country code, China(+86)
            selectionBox.options[0].selected = "selected";
        },
        onFailure:function(){console.log("failure to fetch the file");}
    });
    request.get();
}



function addStudentTypeElements()
{
    //dynamically add student user type elements
    function obtainYearString(beg, end)
    {
        var str = ["Year"];
        for(var i = end; i >= beg; i--)
        {
            str.push("" + i);
        }
        return str;
    }
    var nthGradeStr = ["Grade", "7th grade", "8th grade", "9th grade", "10th grade", "11th grade", "12th grade",
                "college student"];
    var yearStr = obtainYearString(1970, 2020);

    var parentTable = document.getElementById("infoform");
    var posLowerBound = document.getElementById('username_row');
    var gradeLevelAttr = {
        id:"gradelevel_row",
        class:"form-group"
    };
    var yearOfBrithAttr = {
        id:"yearofbirth_row",
        class:"form-group"
    };
    var gradelevelSelectAttr = {
        id:"gradelevelselect",
        name:"gradelevelselect",
        size:"1",
        class:"form-control"
    };
    var yearOfBirthSelectAttr = {
        id:"yearofbirthselect",
        name:"yearofbirthselect",
        size:"1",
        class:"form-control"
    };
    var gradelevel_row = new Element("div", gradeLevelAttr);
    var yearOfBirth_row = new Element("div", yearOfBrithAttr);
    var gradelevelSelect = new Element("select", gradelevelSelectAttr);
    var yearOfBirthSelect = new Element("select", yearOfBirthSelectAttr);

    //add options to the selection boxes
    nthGradeStr.forEach(function(elem){
        gradelevelSelect.add(new Option(elem), null);
    })
    yearStr.forEach(function(year){
        yearOfBirthSelect.add(new Option(year), null);
    })

    gradelevel_row.adopt(new Element("label", {class:"col-form-label", text:"Grade"}));
    gradelevel_row.adopt(gradelevelSelect);
    gradelevel_row.adopt(new Element("div", {class:"", text:""}));
    yearOfBirth_row.adopt(new Element("label", {class:"col-form-label", text:"Year of birth"}));
    yearOfBirth_row.adopt(yearOfBirthSelect);
    yearOfBirth_row.adopt(new Element("div", {class:"", text:""}));

    parentTable.insertBefore(gradelevel_row, posLowerBound);
    parentTable.insertBefore(yearOfBirth_row, posLowerBound);
    gradelevelSelect.addEventListener("change", handleSelectionBox);
    yearOfBirthSelect.addEventListener("change", handleSelectionBox);
    return [gradelevel_row, yearOfBirth_row];
}


function addInstructorTypeSelector()
{
    //dynamically add instructor user type elements
    var typeOfInstructorStr = ["select an option", "individual educator", "institutional/organizational educator"];
    var parentTable = document.getElementById("infoform");
    var posLowerBound = document.getElementById('username_row');
    var typeOfInstructorSelectAttr = {
        id:"typeofinstructorselect",
        name:"typeofinstructorselect",
        class:"form-control",
        size:"1"
    };
    var typeOfInstructor_row = new Element("div", {id:"typeofinstructor_row", class:"form-group"});
    var typeOfInstructorSelect = new Element("select", typeOfInstructorSelectAttr);
    typeOfInstructorStr.forEach(function(elem){
        typeOfInstructorSelect.add((new Option(elem)), null);
    });
    typeOfInstructor_row.adopt(new Element("label", {text:"Instructor type", class:"col-form-label"}));
    typeOfInstructor_row.adopt(typeOfInstructorSelect);
    typeOfInstructor_row.adopt(new Element("div", {class:"", text:""}));

    parentTable.insertBefore(typeOfInstructor_row, posLowerBound);
    typeOfInstructorSelect.addEventListener("change", handleInstructorType);
    typeOfInstructorSelect.addEventListener("change", handleSelectionBox);
    return typeOfInstructor_row;
}


function addIndividualTypeElements()
{
    var degreeList = ["select an option", "Some college", "Associate degree", "Bachelor degree",
                        "Master degree", "Doctoral degree", "Post-doctoral degree"];
    var parentTable = document.getElementById("infoform");
    var posLowerBound = document.getElementById('username_row');
    var degree_row = new Element("div", {id: "degree_row", class:"form-group"});
    var degreeSelect = new Element("select", {id: "degreeselection", name:"degreeselection", class:"form-control"});
    degreeList.forEach(function(elem){
        degreeSelect.add((new Option(elem)), null);
    });
    degree_row.adopt(new Element("label", {id:"degree_label", class:"col-form-label", text:"Your degree"}));
    degree_row.adopt(degreeSelect);
    degree_row.adopt(new Element("div", {class:"", text:""}));

    parentTable.insertBefore(degree_row, posLowerBound);
    degreeSelect.addEventListener("change", handleSelectionBox);
    return [degree_row]
}


function testOptionsExceed(obj, regrex)
{
    var count = 0;
    for(var i = 0; i < obj.length; i++)
    {
        if(obj[i].institution.search(regrex) != -1){count++;}
        if(count > 16){return false;}
    }
    return true;
}

function addInstitutionToSelect(keyEntered)
{
    var datalist = document.getElementById("institutionslist");
    if(keyEntered.length <= 5)
    {
        datalist.empty();
        return;
    }
    datalist.empty();
    var keyregex = new RegExp(keyEntered, "i");

    if(testOptionsExceed(getParseObject.obj, keyregex))
    {
        getParseObject.obj.forEach(function(elem){
            if(elem.institution.search(keyregex) != -1)
            {
                var option = new Element("option", {
                    value: elem.institution
                });
                datalist.appendChild(option);
            }
        });
    } 
}



getParseObject.obj = null;
function getParseObject(json)
{
    getParseObject.obj = json;
}
function addOrganzationalTypeElements()
{
    var parentTable = document.getElementById("infoform");
    var posLowerBound = document.getElementById('username_row');
    //fetch the institutions list
    var requestInstitutionList = new Request.JSON({
        url:"/static/jsons/us_institutions.json",
        onSuccess:getParseObject,
        onFailure:function(){console.log("failure to fetch the file");}
    });
    requestInstitutionList.get();
    var institutionTypesList = ["select an option", "Higher Ed.-for profit Ed.", "Higher Ed.-not for profit Ed.",
                                "Higher Ed.-for vocational Ed.", "Further Education",
                                "K12", "Corporate", "Non-corporate"];
    var roleTypesList = ["select an option", "Academic staff", "Employee-in-training", "Professor",
                         "Associate professor", "Assistant professor", "Instructor",
                         "Limited appointee", "Student assistant", "Staff"];
    //create the rows
    var institutionList_row = new Element("div", {id:"institution_row", class:"form-group"});
    var institutionType_row = new Element("div", {id:"institutiontype_row", class:"form-group"});
    var role_row            = new Element("div", {id:"role_row", class:"form-group"});
    //create the field elements
    var institutionName = new Element("input", {
        id:"institutionnametext",
        name:"institutionnametext",
        type:"text",
        size:"30",
        maxlength:"45",
        list:"institutionslist",
        placeHolder:"Enter your institution/org",
        class:"form-control custom-select"
    });
    var institutionList = new Element("datalist", {
        id:"institutionslist"
    });
    var institutionTypeSelect = new Element("select", {
        id:"institutiontypeselection",
        name: "institutiontypeselection",
        size:"1",
        class:"form-control"
    });
    var roleSelect = new Element("select", {
        id:"roleselection",
        name:"roleselection",
        size:"1",
        class:"form-control"
    });
    //add options into selection boxes
    institutionTypesList.forEach(function(elem){
        institutionTypeSelect.add(new Option(elem), null);
    })
    roleTypesList.forEach(function(elem){
        roleSelect.add(new Option(elem), null);
    })

    institutionList_row.adopt(new Element("label",{text:"Institution", class:"col-form-label"}));
    institutionList_row.adopt([institutionName,institutionList]);
    institutionList_row.adopt(new Element("div", {class:"", text:""}));
    institutionType_row.adopt(new Element("label", {text:"Institutional type", class:"col-form-label"}));
    institutionType_row.adopt(institutionTypeSelect);
    institutionType_row.adopt(new Element("div", {class:"", text:""}));
    role_row.adopt(new Element("label", {text:"Your current role", class:"col-form-label"}));
    role_row.adopt(roleSelect);
    role_row.adopt(new Element("div", {class:"", text:""}));
    parentTable.insertBefore(institutionList_row, posLowerBound);
    parentTable.insertBefore(institutionType_row, posLowerBound);
    parentTable.insertBefore(role_row, posLowerBound);
    roleSelect.addEventListener("change", handleSelectionBox);
    institutionTypeSelect.addEventListener("change", handleSelectionBox);
    institutionName.addEventListener("change", handleInstitutionOnchange);
    return [institutionList_row, institutionType_row, role_row];
}

addInstructorCertificate.panelsList = [];
function addInstructorCertificate()
{
    //clear the panelsList for initialization
    addInstructorCertificate.panelsList = [];
    var parentTable = document.getElementById("infoform");
    var posLowerBound = document.getElementById('username_row');
    var certificateTypesList = ["In Teaching", "With Academic Degree", "With Skills", "Customize"];
    var certificatePromptsList = ["Please upload a combined file(img/pdf) of your certification to teach as a credible instructor.",
                                  "Please upload a combined file(img/pdf) of your diploma of higher education as a credible instructor.",
                                  "Please upload a combined file(img/pdf) of your skill certificate as a credible instructor.",
                                  ];
    var customizePrompt = "Please upload a combined file(img/pdf) of any of your certificates in order to be a credible instructor."
    var tabs_row = new Element("div", {class:"form-group", id:"certificate_row"});
    var panels_row = new Element("div", {id:"tabcontent", class:"form-group"});
    var tabs_list = new Element("ul", {class:"nav nav-tabs"});
    var i = 0;

    //makeup the nav tabs
    certificateTypesList.forEach(type => {
        var item = new Element("li", {class:"nav-item liPointer"});
        item.adopt(new Element("a", {class:"nav-link noselect", text: type, id:"href" + i++}));
        tabs_list.adopt(item);
    });
    i = 0;

    //makeup the panels
    certificatePromptsList.forEach(prompt => {
        var div = new Element("div", {class:"d-flex justify-content-around", style: "display: none !important;"});
        var input = new Element("input", {id:"file" + i, name:"file" + i, type:"file", accept:"image/*, application/pdf", style:"display: none;"});
        var label = new Element("label", {for:"file" + i++, style:"cursor: pointer"}).adopt(new Element("i", {text:"Upload", class:"noselect"}).adopt(new Element("img", {src:"/static/images/uploadFileBnt.svg", width:"60", height:"60", draggable:"false"})));
        div.adopt(new Element("div", {class:"mt-3 ml-4"}).adopt([input, label]));
        div.adopt(new Element("div", {class:"mt-5 ml-4 mr-4"}).adopt(new Element("p", {text: prompt})));
        addInstructorCertificate.panelsList.push(div);
    });
    //makeup the customized panel
    var div = new Element("div", {class:"col", style: "display: none !important;"});
    var input = new Element("input", {id:"file" + i, name:"file" + i, type:"file", accept:"image/*, application/pdf", style:"display: none;"});
    var label = new Element("label", {for:"file" + i, class:"input-group-text", style:"cursor: pointer"}).adopt(new Element("img", {src:"/static/images/uploadFileBnt.svg", width:"18", height:"18", draggable:"false"}));
    var textField = new Element("input", {type: "text", id:"customizedcertificatetype", name:"customizedcertificatetype", form:"infoform", size:"45", maxlength:"50", placeholder:"Type your certificate type here", class:""});
    div.adopt(new Element("div", {class:"mt-4 ml-4 mr-4"}).adopt(new Element("p", {text: customizePrompt})));
    div.adopt(new Element("div", {class:"input-group ml-4 mr-4"}).adopt([textField, new Element("div", {class:"input-group-append"}).adopt(new Element(label).adopt(input))]));
    div.adopt(new Element("div", {class:"ml-4 mr-4", id:"customizedfileuploadcheck"}));
    addInstructorCertificate.panelsList.push(div);

    //set the default active tab/panel
    tabs_row.adopt(new Element("label", {class:"col-form-label", text:"You are required to be certified in at least one item below:"}));
    addInstructorCertificate.panelsList.forEach(elem => {
        panels_row.adopt(elem);
    })
    tabs_row.adopt(tabs_list)
    tabs_row.adopt(panels_row);
    //append the user uploaded file info
    tabs_row.adopt(new Element("div", {id:"filename0", class:"ml-4", style:"display: none !important;"}));
    tabs_row.adopt(new Element("div", {id:"filename1", class:"ml-4", style:"display: none !important;"}));
    tabs_row.adopt(new Element("div", {id:"filename2", class:"ml-4", style:"display: none !important;"}));
    tabs_row.adopt(new Element("div", {id:"filename3", class:"ml-4", style:"display: none !important;"}));

    tabs_row.adopt(new Element("div", {id:"certificateselectcheck", class:""}));
    parentTable.insertBefore(tabs_row, posLowerBound);
    $(document.getElementById("href0")).addClass("active");
    $$(".liPointer").forEach(elem => {
        elem.addEvent("click", tabIsActive);
    });

    //register upload file onchange
    for(var i=0; i<4; i++)
    {
        document.getElementById('file' + i).addEventListener("change", handleAddFile);
    }
    document.getElementById("file3").addEventListener("click", handleCustomizedFile);
    addInstructorCertificate.panelsList[0].setProperty("style", "");
    return tabs_row;
}


function tabIsActive(e) {
    //active the clicked nav tab
    $$(".nav-link").forEach(elem => {
        if(elem.hasClass("active")) {
            elem.removeClass("active");
        }
    });
    e.target.addClass("active");
    //active the corresponding tab panel
    addInstructorCertificate.panelsList.forEach(elem => {
        if(elem.style != "display: none !important;") {
            elem.setProperty("style", "display: none !important;");
        }
    })
    addInstructorCertificate.panelsList[Number(e.target.id.slice(4))].setProperty("style", "");
}

//on click
function handleCustomizedFile(e) {
    var textField = document.getElementById("customizedcertificatetype");
    //if the type of certificate is not entered
    if(textField.value == "") {
        e.preventDefault();
        var checkpoint = document.getElementById("customizedfileuploadcheck");
        checkpoint.innerText = "Please enter the title of your certificate in order to browse";
        checkpoint.addClass("invalidFeedback");
    }
}


/**
 * The getElems function retrieves the field element associated with the
 * Event e and the checkpoint element(from which to show the message)
 * 
 * Limitation: cannot used for password exposure checkpoint
 * 
 * @param {Event} e 
 */
function getElems(e)
{
    var elem = e.target;
    var elemcheck;
    if(elem.nextSibling.nodeType == 3)
    {   elemcheck = elem.nextSibling.nextSibling;   }
    else
    {   elemcheck = elem.nextSibling;   }
    var arr = [elem, elemcheck];
    return arr;
}

/**
 * The getNextCell function retrieves the checkpoint field associated
 * with the field element provided in the argument
 * 
 * Limitation: cannot used for password exposure checkpoint
 * 
 * @param {DOM element} elem 
 */
function getNextCell(elem)
{
    if(elem.nextSibling.nodeType == 3)
    {   return elem.nextSibling.nextSibling; }
    else
    {   return elem.nextSibling; }
}



/**
 * sets time-out for an element's innertext warning
 * 
 * @param {DOM element} elem 
 * @param {number} sec 
 */
function omitWarning(elem, sec)
{
    function clearWarning()
    {
        elem.innerText = "";
    }
    
    //clear the warning after displaying for 5s
    return setTimeout(clearWarning, sec);
}

function isNonEmptyField(a)
{
    return a.value != "";
}

function isEmptyStr(e)
{
    var elem, elemcheck;
    if(e.target.name != "userpassword")
    {
        var elemArr = getElems(e);
        elem = elemArr[0];
        elemcheck = elemArr[1];
    }
    else
    {
        elem = e.target;
        elemcheck = document.getElementById("userpasswordcheck");
    }

    //test for empty string input
    var warnEmptyField = "Empty field";
    if(elem.value == "")
    {
        elemcheck.innerText = warnEmptyField;
        $(elem).removeClass("is-valid").addClass("is-invalid");
        $(elemcheck).removeClass("valid-feedback").addClass("invalid-feedback");
        return true;
    }
    else
    {
        elemcheck.innerText = "";
        $(elem).removeClass("is-invalid").addClass("is-valid");
        $(elemcheck).removeClass("invalid-feedback").addClass("valid-feedback");
        return false;
    }
}



function fullnameFormatCheck(a)
{
    var regexLength = /^.{1,50}$/g;
    return regexLength.test(a.value);
}

function fullnameFormat(e)
{
    var fullname = document.infoform.fullnametext;
    var elemcheck = document.getElementById("fullnamecheck");
    var regexLength = /^.{1,50}$/g;
    if(regexLength.test(fullname.value))
    {
        elemcheck.innerText = "";
        $(fullname).removeClass("is-invalid").addClass("is-valid");
        $(elemcheck).removeClass("invalid-feedback").addClass("valid-feedback");
        return true;
    }
    else 
    {
        elemcheck.innerText = "No longer than 50 characters";
        $(fullname).removeClass("is-valid").addClass("is-invalid");
        $(elemcheck).removeClass("valid-feedback").addClass("invalid-feedback");
    }
}



function phoneNumberCheck(a)
{
    //var val = document.infoform.phonetext.value;
    var regExp = /^\d{11}$/;
    return regExp.test(a.value);
}

function phoneNumberFormat(e)
{
    var elemArr = getElems(e);
    var elem = elemArr[0];
    var elemcheck = elemArr[1];

    var regExpPhone = /^\d{11}$/;    //format for mainland China domestic cell phone #

    if(regExpPhone.test(elem.value))
    {
        elemcheck.innerText = "";
        $(elem).removeClass("is-invalid").addClass("is-valid");
        $(elemcheck).removeClass("invalid-feedback").addClass("valid-feedback");
        return true;
    }
    else
    {
        elemcheck.innerText = "Invalid format!";
        $(elem).removeClass("is-valid").addClass("is-invalid");
        $(elemcheck).removeClass("valid-feedback").addClass("invalid-feedback");
        return false;
    }
}

/*
async function canSubmitPhoneNumber()
{
    try{
        //await for submitPhoneNumber to resolve or reject
        //would throw error before returning
        return await submitPhoneNumber();
    } catch(e) {
        return null;
    }
}
*/

function submitPhoneNumber()
{
    var pass = false;
    var text = document.infoform.phonetext.value;
    var request = new Request.JSON({
        url: "register" + "?phonetext=" + text,
        async: false,
        onSuccess: function(resJSON) {
            if(resJSON.available == true) {
                pass = true;
            } else {
                pass = false;
            }
        },
        onFailure: function(){  pass = false;   }
    });
    request.get();
    return pass;
}

function isPhoneNumberAvailable()
{
    var text = document.infoform.phonetext;
    var checkElem = document.getElementById('phonecheck');
    var request = new Request.JSON({
        url: "register" + "?phonetext=" + text.value,
        onSuccess: function(resJSON) {
            if(resJSON.available == true) {
                $(text).removeClass("is-invalid").addClass("is-valid");
                $(checkElem).removeClass("invalid-feedback").addClass("valid-feedback");        
                checkElem.innerText = "Available!";
            } else {
                $(text).removeClass("is-valid").addClass("is-invalid");
                $(checkElem).removeClass("valid-feedback").addClass("invalid-feedback");
                checkElem.innerText = "Sorry, this number has been registered!";
            }
        },
        onFailure: function(){ console.log('failed to connect to the server'); }
    });
    request.get();
}


/*
async function canSubmitEmail()
{
    try{
        //await for submitEmail to resolve or reject
        //would throw error before returning
        var promise = await submitEmail();
        console.log(promise);
        return true;
        //return promise;
    } catch(e) {
        return false;
    }
}
*/

function submitEmail()
{
    var pass = false;
    var useremail = document.infoform.useremail.value;
    var request = new Request.JSON( {
        url: "register" + "?useremail=" + useremail,
        async: false,
        onSuccess: function(resJSON) {
            if(resJSON.available == true) {
                pass = true;
            } else {
                pass = false;
            }
        },
        onFailure: function(){  pass = false;   }
    });
    request.get();
    return pass;
}

function isEmailAvailable()
{
    var useremail = document.infoform.useremail;
    var checkElem = document.getElementById('useremailcheck');
    var request = new Request.JSON( {
        url: "register" + "?useremail=" + useremail.value,
        onSuccess: function(resJSON) {
            if(resJSON.available == true) {
                $(useremail).removeClass("is-invalid").addClass("is-valid");
                $(checkElem).removeClass("invalid-feedback").addClass("valid-feedback");
                checkElem.innerText = "Available!";
            } else {
                $(useremail).removeClass("is-valid").addClass("is-invalid");
                $(checkElem).removeClass("valid-feedback").addClass("invalid-feedback");
                checkElem.innerText = "Sorry, this email has been registered!";
            }
        },
        onFailure: function(){ console.log('failed to connect to the server'); }
    });
    request.get();
}

function emailCheck(a)
{
    //var val = document.infoform.useremail;
    var regExpEmail = /^(([^<>()\[\],;:@"\x00-\x20\x7F]|\\.)+|("""([^\x0A\x0D"\\]|\\\\)+"""))@(([a-z0-9]|#\d+?)([a-z0-9-]|#\d+?)*([a-z0-9]|#\d+?)\.)+([a-z]{2,4})$/i;
    return regExpEmail.test(a.value);
}

function emailFormat(e)
{
    var elemArr = getElems(e);
    var elem = elemArr[0];
    var elemcheck = elemArr[1];

    var regExpEmail = /^(([^<>()\[\],;:@"\x00-\x20\x7F]|\\.)+|("""([^\x0A\x0D"\\]|\\\\)+"""))@(([a-z0-9]|#\d+?)([a-z0-9-]|#\d+?)*([a-z0-9]|#\d+?)\.)+([a-z]{2,4})$/i;
    
    if(regExpEmail.test(elem.value))
    {
        $(elem).removeClass("is-invalid").addClass("is-valid");
        $(elemcheck).removeClass("invalid-feedback").addClass("valid-feedback");
        elemcheck.innerText = "";
        return true;
    }
    else
    {
        $(elem).removeClass("is-valid").addClass("is-invalid");
        $(elemcheck).removeClass("valid-feedback").addClass("invalid-feedback");
        elemcheck.innerText = "Invalid format!";
        return false;
    }
}



function usernameFormatCheck(a)
{
    var regexSpaces = /\s+/g;
    var regexContent = /[^0-9A-Z_a-z\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700–\u2B73F\u2B740–\u2B81F\u2B820–\u2CEAF]+/g;    //for jck characters
    var regexLength = /^.{16,}$/g;
    var regExpList = [regexSpaces, regexLength, regexContent];
    for(var i = 0; i < 3; i++)
    {
        if(regExpList[i].test(a.value)) {
            return false;
        }
    }
    return true;
}

usernameFormat.insertStr = "";
function usernameFormat(e)
{
    usernameFormat.insertStr = "";
    var regexSpaces = /\s+/g;
    //for jck characters: CJK Unified Ideographs and CJK Unified Ideographs Extension A
    var regexContent = /[^0-9A-Z_a-z\u4E00-\u9FFF\u3400-\u4DBF]+/g;
    var regexLength = /^.{16,}$/g;
    var regExpList = [regexSpaces, regexLength, regexContent];
    var requireFormat = ["No leading, trailing, or in-between space<br/>",
                        "No longer than 15 characters",
                        "Only accept alphanumeric characters, with exceptions of underscores and Chinese characters"];
    var elem = document.infoform.usernametext;
    var elemcheck = document.getElementById("usernamecheck");
    var elemStr = elem.value;

    function displayRequire(i)
    {
        if(elemStr.search(regExpList[i]) != -1)
        {
            usernameFormat.insertStr += requireFormat[i];
        }
        else if(usernameFormat.insertStr.indexOf(requireFormat[i]) != -1)
        {
            usernameFormat.insertStr = usernameFormat.insertStr.replace(requireFormat[i], "");
        }
    }
    for(var i = 0; i < 3; i++)
    {
        displayRequire(i);
    }
    elemcheck.innerHTML = usernameFormat.insertStr;
    if(usernameFormat.insertStr == "")
    {
        $(elem).removeClass("is-invalid").addClass("is-valid");
        $(elemcheck).removeClass("invalid-feedback").addClass("valid-feedback");
        return true;    
    }
    else
    {
        $(elem).removeClass("is-valid").addClass("is-invalid");
        $(elemcheck).removeClass("valid-feedback").addClass("invalid-feedback");
        return false;   
    }
}

function submitUsername()
{
    var pass = false;
    var username = document.infoform.usernametext.value;
    var usertypeIndex = document.infoform.usertypeselection.selectedIndex;
    if(userTypeSelector == 0) {
        //user did not select a usertype
        reject();
    } else {
        var request = new Request.JSON({
            url: "register" + "?usernametext=" + username + "&usertypeindex=" + usertypeIndex,
            async: false,
            onSuccess: function(resJSON) {
                if(resJSON.available == true) {
                    pass = true;
                } else {
                    pass = true;
                }
            },
            onFailure: function(){  pass = false;   }
        });
        request.get();    
    }
    return pass;
}

function isUsernameAvailable()
{
    var username = document.infoform.usernametext;
    var usertypeIndex = document.infoform.usertypeselection.selectedIndex;
    var checkElem = document.getElementById('usernamecheck');
    if(userTypeSelector == 0)
    {
        //user did not select a usertype
        checkElem.innerText = "Select a user type before going on";
        return;
    }
    var request = new Request.JSON({
        url: "register" + "?usernametext=" + username.value + "&usertypeindex=" + usertypeIndex,
        onSuccess: function(resJSON) {
            if(resJSON.available == true) {
                $(username).removeClass("is-invalid").addClass("is-valid");
                $(checkElem).removeClass("invalid-feedback").addClass("valid-feedback");
                checkElem.innerText = "Available!";
            } else {
                $(username).removeClass("is-valid").addClass("is-invalid");
                $(checkElem).removeClass("valid-feedback").addClass("invalid-feedback");
                checkElem.innerText = "Sorry, this username has been registered!";
            }
        },
        onFailure: function(resJSON, resText) {
            if(resJSON.error_code == "ERR_EMPTY_RESPONSE") {
                document.getElementById("div").insertBefore((new Element("span", {text:"Please check your Internet connection, error code: ERR_EMPTY_RESPONSE"})), document.getElementById("infoform"));
            } else if(resJSON.status == 400) {
                //user type is not selected: warn the user about it
                $(username).removeClass("is-valid").addClass("is-invalid");
                $(checkElem).removeClass("valid-feedback").addClass("invalid-feedback");
                checkElem.innerText = "Sorry, please select a user type!";
                var select = document.infoform.usertypeselection;
                var check = document.getElementById("usertypecheck");
                $(select).removeClass("is-valid").addClass("is-invalid");
                $(check).removeClass("valid-feedback").addClass("invalid-feedback");
                check.innerText = "Select an option prior to typing a username.";
            }
        }
    });
    request.get();
}



function passwordCheck(a)
{
    //var val = document.infoform.userpassword;
    var regLength     = /^.{8,16}$/g;
    var regUppercase  = /[A-Z]+/g;
    var regLowercase  = /[a-z]+/g;
    var regNumber     = /\d+/g;
    var regSpecial    = /([\x20-\x2F]+|[\x3A-\x40]+|[\x5B-\x60]+|[\x7B-\x7E]+)+/g;
    var regExpList    = [regLength, regUppercase, regLowercase,
                        regNumber, regSpecial];
    for(var i = 0; i < regExpList.length; i++)
    {
        if(!regExpList[i].test(a.value)){   return false;   }
    }
    return true;
}

passwordFormat.insertStr = "";
function passwordFormat(e)
{
    passwordFormat.insertStr = "";
    var regLength     = /^.{8,16}$/g;
    var regUppercase  = /[A-Z]+/g;
    var regLowercase  = /[a-z]+/g;
    var regNumber     = /\d+/g;
    var regSpecial    = /([\x20-\x2F]+|[\x3A-\x40]+|[\x5B-\x60]+|[\x7B-\x7E]+)+/g;
    var regExpList    = [regLength, regUppercase, regLowercase,
                        regNumber, regSpecial];
    var requireFormat = ["8 ~ 16 characters<br/>",
                        "At least one UPPERCASE<br/>",
                        "At least one LOWERCASE<br/>",
                        "At least one number<br/>",
                        "At least one special char"
                        ];

    var elem = document.infoform.userpassword;
    var elemcheck = document.getElementById("userpasswordcheck");

    var elemStr = elem.value;
    
    function displayRequire(i)
    {
        if(elemStr.search(regExpList[i]) == -1)
        {
            passwordFormat.insertStr += requireFormat[i];
        }
        else if(passwordFormat.insertStr.indexOf(requireFormat[i]) != -1)
        {
            passwordFormat.insertStr = passwordFormat.insertStr.replace(requireFormat[i], "");
        }
    }
    for(var i = 0; i < 5; i++)
    {
        displayRequire(i);
    }

    elemcheck.innerHTML = passwordFormat.insertStr;
    if(passwordFormat.insertStr == ""){
        $(elem).removeClass("is-invalid").addClass("is-valid");
        $(elemcheck).removeClass("invalid-feedback").addClass("valid-feedback");
        return true;    
    }
    else{
        $(elem).removeClass("is-valid").addClass("is-invalid");
        $(elemcheck).removeClass("valid-feedback").addClass("invalid-feedback");
        return false;   
    }
}

function passwordExposure(e)
{
    var img, span;
    if(e.target.tagName == "span")
    {
        span = e.target;
    }
    else
    {
        span = document.getElementById("userpasswordexposespan");
    }

    if(span.firstChild.nodeType == 3)
    {
        img = span.firstChild.nextSibling;
    }
    else
    {
        img = span.firstChild;
    }
    var parent = span.parentNode.parentNode;
    var elem;
    if(parent.firstChild.nodeType == 3)
    {
        elem = parent.firstChild.nextSibling;
    }
    else
    {
        elem = parent.firstChild;
    }
    var imgElem = document.getElementById("userpasswordexposeimg");
    if(img.alt == "showBtn")
    {
        elem.setProperty("type", "text");
        imgElem.setProperty("src", "/static/images/hidePwBnt.svg")
        imgElem.setProperty("alt", "hideBtn");
    }
    else
    {
        elem.setProperty("type", "password");
        imgElem.setProperty("src", "/static/images/showPwBnt.svg");
        imgElem.setProperty("alt", "showBtn");
    }
}

function passwordIdentityConfirm(e)
{
    var elempassword = document.infoform.userpassword;
    var elemArr = getElems(e);
    var elempasswordcheck = elemArr[0];
    var elemcheck = elemArr[1];

    if(elempassword.value != elempasswordcheck.value)
    {
        elemcheck.innerText = "passwords are not matched";
        $(elempasswordcheck).removeClass("is-valid").addClass("is-invalid");
        $(elemcheck).removeClass("valid-feedback").addClass("invalid-feedback");
    }
    else
    {
        elemcheck.innerText = "passwords are matched";
        $(elempasswordcheck).removeClass("is-invalid").addClass("is-valid");
        $(elemcheck).removeClass("invalid-feedback").addClass("valid-feedback");
    }
}

function passwordIdentityCheck(a)
{
    //var pw1 = document.infoform.userpassword;
    var pw2 = document.getElementById("userpasswordconfirm").value;
    return (a.value && a.value == pw2);
}

function passwordIdentity(e)
{
    var elempasswordcheck = document.getElementById('userpasswordconfirm');
    //only check for non-empty re-enter password field
    if(elempasswordcheck.value != "")
    {
        var elempassword = document.infoform.userpassword;
        var elemCheck = document.getElementById("userpasswordcheck");
        var elemConfirmCheck = document.getElementById("userpasswordconfirmcheck");
    
        if(elempassword.value != elempasswordcheck.value)
        {
            elemCheck.innerText = "passwords are not matched";
            elemConfirmCheck.innerText = "passwords are not matched";
            $(elempassword).removeClass("is-valid").addClass("is-invalid");
            $(elempasswordcheck).removeClass("is-valid").addClass("is-invalid");
            $(elemCheck).removeClass("valid-feedback").addClass("invalid-feedback");
            $(elemConfirmCheck).removeClass("valid-feedback").addClass("invalid-feedback");
        }
        else
        {
            elemCheck.innerText = "passwords are matched";
            elemConfirmCheck.innerText = "passwords are matched";
            $(elempassword).removeClass("is-invalid").addClass("is-valid");
            $(elempasswordcheck).removeClass("is-invalid").addClass("is-valid");
            $(elemCheck).removeClass("invalid-feedback").addClass("valid-feedback");
            $(elemConfirmCheck).removeClass("invalid-feedback").addClass("valid-feedback");
        }
    }
}



function selectionBoxNonDefault(a)
{
    return a.selectedIndex != 0;
}

/*
function clearAllRepeatedTimers(timerList)
{
    if(timerList.length > 0)
    {
        for(var i=0; i<timerList.length; i++)
        {
            clearTimeout(timerList.shift());
        }
    }
}
function clearRepeatedTimerToOne(timerId, timerList)
{
    if(timerId != false)
    {
        timerList.push(timerId);
        var timerNums = timerList.length;
        if(timerNums > 1)
        {
            //if repeated timers have been set
            //clear all of them and remain the last one
            for(var i=0; i<timerNums-1;i++)
            {
                clearTimeout(timerList.shift());
            }
        }
    }
}
*/

/**
 * "onclick" event handler function
 * @param {Event} e 
 */
function handlePasswordExposure(e)
{
    passwordExposure(e);
}

/*
function onclickClearCheckText(e, timerList)
{
    if(e.type == "click")
    {
        clearAllRepeatedTimers(timerList);
        var arr = getElems(e);
        if(arr[0].hasClass("errorField")){arr[0].removeClass("errorField");}
        arr[1].innerText = "";
        return true;
    }
    return false;
}

handleFullname.emptyStrTimerList = [];
handleUsername.emptyStrTimerList = [];
handlePhone.emptyStrTimerList    = [];
handleEmail.emptyStrTimerList    = [];
handlePassword.emptyStrTimerList = [];
handleConfirmpassword.emptyStrTimerList = [];
*/


/**
 *"onblur" event handler function
 * @param {Event} e 
 */
function handleFullname(e)
{
    if(!isEmptyStr(e))
    {
        fullnameFormat(e);
    }
    //may need some format verification below
}

/**
 * "onblur" and "change" event handler function
 * @param {Event} e 
 */
function handlePhone(e)
{
    if(!isEmptyStr(e) && phoneNumberFormat(e)){
        isPhoneNumberAvailable();
    }
}

/**
 * "onblur" event handler function
 * @param {Event} e 
 */
function handleEmail(e)
{
    if(!isEmptyStr(e) && emailFormat(e)){
        //ajax check availability
        isEmailAvailable();
    }
}

/**
 * "onblur" & "onkeyup" event handler function
 * @param {Event} e 
 */
function handleUsername(e)
{
    if(e.type == "keyup")
    {
        usernameFormat(e);
    }
    else if(e.type == "blur")
    {
        if(!isEmptyStr(e) && usernameFormat(e)) {
            //ajax check availability
            isUsernameAvailable();
        }
    }
}


/**
 * "onblur" & "onkeyup" event handler function
 * @param {Event} e 
 */
function handlePassword(e)
{
    if(e.type == "keyup")
    {
        passwordFormat(e);
    }
    else if(e.type == "blur")
    {
        if(!isEmptyStr(e)){
            passwordIdentity(e);
            passwordFormat(e);
        }
    }
}

/**
 * "onblur" event handler function
 * @param {Event} e 
 */
function handleConfirmpassword(e)
{
    if(!isEmptyStr(e)){
        passwordIdentityConfirm(e);
    }

}

//onchange
function handleAddFile(e)
{
    var certificates = ["Teaching Certificate", "Academic Degree", "Skill Certificate", "Other Certificate"];
    //the # of nav tab was selected
    var tabSelected = e.target.id.slice(4);
    var certificateName = certificates[tabSelected];
    var filename = e.target.value;
    filename = filename.slice(filename.lastIndexOf('\\') + 1);
    if(filename) {
        //remove the previous selected file
        document.getElementById('filename' + tabSelected).empty();
        //show the div with corr to the #
        if(tabSelected == 3) {
            //a customized file is uploaded
            var customizedType = document.getElementById("customizedcertificatetype");
            certificateName = customizedType.value;
            e.target.name = certificateName;
            customizedType.value = "";
            //clear the warning in the check point
            document.getElementById("customizedfileuploadcheck").innerText = "";
        }
        var removeBnt = new Element("a", {id:"remove" + tabSelected, text: "remove", href:"#", draggable: "false"});
        document.getElementById('filename' + tabSelected).adopt(new Element("div", {class: "row"}).adopt([new Element("div", {class:"col-md-auto"}).adopt(removeBnt), new Element("div", {class:"col"}).adopt(new Element("p", {text: filename + "  --" + certificateName}))]));
        document.getElementById('filename' + tabSelected).setProperty("style", "");
        removeBnt.addEventListener("mouseup", handleDeleteFile);
    } else {
        document.getElementById('filename' + tabSelected).setProperty("style", "display: none !important;");
        document.getElementById('file' + tabSelected).value = "";
        document.getElementById('filename' + tabSelected).empty();
    }
}

//onmouseup
function handleDeleteFile(e)
{
    e.preventDefault();
    var tabSelected = e.target.id.slice(6);
    document.getElementById('filename' + tabSelected).setProperty("style", "display: none !important;");
    document.getElementById('file' + tabSelected).value = "";
    document.getElementById('filename' + tabSelected).empty();
}


function deleteElements(elemsList)
{
    if(elemsList.length != 0)
    {
        elemsList.forEach(function(elem){
            //elem.empty();
            elem.dispose();
        });
    }
}

handleUserType.elementList = [];
function handleUserType(e)
{
    var index = e.target.selectedIndex; //user type selected index
    if(handleUserType.elementList.length != 0)
    {
        //clear subtype elements if has
        deleteElements(handleInstructorType.elementList);
        //clear existed elements
        deleteElements(handleUserType.elementList);
    }
    if(index == 1)
    {
        addStudentTypeElements().forEach(function(elem){
            handleUserType.elementList.push(elem);
        });
    }
    else if(index == 2)
    {
        handleUserType.elementList.push(addInstructorTypeSelector());
        handleUserType.elementList.push(addInstructorCertificate());
    }
}

handleInstructorType.elementList = [];
function handleInstructorType(e)
{
    //select the type of instructor
    deleteElements(handleInstructorType.elementList);
    if(e.target.selectedIndex == 1)
    {
        addIndividualTypeElements().forEach(function(elem){
            handleInstructorType.elementList.push(elem);
        })
    }
    else if(e.target.selectedIndex == 2)
    {
        addOrganzationalTypeElements().forEach(function(elem){
            handleInstructorType.elementList.push(elem);
        });
        document.getElementById("institutionnametext").addEventListener("keyup", handleInstitutionNamesList);

    }
    var selectedItem = e.target.selectedIndex;
    console.log(selectedItem);
}

function handleInstitutionNamesList(e)
{
    var elem = e.target;
    addInstitutionToSelect(elem.value);
}

function handleInstitutionOnchange(e)
{
    if($(e.target).hasClass("is-invalid")){e.target.removeClass("is-invalid");}
    getNextCell(e.target).removeClass("invalid-feedback").innerText = "";

}

function handleSelectionBox(e)
{
    if($(e.target).hasClass("is-invalid")){e.target.removeClass("is-invalid");}
    getNextCell(e.target).removeClass("invalid-feedback").innerText = "";
}

function isCertificateSelected()
{
    var pass = false;
    var filenames = ['file0', 'file1', 'file2', 'file3'];
    filenames.forEach(name => {
        if(document.getElementById(name).value != "") {
            pass = true;
        }
    });
    return pass;
}

function isFormComplete()
{
    var elemsList = document.infoform.elements;
    for(var i = 0; i < elemsList.length; i++)
    {
        for(var j=0; j<formCheckList.length;j++)
        {
            if(elemsList[i].name && formCheckList[j].name.indexOf(elemsList[i].name) != -1)
            {
                for(var k = 0; k < formCheckList[j].method.length; k++)
                {
                    if(!formCheckList[j].method[k](elemsList[i])){return false};
                }
            }
        }
    }
    return true;
}

function handleMouseSubmit(e)
{
    var submitBnt = $(document.getElementById('submitbutton'));
    if(e.type == "mouseover"){if(isFormComplete()){submitBnt.addClass("button");}}
    else if(e.type == "mouseout"){if(submitBnt.hasClass("button")){submitBnt.removeClass("button");}}
}

function handleFormSubmit(e)
{
    e.preventDefault();
    var pass = true;
    var warningsList = [];
    var elemsList = document.infoform.elements;
    for(var i = 0; i < elemsList.length; i++)
    {
        function listCheck(htmlElem){
            for(var j=0; j<formCheckList.length;j++)
            {
                if(htmlElem.name && formCheckList[j].name.indexOf(htmlElem.name) != -1)
                {
                    for(var k = 0; k < formCheckList[j].method.length; k++)
                    {
                        if(!formCheckList[j].method[k](htmlElem))
                        {
                            warningsList.push([htmlElem, formCheckList[j].prompt[k]]); 
                            if(formCheckList[j].method[k] == phoneNumberCheck ||
                               formCheckList[j].method[k] == emailCheck ||
                               formCheckList[j].method[k] == usernameFormatCheck ||
                               formCheckList[j].method[k] == passwordCheck ||
                               ((htmlElem.name == "usernametext" || htmlElem.name == "fullnametext") &&
                                formCheckList[j].method[k] == isNonEmptyField))
                            {   return; }
                            pass = false;
                        }
                    }
                    break;
                }
            }
        }
        listCheck(elemsList[i]);
    }
    showSubmitWarnings(warningsList);
    if(!pass){    e.preventDefault();    }
    else{
        //console.log(e.target.toQueryString());

        //trim the leading/trailing spaces
        document.infoform.fullnametext.value = document.infoform.fullnametext.value.trim();
        if(document.infoform.usertypeselection.selectedIndex == 2 && document.infoform.typeofinstructorselect.selectedIndex == 2) {
            //institutional instructor register
            document.infoform.institutionnametext.value = document.infoform.institutionnametext.value.trim();
        }
        //make a field for selected customized file (id: file3)
        var customizedFile = document.getElementById("file3");
        if(customizedFile.name != "file3") {
            var customizedcertificateType = customizedFile.name;
            document.getElementById("customizedcertificatetype").value = customizedcertificateType;
            customizedFile.name = "file3";
        } else {
            //the customized certificate is not selected, remove the input text field out of the form
            document.getElementById("customizedcertificatetype").form = "";
        }
        //register user type and submit method
        var form = document.getElementById('infoform');
        var usertypes = ["", "student", "instructor"];
        var enctype = ["", "", "multipart/form-data"];
        var index = document.infoform.usertypeselection.selectedIndex;
        form.action += usertypes[index];
        form.enctype = enctype[index];
        form.submit();
        /*
        var postObj = queryStringToJSON(e.target.toQueryString());
        var request = new Request({
            data: postObj,
            url:"register",
            onSuccess: function(resText){
                console.log(resText);
                //document.getElementById("html").innerHTML = resText;
            },
            onFailure: function(){console.log('failure');}
        });
        request.post();
        */
    }
    //console.log(warningsList);
    //document.infoform.submit();
}

function queryStringToJSON(str)
{
    var pairs = str.split('&');
    var result = {};
    pairs.forEach(function(pair){
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1]);
    });
    return JSON.parse(JSON.stringify(result));
}

function showSubmitWarnings(list)
{
    list.forEach(function(elem){
        if(elem[0].name != "file0")
        {
            $(elem[0]).removeClass("is-valid").addClass("is-invalid");
            if(elem[0].name != "userpassword") {
                getNextCell(elem[0]).removeClass("valid-feedback").addClass("invalid-feedback").innerText = elem[1];
            } else {
                document.getElementById("userpasswordcheck").removeClass("valid-feedback").addClass("invalid-feedback").innerText = elem[1];
                //if passwords not matched
                //mark the confirmpassword field if not matched
                if(elem[1] == "Passwords need to be matched") {
                    $(document.getElementById("userpasswordconfirm")).removeClass("is-valid").addClass("is-invalid");
                    document.getElementById("userpasswordconfirmcheck").removeClass("valid-feedback").addClass("invalid-feedback").innerText = "Passwords need to be matched";    
                } else {
                    $(document.getElementById("userpasswordconfirm")).removeClass("is-valid").addClass("is-invalid");
                    document.getElementById("userpasswordconfirmcheck").removeClass("valid-feedback").addClass("invalid-feedback").innerText = "Match the password";
                }
            }
        }
        else
        {
            document.getElementById('certificateselectcheck').removeClass('validFeedback').addClass('invalidFeedback').innerText = elem[1];
        }
    });
    /*
    if(!isPasswordMatched())
    {
        $(document.getElementById("userpasswordconfirm")).addClass("errorField");
        getNextCell(document.getElementById("userpasswordconfirm")).innerText = "Passwords need to be matched";
    }
    function isPasswordMatched()
    {
        return document.infoform.userpassword.value == document.getElementById("userpasswordconfirm").value;
    }
    */
}

document.infoform.regioncode.onload = addCountryPhoneCodesListElements();

var checkEmptyFieldList = [];
checkEmptyFieldList.push(handleFullname);
checkEmptyFieldList.push(handlePhone);
checkEmptyFieldList.push(handleEmail);
checkEmptyFieldList.push(handleUsername);
checkEmptyFieldList.push(handlePassword);
checkEmptyFieldList.push(handleConfirmpassword);

//selecting the user's input fields in the table
var inputFields = document.getElementsByTagName("input");
for(var i=0; i < inputFields.length; i++) {
    inputFields[i].addEvent("blur", checkEmptyFieldList[i]);
    //inputFields[i].addEvent("click", checkEmptyFieldList[i]);
}

document.infoform.usertypeselection.onchange = handleSelectionBox;
//register for the phone number field
//var phoneNumberField = document.infoform.phonetext;
//phoneNumberField.addEventListener("change", handlePhone);

//register for the email field
//var emailField = document.infoform.useremail;
//emailField.addEventListener("blur", handleEmail);
var usernameField = document.infoform.usernametext;
usernameField.addEventListener("keyup", handleUsername);

//register for the password format identifier
var passwordField = document.infoform.userpassword;
passwordField.addEventListener("keyup", handlePassword);

//register for the password exposure checkbox
document.getElementById("userpasswordexposespan").addEventListener("click", handlePasswordExposure);

//register for student type user sign-up extension
var userTypeSelector = document.infoform.usertypeselection;
userTypeSelector.addEventListener("change", handleUserType);

document.getElementById("infoform").addEventListener("submit", handleFormSubmit);
//document.getElementById("submitbutton").addEventListener("mouseover", handleMouseSubmit);
//document.getElementById("submitbutton").addEventListener("mouseout", handleMouseSubmit);