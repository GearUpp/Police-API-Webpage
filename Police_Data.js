let postcode = "";
let PoliceAPI = "https://data.police.uk/api/"  //API for police data
let PostcodeAPI = "api.postcodes.io/postcodes/" //API for getting postcode data
var postcoderegx = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
let currentDate = (new Date().getFullYear() + "-" + (new Date().getMonth() - 1)); // Get month and Year only
let PostcodeData = ""; //Postcode.io API var to all postcode related data from the API
let crimeList = "";
let CrimeSelected = []; //DropDown Selection var [Name , url]
let QueryResponse = ""; //Full data response from form



//Location Selected visual help
function locationSelection(location) {
    document.querySelector("label").innerHTML = location
}

document.querySelector("input").addEventListener("click", function () {
    locationSelection("Search by Postcode, Format [SK21 2NE]");
})

//Location Selected visual help



// calls function that auto populates dropdown menu
async function query() {
    let crimeRaw = await fetch(PoliceAPI + "crime-categories");

    if (!crimeRaw.ok) { throw new error("Unable to contact Police API"); };
    crimeList = await crimeRaw.json();


    //console.log(data);
    //console.log(crimeList);
    populateDropMenu();

};
query(); //Auto call
// calls function that auto populates dropdown menu

// Populates Dropdown menu
function populateDropMenu() {
    crimeList.forEach(crime => {
        let createLI = document.createElement("li");
        let createA = document.createElement("a");

        document.querySelector("#Crime_Drop ul:last-child").appendChild(createLI).appendChild(createA).className = "dropdown-item";
        document.querySelector("#Crime_Drop li:last-child a").innerHTML = crime.name;
        document.querySelector("#Crime_Drop li:last-child a").id = crime.url;  // save url in anchers id for later retrival

    });

}

// Populates Dropdown menu


//validates and returns either full lang&long queury string or a false based on given POSTCODE
async function postcodeValidate(postcode) {
    if (postcoderegx.test(postcode)) {
        var postcode_data = await fetch("https://api.postcodes.io/postcodes/" + postcode);
        var PostcodeData_Raw = await postcode_data.json();
        console.log(PostcodeData_Raw)
        if (PostcodeData_Raw.status == 200) {
            //console.log("Valid postcode Data")
            //Returns formated lang and long for postcode ready to be inserted into any Police data API
            console.log("lat=" + PostcodeData_Raw.result.latitude + "&lng=" + PostcodeData_Raw.result.longitude);
            PostcodeData = { "latitude": PostcodeData_Raw.result.latitude, "longitude": PostcodeData_Raw.result.longitude };
            return PostcodeData;
        } else {

            alert("Postcode " + postcode + " is invalid according to postcodes.io !");
            return false

        }

    } else {
        console.log("Invalid Postcode Format")
        return false
    }

}
//validates and returns either full lang&long queury string or a false based on given POSTCODE



//Click will initiate all relevant functions to validate postcode, find lang & long of postcode, 
document.querySelector("#Submit").addEventListener("click", async function (event) {
    event.preventDefault(); // Prevents the default form submission behavior

    postcode = document.getElementById("postcode").value;
    // Wait for the postcode validation to complete
    PostcodeData = await postcodeValidate(postcode);
    
    if (PostcodeData) {

        if (CrimeSelected[0]) {
            await PoliceDataFetch(true);
        } else {
            await PoliceDataFetch(false);
        }
    } else {
        alert("Please provide a valid postcode!");
    }
});
//Click will initiate all relevant functions to validate postcode, find lang & long of postcode, 


// Identify  Crime selected

document.querySelector("#Crime_Drop ul").addEventListener('click', function (a) {
    CrimeSelected[0] = a.target.innerHTML;
    CrimeSelected[1] = a.target.id;


});
// Identify Crime selected


//All Police API Requests
async function PoliceDataFetch(CrimeFlag) {

    if (CrimeFlag == true) {
        console.log(PoliceAPI + "crimes-street/" + CrimeSelected[1] + "?&date=" + currentDate + "&lat=" + PostcodeData["latitude"].toString() + "&lng=" + PostcodeData["longitude"].toString())
        var QueryResponseRAW = await fetch(PoliceAPI + "crimes-street/" + CrimeSelected[1] + "?&date=" + currentDate + "&lat=" + PostcodeData["latitude"].toString() + "&lng=" + PostcodeData["longitude"].toString());
        
    } else {
        var QueryResponseRAW = await fetch(PoliceAPI + "crimes-street/all-crime?&date=" + currentDate + "&lat=" + PostcodeData["latitude"].toString() + "&lng=" + PostcodeData["longitude"].toString());
    };
    console.log("Done Fetching")
    QueryResponse = await QueryResponseRAW.json();
    console.log(QueryResponse);
    document.getElementById("output_area").innerHTML = QueryResponse;
}
//All Police API Asyn Functions