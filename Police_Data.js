let postcode = "";
let PoliceAPI = "https://data.police.uk/api/"  //API for police data
let PostcodeAPI = "api.postcodes.io/postcodes/" //API for getting postcode data
var postcoderegx = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
let currentDate = (new Date().getFullYear() + "-" + (new Date().getMonth() - 1)); // Get month and Year only
let PostcodeData = ""; //Postcode.io API var to all postcode related data from the API
let crimeList = "";
let CrimeSelected = []; //DropDown Selection var [Name , url]
let QueryResponse; //Full data response from Police API Request

//Limit how close to current date user can select as data is rarely very up to date, 2 month lag

//Map Area

var map = L.map('map').setView([53.38, -2.7], 5);


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
//Map Area

function filter() {
    document.querySelector(".leaflet-shadow-pane").style.display = "none"; // hides markers shadows to deuglify the map
    var idSearch, idRow, streetRow, streetSearch;
    idSearch = document.querySelector("#idFilter").value.toString().toUpperCase();
    
    idRow = 0;

    streetSearch = document.querySelector("#streetFilter").value.toString().toUpperCase();
    streetRow = 2;

    var table = document.querySelector("#outputTable tbody");
    var tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        var idText = tr[i].childNodes[idRow].innerHTML.toString().toUpperCase() || tr[i].childNodes[idRow].innnerText.toString().toUpperCase();
        var streetText = tr[i].childNodes[streetRow].innerHTML.toString().toUpperCase() || tr[i].childNodes[streetRow].innnerText.toString().toUpperCase();
        if (idText.indexOf(idSearch) > -1 &&  streetText.indexOf(streetSearch) > -1) {
            tr[i].style.display = "";
            console.log(idText.toString());
            document.querySelector("img[title='".concat(idText.toString(), "'")).style.display = ""; // Marker Image show
        } else {
            tr[i].style.display = "none";
            document.querySelector("img[title='".concat(idText.toString(), "'")).style.display = "none";// Marker Image hide
            
        };
        console.log("idText: "+ idText + " idSearch: " + idSearch + "idSearch: "+ idSearch)
    };
};


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
            
            PostcodeData = { "latitude": PostcodeData_Raw.result.latitude, "longitude": PostcodeData_Raw.result.longitude };
            map.setView([PostcodeData.latitude,PostcodeData.longitude], 13);
            return PostcodeData;
        } else {

            alert("Postcode " + postcode + " is invalid according to postcodes.io !");
            document.querySelector("#Status").innerHTML = "Invalid Postcode Enteredr"
            return false

        }

    } else {
        console.log("Invalid Postcode Format")
        document.querySelector("#Status").innerHTML = "Status: Invalid postcode entered."
        return false
    }

}
//validates and returns either full lang&long queury string or a false based on given POSTCODE



//Click will initiate all relevant functions to validate postcode, find lang & long of postcode, 
document.querySelector("#Submit").addEventListener("click", async function (event) {

    document.querySelector("#Status").innerHTML = "Status: Submitting variables to API"
    event.preventDefault(); // Prevents the default form submission behavior

    if (document.querySelector("#date").value) {
        document.querySelector("#Status").innerHTML = "Status: Date Selected"
        currentDate = document.querySelector("#date").value.substring(0, 7)
    }

    postcode = document.getElementById("postcode").value;
    // Wait for the postcode validation to complete
    PostcodeData = await postcodeValidate(postcode);

    if (PostcodeData) {

        if (!CrimeSelected[0]) { // Checks that no crime or all Crimes is selected

            document.querySelector("#Status").innerHTML = "Status: Crime Selected"
            if (await PoliceDataFetch(false)) {
                PopulateTable(await QueryResponse)
            }

        } else {
            if (CrimeSelected[0]) { // Checks that some specific Crime is selected

                document.querySelector("#Status").innerHTML = "Status: Crime not Selected"
                if (await PoliceDataFetch(true)) {
                    PopulateTable(await QueryResponse)
                }
            }
        }
    } else {
        alert("Please provide a valid postcode!");
    }
});
//Click will initiate all relevant functions to validate postcode, find lang & long of postcode, 


// Identify  Crime selected

document.querySelector("ul").addEventListener('click', function (a) {
    document.querySelector("#Status").innerHTML = "Status:  '".concat(a.target.innerHTML, " 'Selected")
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
        console.log("Fetch done");
        document.querySelector("#Status").innerHTML = "Status: Fetching Done."
        if (QueryResponseRAW.status = 200) {
            try {
                QueryResponseRAW = await QueryResponseRAW.json();
                QueryResponse = QueryResponseRAW
                
            } catch (error) {
                console.log("Failed to extract API data, Error: " + error);
                document.querySelector("#Status").innerHTML = "Status: Failed to extract data from Police API."
            }

        } else {
            console.log("Failed to extract API data, return code: " + QueryResponseRAW.status);
            document.querySelector("#Status").innerHTML = "Status: Failed to fetch data from Police API. "
            return false
        }

        //then(PopulateTable(QueryResponse))
        return true
    } catch (error) {
        console.log("Failed to Fetch, Error: " + error);
        document.querySelector("#Status").innerHTML = "Status: Failed to fetch data from Police API."

        return false;
    }
};
//All Police API Requests

function PopulateTable(data) {

    if(data.length == 0){ //Important check to see if their is any data avalible from the API, ussually means the data is not yet avalible for this date 
        document.querySelector("#Status").innerHTML = "Status: No data yet for the ".concat(document.querySelector("#date").value);
        return
    };
    let i; // Will be used to give each marker on the map the event id as title.

    data.forEach(event => {
        var jitter = (Math.round((Math.random() * 10)) / 105000); // used to move around all markers slightly to give spacing (make devisible number bigger for a smaller jitter)
        document.querySelector("#Status").innerHTML = "Status: Populating Table"
        var data = [event.id || 'Data Missing', event.month || 'Data Missing', (event.location && event.location.street && event.location.street.name) || 'Data Missing',
        event.category || 'Data Missing', (event.outcome_status && event.outcome_status.category) || 'Data Missing']; // Creates an array and fills gaps to prevent breaking of the table population function below
        i = event.id
        
        var createTr = document.createElement("tr");
        try {
            var eventmarkerLat = Number(event.location.latitude) + jitter;
            var eventmarkerLon = Number(event.location.longitude) + jitter;
            

            var eventInfo = "<h2> Event ID: ".concat(data[0], "</h2>" , "<p id='marker'>" , data[3] , " happened " , data[2] , " on the " , data[1] , ",<b> Conclusion: </b>", data[4], "</p");
            L.marker([eventmarkerLat, eventmarkerLon],{ title: i.toString()} ).addTo(map).bindPopup(eventInfo);
            //document.querySelector
            document.querySelector("#outputTable tbody").appendChild(createTr).id = "API Data";
            for (let x = 0; x <= 4; x++) { //loops thought 5 table rows, using x to populate table with the var data
                document.querySelector("#outputTable tbody:last-child tr:last-child ").appendChild(document.createElement("td")).innerHTML = data[x]
            }
        } catch (error) {
            document.querySelector("#Status").innerHTML = "Status: Catching errors within API data"
            console.log("Data Missing, Error " + error)

        };
        document.querySelector("#Status").innerHTML = "Status: Table Filled, date used: ".concat(currentDate, ", Crime Selected: ", CrimeSelected[0], ", in: ", postcode,);
    });
};