document.body.onload = handleOnloadPage();
function handleOnloadPage() {
    //register the validate button
    document.getElementById('selectaschedulevalidatebutton').addEventListener('click', handleValidateButton);

    var radioGroup = document.querySelectorAll("input[name='selectascheduleradiogroup']");
    var checked = false;
    for(var i = 0; i < radioGroup.length; i++) {
        if(radioGroup[i].id.split("_")[1] == "true") {
            radioGroup[i].checked = true;
            checked = true;
            break;
        }
    }
    if(!checked) {
        //automatically check the first element
        radioGroup[0].checked = true;
    }
}

function handleValidateButton(e) {
    e.preventDefault();
    var radioChecked = document.querySelectorAll("input[name='selectascheduleradiogroup']:checked");
    if(!radioChecked) {
        console.log("please select a schedule");
        return;
    }
    document.choosescheduleform.submit();
}