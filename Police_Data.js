let postcode = "";
let PoliceAPI = "https://data.police.uk/api/"  //API for police data
let PostcodeAPI = "api.postcodes.io/postcodes/" //API for getting postcode data
var postcoderegx = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
let PostcodeData = ""; //Postcode.io API var to all postcode related data from the API
let PoliceData = ""; // Police Force Get request for all forces names request var
let crimeList = "";
let ForceSelected = ""; //DropDown Selection var


let test = "";
async function query() {
    let outputRAW = await fetch(PoliceAPI + "forces");
    let crimeRaw = await fetch(PoliceAPI + "crime-categories");

    if (!outputRAW.ok || !crimeRaw.ok) { throw new error("Unable to contact Police API"); };
    PoliceData = await outputRAW.json();
    crimeList = await crimeRaw.json();

    console.log("Data pulled for /forces ");
    //console.log(data);
    populateDropMenu();
};
// calls function that auto populates dropdown menu


function populateDropMenu() {
    crimeList.forEach(crime => {
        let createLI = document.createElement("li");
        let createA = document.createElement("a");

        document.querySelector()
    });
    PoliceData.forEach(force => {
        let createLI = document.createElement("li");
        let createA = document.createElement("a");
        createA.href = "#";
        //createA.href = force.id;

        document.querySelector("div ul:last-child").appendChild(createLI).appendChild(createA).className = "dropdown-item";
        document.querySelector(".dropdown-menu li:last-child a").innerHTML = force.name;
    });
}
query();

//validates and returns either full lang&long queury string or a false based on given POSTCODE
async function postcodeValidate(postcode_input) {
    let postcode_data = await fetch("https://api.postcodes.io/postcodes/" + postcode_input);
    PostcodeData = await postcode_data.json();
    //console.log(PostcodeData);
    if (PostcodeData.error) {
        alert("Postcode " + postcode_input + " is invalid according to postcodes.io !");
        return false;
    } else {
        //Returns formated lang and long for postcode ready to be inserted into any Police data API
        return ("lat=" + toString(PostcodeData.status["latitude"]) + "&lng=" + toString(PostcodeData.status["longitude"]));
    }
}

//Click will initiate all relevant functions to validate postcode, find lang & long of postcode, 
document.querySelector("#Submit").addEventListener("click", function () {
    postcode = document.getElementById("postcode").value;

    //Verifies either Postcode or Force is selected, then checks data is valid in both cases
    if (postcode || ForceSelected) {
        if (postcode) {
            if (postcode.match(postcoderegx) && postcodeValidate(postcode)) {
                //Search based on postcode only

                console.log("Valid Postcode and has lat and logn");
            } else {
                alert("Invalid Postcode format. Example: 'NE14 7AA'");
            }
        };
        if (ForceSelected) {
            //Searcg based on Police Force Only
            
        }
    } else {
        alert("You must enter a postcode or select a police force.");
    };







});

document.querySelector("ul").addEventListener('click', function (a) {
    ForceSelected = a.target.innerHTML;
});


//https://data.police.uk/api/forces