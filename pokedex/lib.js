let pid = null;
let username = null;
let fetchCallComplete = false;

const MY_SERVER = "http://192.168.1.115:8888/pokedex/";
const BASE_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";


// populates the initial version of pokedex where no pokemons are found
// dex - string, id of the pokedex to populate
function makePokedex(dex) {
    $(dex).innerHTML = "";      // clears the existing content in the given dex
    return fetch(BASE_URL + "pokedex.php?pokedex=all")
        .then(checkStatus)
        .then(resp => resp.text())
        .then(data => genImages(data, dex))
        .catch(handleError);
}


// data - text data retrieved from api
function genImages(data, dex) {
    data += "\n";
    while (data.indexOf(":") !== -1) {
        let image = create("img");
        let name  = data.substring(data.indexOf(":")+1, data.indexOf("\n"));
        image.src = BASE_URL + "sprites/" + name + ".png";
        image.id = name;
        image.classList.add("sprite");
        $(dex).appendChild(image);
        data = data.substring(data.indexOf("\n") + 1);
    }
}

// add a new found pokemon into the pokedex database
function addToPokedex(name) {
    let params = new FormData();
    params.append("pid", pid);
    params.append("name", name);
    fetch(MY_SERVER + "insert.php", {method: "POST", body: params})
        .then(checkStatus)
        .then(resp => resp.json())
        .then(showResults)
        .catch(handleError);
}

function showResults(data) {
    if (data.status == "success") {
        alert(data.message);
    }
}

// get and displays all users for a given dropdown menu
// menu - string, name of the given dropdown menu
function getUsers(menu) {
    fetch(MY_SERVER + "users.php?myPid=" + pid)
        .then(checkStatus)
        .then(resp => resp.json())
        .then(data => {
            displayUsers(menu, data);
        })
        .catch(handleError);
}

// display usernames from the given data on the given menu id
function displayUsers(menu, data) {
    $(menu).innerHTML = "";     // first clears the existing menu
    let users = data.usernames;
    let ids = data.pids;
    for (let i = 0; i < users.length; i++) {
        let option = document.createElement("option");
        option.value = ids[i];
        option.innerText = users[i];
        $(menu).appendChild(option);
    }
}

// get pokemons for pokedex-view ONLY
function getPokemons() {
    fetch(MY_SERVER + "retrieve.php?pid=" + pid)
        .then(checkStatus)
        .then(resp => resp.json())
        .then(labelCards)
        .catch(handleError);
}

function labelCards(data) {
    let foundPkms = data.pokemons;
    for (let i = 0; i < foundPkms.length; i++) {
        $(foundPkms[i]).classList.add("found");
        $(foundPkms[i]).addEventListener("click", showCard);
    }
}

function showCard() {
    fetch(BASE_URL + "pokedex.php?pokemon=" + this.id)
        .then(checkStatus)
        .then(resp => resp.json())
        .then(displayInfo)
        .catch(handleError);
}

function displayInfo(info) {
    display(info, "#p1");
}

// info - json object that includes info of a pokemon retrieved from api
// pl - string that represents the player
function display(info, pl) {
    if (pl === "#p1") {
        originalHp = info.hp;
    }
    qs(pl + " .card .name").innerText = info.name;
    qs(pl + " .card .name").id = info.shortname;
    qs(pl + " .pokepic").src = BASE_URL + info.images.photo;
    qs(pl + " .type").src = BASE_URL + info.images.typeIcon;
    qs(pl + " .weakness").src = BASE_URL + info.images.weaknessIcon;
    qs(pl + " .hp").innerText = info.hp + "HP";
    let entry = info.info.description;
    if (entry.includes("favorite")) {
        if (entry.indexOf("!") !== -1) {
            entry = entry.substring(entry.indexOf("!") + 2);
        } else {
            entry = entry.substring(entry.indexOf(".") + 2);
        }
    }
    qs(pl + " .info").innerText = entry;

    let moveBtns = qsa(pl + " .moves button");
    for (let i = 0; i < moveBtns.length; i++) {
        if (i < info.moves.length) {
            moveBtns[i].classList.remove("hidden");
            let moveDetails = moveBtns[i].children;
            for (let j = 0; j < moveDetails.length; j++) {
                if (moveDetails[j].classList.contains("move")) {
                    moveDetails[j].innerText = info.moves[i].name;
                } else if (moveDetails[j].classList.contains("dp")) {
                    if ("dp" in info.moves[i]) {
                        moveDetails[j].innerText = info.moves[i].dp;
                    } else {
                        moveDetails[j].innerText = "";
                    }
                     
                } else if (moveDetails[j].tagName === "IMG") {
                    moveDetails[j].src = BASE_URL + "icons/" + info.moves[i].type + ".jpg";
                }
            }
        } else {
            moveBtns[i].classList.add("hidden");
        }
    }  
}


// check whether the response from a fetch request is valid
// return - boolean
function checkStatus(response) {
    if (!response.ok) {
        throw Error("Error in request: " + response.statusText);
    }
    return response;
}

function handleError(error) {
    alert(error);
}
/*--------------------------------------helper methods--------------------------------------------*/
    
// id - string
// return - node object
function $(id) {
    return document.getElementById(id);
}

// query - string
// return - node object
function qs(query) {
    return document.querySelector(query);
} 

// query - string
// return - an array of node objects
function qsa(query) {
    return document.querySelectorAll(query);
}

// tagName - string that represents the tag name of the element to be created
// return - node object
function create(tagName) {
    return document.createElement(tagName);
}