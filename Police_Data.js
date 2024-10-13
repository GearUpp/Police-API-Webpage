let postcode = "";
let PoliceAPI = "https://data.police.uk/api/"  //API for police data
let PostcodeAPI = "api.postcodes.io/postcodes/" //API for getting postcode data
var postcoderegx = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
let currentDate = ( new Date().getFullYear() + "-" + (new Date().getMonth()-1)) ; // Get month and Year only
let PostcodeData = ""; //Postcode.io API var to all postcode related data from the API
let PoliceData = ""; // Police Force Get request for all forces names request var
let crimeList = "";
let ForceSelected = ""; //DropDown Selection var
let CrimeSelected = []; //DropDown Selection var [Name , url]
let QueryResponse = ""; //Full data response from form



//Location Selected visual help
function locationSelection(location) {
    document.querySelector("label").innerHTML = location
}

document.querySelector("input").addEventListener("click", function() {
        locationSelection("Search by Postcode, Format [SK21 2NE]");
})

//Location Selected visual help



// calls function that auto populates dropdown menu
async function query() {
    let outputRAW = await fetch(PoliceAPI + "forces");
    let crimeRaw = await fetch(PoliceAPI + "crime-categories");

    if (!outputRAW.ok || !crimeRaw.ok) { throw new error("Unable to contact Police API");};
    PoliceData = await outputRAW.json();
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

    PoliceData.forEach(force => {
        let createLI = document.createElement("li");
        let createA = document.createElement("a");
        createA.href = "#";
        //createA.href = force.id;

        document.querySelector("#Force_Drop ul:last-child").appendChild(createLI).appendChild(createA).className = "dropdown-item";
        document.querySelector(".dropdown-menu li:last-child a").innerHTML = force.name;
    });
}

// Populates Dropdown menu


//validates and returns either full lang&long queury string or a false based on given POSTCODE
async function postcodeValidate(postcode) {
    var postcode_data = await fetch("https://api.postcodes.io/postcodes/" + postcode);
    var postcodeRaw_data = await postcode_data.json();
    PostcodeData = postcodeRaw_data;

    console.log(postcodeRaw_data)
    if (PostcodeData.status == 200) {
        alert("Postcode " + postcode + " is invalid according to postcodes.io !");
    } else {
        console.log("Valid postcode Data")
        //Returns formated lang and long for postcode ready to be inserted into any Police data API
        console.log("lat=" + PostcodeData.result.latitude + "&lng=" + PostcodeData.result.longitude);
        PostcodeData = [PostcodeData.result.latitude, PostcodeData.result.longitude];
        return PostcodeData.result;
    }
}
//validates and returns either full lang&long queury string or a false based on given POSTCODE

//Click will initiate all relevant functions to validate postcode, find lang & long of postcode, 
document.querySelector("#Submit").addEventListener("click", function () {
    postcode = document.getElementById("postcode").value;

    //Verifies either Postcode or Force is selected, then checks data is valid in both cases
    if (postcode || ForceSelected) {

        if (postcodeValidate(postcode)) {
            console.log("Valid postcode")
            
        };
        if (ForceSelected) {
            //Searcg based on Police Force Only
            console.log("Valid Force")
            
        }
    } else {
        alert("Select Force or type a postcode in");
    };







});
//Click will initiate all relevant functions to validate postcode, find lang & long of postcode, 


// Identify Force and Crime selected
document.querySelector("#Force_Drop ul").addEventListener('click', function (a) {
    
    ForceSelected = a.target.innerHTML;
    locationSelection("Searching in " + ForceSelected );
});
document.querySelector("#Crime_Drop ul").addEventListener('click', function (a) {
    CrimeSelected[0] = a.target.innerHTML;
    CrimeSelected[1] = a.target.id;
    console.log("Crime Selected: " + CrimeSelected[0] + ", URL: " + CrimeSelected[1]);
    
});
// Identify Force and Crime selected



//All Police API Asyn Functions
async function PostcodeFetch() {
    var PostcodeDataRaw = await PostcodeFetch(postcode);
   
    PostcodeData = await PostcodeDataRaw;
    
    if (!PostcodeData) {
        console.log("Postcode Data fetch failed,possibly wrong postcode, unable to pull police data without it...");
        return false;
    }

    
    var QueryResponseRAW = await fetch(PoliceAPI + "crimes-street/all-crime?lat=" + (PostcodeData[0].toString()) + "&lng=" + (PostcodeData[1].toString()) + "&date=" + currentDate );
    QueryResponse = await QueryResponseRAW.json();
    console.log("Police Data fetched");
    console.log(QueryResponse);
}
//All Police API Asyn Functions