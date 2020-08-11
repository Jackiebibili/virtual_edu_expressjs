document.body.onload = handlePageOnload();
function handlePageOnload() {
    document.getElementById('searchbutton').addEventListener('click', handleOnclickSearchSubmit);

}


function handleOnclickSearchSubmit(e) {
    e.preventDefault();
    //validate if the search text is empty
    if(isTextFieldEmpty(document.getElementById('searchtext'))) {
        console.log("please enter a value");
        return;
    }
    var form = document.getElementById('searchform');
    form.submit();
}

function isTextFieldEmpty(elem) {
    if(elem.value == "") {
        return true;
    } else {
        return false;
    }
}
