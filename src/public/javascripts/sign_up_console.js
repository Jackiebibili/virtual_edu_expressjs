//form check list functions corresponding to each input/select field
//and prompt message for invalid field entries
var formCheckList = [
    {
        name:"fullnametext",
        method:[isNonEmptyField],
        prompt:["Enter your full name"]
    },
    {
        name:"regioncode",
        method:[],
        prompt:["Select a valid country code"]
    },
    {
        name:"phonetext",
        method:[phoneNumberCheck],
        prompt:["Enter a valid phone #"]
    },
    {
        name:"useremail",
        method:[emailCheck],
        prompt:["Enter a valid email address"]
    },
    {
        name:"usertypeselection",
        method:[selectionBoxNonDefault],
        prompt:["Select a valid type"]
    },
    {
        name:"usernametext",
        method:[isNonEmptyField],
        prompt:["Enter a valid user name"]
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

    var parentTable = $("infotable").firstChild.nextSibling;
    var posLowerBound = $("username_row");
    var gradeLevelAttr = {
        id:"gradelevel_row"
    };
    var yearOfBrithAttr = {
        id:"yearofbirth_row"
    };
    var gradelevelSelectAttr = {
        id:"gradelevelselect",
        name:"gradelevelselect",
        size:"1",
        class:"singlerowselectorcss"
    };
    var yearOfBirthSelectAttr = {
        id:"yearofbirthselect",
        name:"yearofbirthselect",
        size:"1",
        class:"singlerowselectorcss"
    };
    var gradelevel_row = new Element("tr", gradeLevelAttr);
    var yearOfBirth_row = new Element("tr", yearOfBrithAttr);
    var gradelevelSelect = new Element("select", gradelevelSelectAttr);
    var yearOfBirthSelect = new Element("select", yearOfBirthSelectAttr);

    //add options to the selection boxes
    nthGradeStr.forEach(function(elem){
        gradelevelSelect.add(new Option(elem), null);
    })
    yearStr.forEach(function(year){
        yearOfBirthSelect.add(new Option(year), null);
    })

    gradelevel_row.adopt(new Element("td", {text:"grade: "}));
    gradelevel_row.adopt(new Element("td", {class:"singlerowselectorcss"}).adopt(gradelevelSelect));
    gradelevel_row.adopt(new Element("td", {class:"checkEmpty"}));
    yearOfBirth_row.adopt(new Element("td", {text:"year of birth: "}));
    yearOfBirth_row.adopt(new Element("td", {class:"singlerowselectorcss"}).adopt(yearOfBirthSelect));
    yearOfBirth_row.adopt(new Element("td", {class:"checkEmpty"}));

    parentTable.insertBefore(gradelevel_row, posLowerBound);
    parentTable.insertBefore(yearOfBirth_row, posLowerBound);
    $(gradelevelSelect).addEvent("change", handleSelectionBox);
    $(yearOfBirthSelect).addEvent("change", handleSelectionBox);
    return [gradelevel_row, yearOfBirth_row];
}


function addInstructorTypeSelector()
{
    //dynamically add instructor user type elements
    var typeOfInstructorStr = ["select an option", "individual educator", "inistutional/organizational educator"];
    var parentTable = $("infotable").firstChild.nextSibling;
    var posLowerBound = $("username_row");
    var typeOfInstructorSelectAttr = {
        id:"typeofinstructorselect",
        name:"typeofinstructorselect"
    };
    var typeOfInstructor_row = new Element("tr", {id:"typeofinstructor_row"});
    var typeOfInstructorSelect = new Element("select", typeOfInstructorSelectAttr);
    typeOfInstructorStr.forEach(function(elem){
        typeOfInstructorSelect.add((new Option(elem)), null);
    });
    typeOfInstructor_row.adopt(new Element("td", {text:"type of instructor: "}));
    typeOfInstructor_row.adopt((new Element("td", {class:"singlerowselectorcss"})).adopt(typeOfInstructorSelect));
    typeOfInstructor_row.adopt(new Element("td", {class:"checkEmpty"}));

    parentTable.insertBefore(typeOfInstructor_row, posLowerBound);
    $("typeofinstructorselect").addEvent("change", handleInstructorType);
    $("typeofinstructorselect").addEvent("change", handleSelectionBox);
    return typeOfInstructor_row;
}


function addIndividualTypeElements()
{
    var degreeList = ["select an option", "Some college", "Associate degree", "Bachelor degree",
                        "Master degree", "Doctoral degree", "Post-doctoral degree"];
    var parentTable = $("infotable").firstChild.nextSibling;
    var posLowerBound = $("username_row");
    var degree_row = new Element("tr", {id: "degree_row"});
    var degreeSelect = new Element("select", {id: "degreeselection", name:"degreeselection"});
    degreeList.forEach(function(elem){
        degreeSelect.add((new Option(elem)), null);
    });
    degree_row.adopt(new Element("td", {id:"degree_label", text:"degree level: "}));
    degree_row.adopt((new Element("td", {class: "singlerowselectorcss"}).adopt(degreeSelect)));
    degree_row.adopt(new Element("td", {class:"checkEmpty"}));

    parentTable.insertBefore(degree_row, posLowerBound);
    $(degreeSelect).addEvent("change", handleSelectionBox);
    return degree_row;
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
        var datalist = $("institutionslist");
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
    var parentTable = $("infotable").firstChild.nextSibling;
    var posLowerBound = $("username_row");
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
    var institutionList_row = new Element("tr", {id:"institution_row"});
    var institutionType_row = new Element("tr", {id:"institutiontype_row"});
    var role_row = new Element("tr", {id:"role_row"});
    //create the field elements
    var institutionName = new Element("input", {
        id:"institutionnametext",
        name:"institutionnametext",
        type:"text",
        size:"30",
        maxlength:"45",
        list:"institutionslist",
        placeHolder:"Enter your institution/org"
    });
    var institutionList = new Element("datalist", {
        id:"institutionslist"
    });
    var institutionTypeSelect = new Element("select", {
        id:"institutiontypeselection",
        name: "institutiontypeselection",
        size:"1"
    });
    var roleSelect = new Element("select", {
        id:"roleselection",
        name:"roleselection",
        size:"1"
    });
    //add options into selection boxes
    institutionTypesList.forEach(function(elem){
        institutionTypeSelect.add(new Option(elem), null);
    })
    roleTypesList.forEach(function(elem){
        roleSelect.add(new Option(elem), null);
    })

    institutionList_row.adopt(new Element("td",{text:"institution: "}));
    institutionList_row.adopt((new Element("td",{class:"singlerowselectorcss"})).adopt([institutionName,institutionList]));
    institutionList_row.adopt(new Element("td", {class:"checkEmpty"}));
    institutionType_row.adopt(new Element("td", {text:"organzational type: "}));
    institutionType_row.adopt((new Element("td", {class:"singlerowselectorcss"})).adopt(institutionTypeSelect));
    institutionType_row.adopt(new Element("td", {class:"checkEmpty"}));
    role_row.adopt(new Element("td", {text:"your current role: "}));
    role_row.adopt((new Element("td", {class:"singlerowselectorcss"})).adopt(roleSelect));
    role_row.adopt(new Element("td", {class:"checkEmpty"}));
    parentTable.insertBefore(institutionList_row, posLowerBound);
    parentTable.insertBefore(institutionType_row, posLowerBound);
    parentTable.insertBefore(role_row, posLowerBound);
    $(roleSelect).addEvent("change", handleSelectionBox);
    $(institutionTypeSelect).addEvent("change", handleSelectionBox);
    $(institutionName).addEvent("change", handleInstitutionOnchange);
    return [institutionList_row, institutionType_row, role_row];
}



function getElems(e)
{
    var elem = e.target;
    var elemcheck;
    if(elem.parentNode.nextSibling.nodeType == 3)
    {
        elemcheck = elem.parentNode.nextSibling.nextSibling;
    }
    else
    {
        elemcheck = elem.parentNode.nextSibling;
    }
    var arr = [elem, elemcheck];
    return arr;
}

function getNextCell(elem)
{
    if(elem.parentNode.nextSibling.nodeType == 3)
    {return elem.parentNode.nextSibling.nextSibling;}
    else
    {return elem.parentNode.nextSibling;}
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
    var elemArr = getElems(e);
    var elem = elemArr[0];
    var elemcheck = elemArr[1];

    //test for empty string input
    var warnEmptyField = "Empty field";
    if(elem.value == "" && elemcheck.innerText != warnEmptyField)
    {
        elemcheck.innerText = warnEmptyField;
        return omitWarning(elemcheck, 3000);
    }
    else if(elem.value != "")
    {
        elemcheck.innerText = "";
        return false;
    }
    return omitWarning(elemcheck, 3000);
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

    //elemcheck.innerText = (regExpPhone.test(elem.value)? "valid number" : "invalid");
    //omitWarning(elemcheck, 3000);
    if(regExpPhone.test(elem.value))
    {
        elemcheck.innerText = "valid number";
        omitWarning(elemcheck, 3000);
        return true;
    }
    else
    {
        elemcheck.innerText = "invalid";
        omitWarning(elemcheck, 3000);
        return false;
    }
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
        elemcheck.innerText = "valid email";
        omitWarning(elemcheck, 3000);
        return true;
    }
    else
    {
        elemcheck.innerText = "invalid";
        omitWarning(elemcheck, 3000);
        return false;
    }
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
        if(!regExpList[i].test(a.value)){return false;}
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

    var elemArr = getElems(e);
    var elem = elemArr[0];
    var elemcheck = elemArr[1]; 

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
    if(passwordFormat.insertStr == ""){return true;}
    else{return false;}
}

function passwordExposure(e)
{
    var checkBox = e.target;
    var parent = checkBox.parentNode;
    var elem;
    if(parent.firstChild.nodeType == 3)
    {
        elem = parent.firstChild.nextSibling;
    }
    else
    {
        elem = parent.firstChild;
    }

    if(checkBox.checked)
    {
        elem.setProperty("type", "text");
    }
    else
    {
        elem.setProperty("type", "password");
    }


}

function passwordIdentityConfirm(e)
{
    var elempassword = document.infoform.userpassword;
    var elemArr = getElems(e);
    var elempasswordcheck = elemArr[0];
    var elemcheck = elemArr[1];

    elemcheck.innerText = (elempassword.value != elempasswordcheck.value ? "passwords not matched" : "matched");
    omitWarning(elemcheck, 3000);
}

function passwordIdentityCheck(a)
{
    //var pw1 = document.infoform.userpassword;
    var pw2 = $("userpasswordconfirm").value;
    return a.value == pw2;
}

function passwordIdentity(e)
{
    var elempasswordcheck = $(userpasswordconfirm);
    //only check for non-empty re-enter password field
    if(elempasswordcheck.value != "")
    {
        var elemArr = getElems(e);
        var elempassword = elemArr[0];
        var elemcheck = $("userpasswordconfirmcheck");
    
        elemcheck.innerText = (elempassword.value != elempasswordcheck.value ? "passwords not matched" : "matched");
        omitWarning(elemcheck, 3000);
    }
}

function selectionBoxNonDefault(a)
{
    return a.selectedIndex != 0;
}

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


/**
 * "onclick" event handler function
 * @param {Event} e 
 */
function handlePasswordExposure(e)
{
    passwordExposure(e);
}


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

/**
 *"onblur" event handler function
 * @param {Event} e 
 */
function handleFullname(e)
{
    if(onclickClearCheckText(e, handleFullname.emptyStrTimerList)){return;}
    var timerId = isEmptyStr(e);
    if(timerId != false)
    {
        clearRepeatedTimerToOne(timerId, handleFullname.emptyStrTimerList);
        return;
    }
    
    //may need some format verification below
}

/**
 *"onblur" event handler function
 * @param {Event} e 
 */
function handleUsername(e)
{
    if(onclickClearCheckText(e, handleUsername.emptyStrTimerList)){return;}
    var timerId = isEmptyStr(e);
    if(timerId != false)
    {
        clearRepeatedTimerToOne(timerId, handleUsername.emptyStrTimerList);
        return;
    }
    
    //ajax check availability
}

/**
 * "onblur" and "change" event handler function
 * @param {Event} e 
 */
function handlePhone(e)
{
    if(onclickClearCheckText(e, handlePhone.emptyStrTimerList)){return;}
    var timerId = isEmptyStr(e);
    if(timerId != false)
    {
        clearRepeatedTimerToOne(timerId, handlePhone.emptyStrTimerList);
        return;
    }
    phoneNumberFormat(e);
}

/**
 * "onblur" event handler function
 * @param {Event} e 
 */
function handleEmail(e)
{
    if(onclickClearCheckText(e, handleEmail.emptyStrTimerList)){return;}
    var timerId = isEmptyStr(e);
    if(timerId != false)
    {
        clearRepeatedTimerToOne(timerId, handleEmail.emptyStrTimerList);
        return;
    }
    emailFormat(e);

}

/**
 * "onblur" event handler function
 * @param {Event} e 
 */
function handlePassword(e)
{
    if(onclickClearCheckText(e, handlePassword.emptyStrTimerList)){return;}
    var arr = getElems(e);
    var formatPassed = false;
    if(e.type == "keyup")
    {
        formatPassed = passwordFormat(e);
        return;
    }
    else if(!formatPassed && e.type == "blur" && arr[1].innerText == "")
    {
        var timerId = isEmptyStr(e);
        if(timerId != false)
        {
            clearRepeatedTimerToOne(timerId, handlePassword.emptyStrTimerList);
            return;
        }
        passwordIdentity(e);
    }
}

/**
 * "onblur" event handler function
 * @param {Event} e 
 */
function handleConfirmpassword(e)
{
    if(onclickClearCheckText(e, handleConfirmpassword.emptyStrTimerList)){return;}

    var timerId = isEmptyStr(e);
    if(timerId != false)
    {
        clearRepeatedTimerToOne(timerId, handleConfirmpassword.emptyStrTimerList);
        return;
    }
    passwordIdentityConfirm(e);

}

function deleteElements(elemsList)
{
    if(elemsList.length != 0)
    {
        elemsList.forEach(function(elem){
            elem.empty();
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
    }
}

handleInstructorType.elementList = [];
function handleInstructorType(e)
{
    //select the type of instructor
    deleteElements(handleInstructorType.elementList);
    if(e.target.selectedIndex == 1)
    {
        handleInstructorType.elementList.push(addIndividualTypeElements());
    }
    else if(e.target.selectedIndex == 2)
    {
        addOrganzationalTypeElements().forEach(function(elem){
            handleInstructorType.elementList.push(elem);
        });
        $("institutionnametext").addEvent("keyup", handleInstitutionNamesList);

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
    if(e.target.hasClass("errorField")){e.target.removeClass("errorField");}
    getNextCell(e.target).innerText = "";

}

function handleSelectionBox(e)
{
    if(e.target.hasClass("errorField")){e.target.removeClass("errorField");}
    getNextCell(e.target).innerText = "";
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
    if(e.type == "mouseover"){if(isFormComplete()){$("submitbutton").addClass("button");}}
    else if(e.type == "mouseout"){if($("submitbutton").hasClass("button")){$("submitbutton").removeClass("button");}}
}

function handleFormSubmit(e)
{
    e.preventDefault();
    function clearTimers(timerList, checkElem)
    {
        clearAllRepeatedTimers(timerList);
        checkElem.innerText = "";
    }
    var timersList = [handleFullname.emptyStrTimerList,
                        handleUsername.emptyStrTimerList,
                        handlePhone.emptyStrTimerList,
                        handleEmail.emptyStrTimerList,
                        handlePassword.emptyStrTimerList,
                        handleConfirmpassword.emptyStrTimerList];
    var checkFieldsList = [$("fullnamecheck"), $("usernamecheck"), $("phonecheck"),
                            $("useremailcheck"), $("userpasswordcheck"), $("userpasswordconfirmcheck")];
    for(var i = 0; i < checkEmptyFieldList.length; i++)
    {
        clearTimers(timersList[i], checkFieldsList[i]);
    }
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
        console.log(e.target.toQueryString());
        var postObj = queryStringToJSON(e.target.toQueryString());
        var request = new Request({
            data: postObj,
            url:"/register",
            onSuccess: function(resText){
                console.log('success');
                document.getElementById("html").innerHTML = resText;
            },
            onFailure: function(){console.log('failure');}
        });
        request.post();
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
        $(elem[0]).addClass("errorField");
        getNextCell(elem[0]).innerText = elem[1];
    });
    if(!isPasswordMatched())
    {
        $("userpasswordconfirm").addClass("errorField");
        getNextCell($("userpasswordconfirm")).innerText = "Passwords need to be matched";
    }
    function isPasswordMatched()
    {
        return document.infoform.userpassword.value == $("userpasswordconfirm").value;
    }
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
var inputFields = $$(".textField");
var i = 0;
inputFields.forEach(function(elem){
    elem.addEvent("blur", checkEmptyFieldList[i]);
    elem.addEvent("click", checkEmptyFieldList[i++]);
});

document.infoform.usertypeselection.onchange = handleSelectionBox;
//register for the phone number field
//var phoneNumberField = document.infoform.phonetext;
//phoneNumberField.addEventListener("change", handlePhone);

//register for the email field
//var emailField = document.infoform.useremail;
//emailField.addEventListener("blur", handleEmail);

//register for the password format identifier
var passwordField = document.infoform.userpassword;
passwordField.addEventListener("keyup", handlePassword);

//register for the password exposure checkbox
$("userpasswordexpose").addEvent("click", handlePasswordExposure);

//register for student type user sign-up extension
var userTypeSelector = document.infoform.usertypeselection;
$(userTypeSelector).addEvent("change", handleUserType);

$("infoform").addEvent("submit", handleFormSubmit);
$("submitbutton").addEvent("mouseover", handleMouseSubmit);
$("submitbutton").addEvent("mouseout", handleMouseSubmit);
