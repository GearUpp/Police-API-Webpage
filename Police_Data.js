let postcode = ["S", "W", "1", "A", "2", "A", "A"];
let PoliceAPI = "https://data.police.uk/api/"
let PostcodeAPI = "api.postcodes.io/postcodes/"
var postcoderegx = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
let data = "";

async function query() {
    let outputRAW = await fetch(PoliceAPI + "forces");

    if (!outputRAW.ok) { throw new error("Unable to contact Police API"); };
    data = await outputRAW.json();

    console.log("Data pulled for /forces ");
    //console.log(data);
    populateDropMenu();
};
// calls function that auto populates dropdown menu


function populateDropMenu() {
    data.forEach(force => {
        let createLI = document.createElement("li");
        let createA = document.createElement("a");
        createA.href = "#";
        //createA.href = force.id;


        document.querySelector("div ul:last-child").appendChild(createLI).appendChild(createA).className = "dropdown-item";
        document.querySelector(".dropdown-menu li:last-child a").innerHTML = force.name;
    });
}
query();


async function postcodeValidate(postcode_input) {
    let postcode_data = await fetch("https://api.postcodes.io/postcodes/" + postcode_input );
    data = await postcode_data.json();
    console.log(postcode_data);
}

document.querySelector("#Submit").addEventListener("click", function () {
    input = document.getElementById("postcode").value;
    if (input.match(postcoderegx)) {
    postcodeValidate(input);
    } else {
        alert("Invalid Postcode format. Example: 'NE14 7AA'");
    };

});


//https://data.police.uk/api/forces