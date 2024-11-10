let postcode = "";
let PoliceAPI = "https://data.police.uk/api/"  //API for police data
let PostcodeAPI = "api.postcodes.io/postcodes/" //API for getting postcode data
var postcoderegx = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
let currentDate = (new Date().getFullYear() + "-" + (new Date().getMonth() - 1)); // Get month and Year only
let PostcodeData = ""; //Postcode.io API var to all postcode related data from the API
let crimeList = "";
let CrimeSelected = []; //DropDown Selection var [Name , url]
let QueryResponse; //Full data response from Police API Request





// calls function that auto populates dropdown menu
async function query() {
    let crimeRaw = await fetch(PoliceAPI + "crime-categories");

    if (!crimeRaw.ok) { throw new error("Unable to contact Police API"); };
    crimeList = await crimeRaw.json();


    //console.log(data);
    //console.log(crimeList);
    populateDropMenu(await crimeList);

};
query(); //Auto call
// calls function that auto populates dropdown menu

// Populates Dropdown menu
function populateDropMenu(x) {
    x.forEach(crime => {
        let createLI = document.createElement("li");
        let createA = document.createElement("a");

        document.querySelector(".dropdown-menu").appendChild(createLI).appendChild(createA).className = "dropdown-item";
        document.querySelector(".dropdown-menu li:last-child a").innerHTML = crime.name;
        document.querySelector(".dropdown-menu li:last-child a").id = crime.url;  // save url in anchers id for later retrival

    });

}

// Populates Dropdown menu


//validates and returns either full lang&long queury string or a false based on given POSTCODE
async function postcodeValidate(postcode) {
    if (postcoderegx.test(postcode)) {
        document.querySelector("#Status").innerHTML = "Status: Validating postcode"
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
            document.querySelector("#Status").innerHTML = "Invalid Postcode Enteredr"
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
    document.querySelector("#Status").innerHTML = "Status: Submitting variables to API"
    event.preventDefault(); // Prevents the default form submission behavior
    if(document.querySelector("#date").value) {
        document.querySelector("#Status").innerHTML = "Status: Date Selected"
        currentDate = document.querySelector("#date").value.substring(0,7)
    }
    postcode = document.getElementById("postcode").value;
    // Wait for the postcode validation to complete
    PostcodeData = await postcodeValidate(postcode);

    if (PostcodeData) {
        if (!CrimeSelected[0]) { // Checks that no crime or all Crimes is selected
            document.querySelector("#Status").innerHTML = "Status: Crime Selected"
            if (await PoliceDataFetch(false)) {
                PopulateTable(await QueryResponse)
            } else {
                console.log("Cannot output null data, failed to fetch")
            }

        } else {
            if (CrimeSelected[0]) { // Checks that some specific Crime is selected
                document.querySelector("#Status").innerHTML = "Status: Crime not Selected"
                if (await PoliceDataFetch(true)) {
                    PopulateTable(await QueryResponse)
                } else {
                    console.log("Cannot output null data, failed to fetch")
                }
            }
        }
    } else {
        alert("Please provide a valid postcode!");
    }
});
//Click will initiate all relevant functions to validate postcode, find lang & long of postcode, 


// Identify  Crime selected

document.querySelector("#Crime_Drop ul").addEventListener('click', function (a) {
    document.querySelector("#Status").innerHTML = "Status:  '".concat(a.target.innerHTML, " 'Selected" ) 
    CrimeSelected[0] = a.target.innerHTML;
    CrimeSelected[1] = a.target.id;

});
// Identify Crime selected


//All Police API Requests
async function PoliceDataFetch(CrimeFlag) {
    document.querySelector("#Status").innerHTML = "Status: Fetching Data"
    var QueryResponseRAW;
    try {
        if (CrimeFlag == true) {
            //console.log(PoliceAPI + "crimes-street/" + CrimeSelected[1] + "?&date=" + currentDate + "&lat=" + PostcodeData["latitude"].toString() + "&lng=" + PostcodeData["longitude"].toString())
            QueryResponseRAW = await fetch(PoliceAPI + "crimes-street/" + CrimeSelected[1] + "?&date=" + currentDate + "&lat=" + PostcodeData["latitude"].toString() + "&lng=" + PostcodeData["longitude"].toString());

        } else {
            QueryResponseRAW = await fetch(PoliceAPI + "crimes-street/all-crime?&date=" + currentDate + "&lat=" + PostcodeData["latitude"].toString() + "&lng=" + PostcodeData["longitude"].toString());
        };
        console.log("Fetch done")

        if (QueryResponseRAW) {
            QueryResponseRAW = await QueryResponseRAW.json();
            QueryResponse = QueryResponseRAW
            console.log(QueryResponse)
        }

        //then(PopulateTable(QueryResponse))
        return true
    } catch (error) {
        console.log("Failed to Fetch, Error: " + error);
        alert("Something went wrong, try again by reloading the page");
        return false;
    }
};
//All Police API Requests

function PopulateTable(data) {


    data.forEach(event => {
        document.querySelector("#Status").innerHTML = "Status: Populating Table"
            var data = [event.id || 'Missing Data', event.month || 'Missing Data', (event.location && event.location.street && event.location.street.name) || 'Missing Data', 
                        event.category || 'Missing Data', (event.outcome_status && event.outcome_status.category) || 'Missing Data'];


        let createTr = document.createElement("tr");
        try {
            document.querySelector("#outputTable tbody").appendChild(createTr).id = "API Data";
            for(let x = 0; x <= 4; x++){
                document.querySelector("#outputTable tbody:last-child tr:last-child ").appendChild(document.createElement("td")).innerHTML = data[x]
            }
        } catch (error) {
            document.querySelector("#Status").innerHTML = "Status: Catching errors within API data"
            console.log("Missing Data, Error " + error)

        };
        document.querySelector("#Status").innerHTML = "Status: Table populated, using date: ".concat(currentDate, ", Crime Selected: ", CrimeSelected[0], ", in area: ", postcode, );
    });
};