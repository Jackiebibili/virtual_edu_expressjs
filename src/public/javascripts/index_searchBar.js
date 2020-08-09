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
    //get the search category selection index
    var searchIndex = document.getElementById('searchbarselectrange').selectedIndex;
    var form = document.getElementById('searchform');
    if(searchIndex == 0) {
        //search all related fields

    } else if(searchIndex == 1) {
        //search in the course title field
        form.action = "search-courses";
    } else if(searchIndex == 2) {
        //search in the subject title field
        form.action = "search-subjects";
    } else if(searchIndex == 3) {
        //search in the instructor's name field
        form.action = "search-instructors";
    }
    form.submit();
}

function isTextFieldEmpty(elem) {
    if(elem.value == "") {
        return true;
    } else {
        return false;
    }
}
