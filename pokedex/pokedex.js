(function() {
    "use strict";
    const BASE_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
    const MY_SERVER = "http://192.168.1.115:8888/pokedex/";
    let gameId = null;
    let playerId = null;
    let originalHp = null;

    let timer = null;

    window.addEventListener("load", function() {
        timer = setInterval(prepare, 1000);
    });

    function prepare() {
        if (pid != null && username != null) {
            clearInterval(timer);
            timer = null;
            init();
        }
    }

    function init() {
        makePokedex("pokedex-view").then(getPokemons);
        timer = setInterval(enableStartBtn, 500);

        $("flee-btn").addEventListener("click", flee);
        $("your-pokedex-btn").addEventListener("click", function() {
            backToMain(false);
        });
        $("pvp-battle-btn").addEventListener("click", function() {
            $("p1").classList.add("hidden");
            $("pokedex-view").classList.add("hidden");
            $("trade-view").classList.add("hidden");
            $("pvp-view").classList.remove("hidden");
        });
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
        console.log(error);
    }

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

    function enableStartBtn() {
        if (qs("#p1 .card .name").innerText != "Pokemon Name") {
            $("start-btn").classList.remove("hidden");
            $("start-btn").addEventListener("click", startGame);
            clearInterval(timer);
            timer = null;
        }   
    }

    function startGame() {
        $("pokedex-view").classList.add("hidden");
        $("menu-container").classList.add("hidden");
        $("p2").classList.remove("hidden");
        $("start-btn").classList.add("hidden");
        $("flee-btn").classList.remove("hidden");
        $("results-container").classList.remove("hidden");
        $("p1-turn-results").classList.remove("hidden");
        $("p2-turn-results").classList.remove("hidden");

        let p1Moves = qsa("#p1 .moves button");
        for (let i = 0; i < p1Moves.length; i++) {
            if (!p1Moves[i].classList.contains("hidden")) {
                p1Moves[i].disabled = false;
            }
        }

        qs("#p1 .hp-info").classList.remove("hidden");
        qs("body header h1").innerText = "Pokemon Battle Mode!";

        initGameStats();
    }

    function initGameStats() {
        let name = qs("#p1 .card .name").innerText.toLowerCase();
        let params = new FormData();
        params.append("startgame", true);
        params.append("mypokemon", name);
        fetch(BASE_URL + "game.php", {method: "POST", body: params})
            .then(checkStatus)
            .then(resp => resp.json())
            .then(processData)
            .catch(handleError);
    }

    // data - a json object returned from api that includes initial game data
    function processData(data) {
        gameId = data.guid;
        playerId = data.pid;
        display(data.p2, "#p2");

        let moveBtns = qsa("#p1 .moves button");
        for (let i = 0; i < moveBtns.length; i++) {
            let newBtn = moveBtns[i].cloneNode(true);
            qs("#p1 .moves").replaceChild(newBtn, moveBtns[i]);
            newBtn.addEventListener("click", function() {
                playMove(this);
            });
        }
    }

    function playMove(moveBtn) {
        $("loading").classList.remove("hidden");

        let movename = moveBtn.firstElementChild.innerText.toLowerCase().replace(" ", "");

        let params = new FormData();
        params.append("guid", gameId);
        params.append("pid", playerId);
        params.append("movename", movename);
        fetch(BASE_URL + "game.php", {method: "POST", body: params})
            .then(checkStatus)
            .then(resp => resp.json())
            .then(updateGameStats)
            .catch(handleError);
    }

    function updateGameStats(data) {
        $("loading").classList.add("hidden");
        $("p1-turn-results").innerText = "player 1 used " + data.results["p1-move"]
                                         + " and " + data.results["p1-result"] + "!";
        qs("#p1 .hp").innerText = data.p1["current-hp"];
        let pctHealth1 = data.p1["current-hp"] / data.p1.hp * 100;
        qs("#p1 .health-bar").style.width = pctHealth1 + "%";
        updateColor(pctHealth1, "#p1");
        clearBuffs("#p1");
        updateBuffs(data.p1.buffs, "#p1", "buff");
        updateBuffs(data.p1.debuffs, "#p1", "debuff");
        

        clearBuffs("#p2");
        updateBuffs(data.p2.buffs, "#p2", "buff");
        updateBuffs(data.p2.debuffs, "#p2", "debuff");
        qs("#p2 .hp").innerText = data.p2["current-hp"];
        let pctHealth2 = data.p2["current-hp"] / data.p2.hp * 100;
        qs("#p2 .health-bar").style.width = pctHealth2 + "%";
        updateColor(pctHealth2, "#p2");
        if (data.results["p2-move"] && data.results["p2-result"]) {
            $("p2-turn-results").innerText = "player 2 used " + data.results["p2-move"]
                                            + " and " + data.results["p2-result"] + "!";     
        } else {
            $("p2-turn-results").classList.add("hidden");
        }

        if (data.p1["current-hp"] === 0) {
            endGame(false);
        } else if (data.p2["current-hp"] === 0) {
            endGame(true);
        }
    }

    // won - boolean, true if the player won the game
    function endGame(won) {
        if (won) {
            qs("h1").innerText = "You won! >_<";
        } else {
            qs("h1").innerText = "You lost :(";
        }
        
        $("flee-btn").classList.add("hidden");
        $("endgame").classList.remove("hidden");
        let newBtn = $("endgame").cloneNode(true);
        $("results-container").replaceChild(newBtn, $("endgame"));
        $("endgame").addEventListener("click", function() {
            backToMain(won);
        });
    }

    // updates the health bar's color
    // pctHealth - a float that represents the current % of health left
    // pl - string that indicates the player
    function updateColor(pctHealth, pl) {
        if (pctHealth < 0.2) {
            qs(pl + " .health-bar").classList.add("low-health");
        } else {
            qs(pl + " .health-bar").classList.remove("low-health");
        }
    }

    // pl - string that indicates the player
    function clearBuffs(pl) {
        qs(pl + " .buffs").classList.remove("hidden");
        qs(pl + " .buffs").innerHTML = "";
    }

    function updateBuffs(buffs, pl, buffType) {
        for (let i = 0; i < buffs.length; i++) {
            let buff = document.createElement("div");
            buff.classList.add(buffs[i]);
            buff.classList.add(buffType);
            qs(pl + " .buffs").appendChild(buff);
        }
    }

    // won - boolean, true if the player won the game
    function backToMain(won) {
        $("pvp-view").classList.add("hidden");
        $("trade-view").classList.add("hidden");

        $("p1").classList.remove("hidden");
        $("endgame").classList.add("hidden");
        $("results-container").classList.add("hidden");
        $("p2").classList.add("hidden");
        $("start-btn").classList.remove("hidden");
        $("pokedex-view").classList.remove("hidden");
        $("menu-container").classList.remove("hidden");
        qs("#p1 .hp-info").classList.add("hidden");
        qs("h1").innerText = "Game Menu";

        $("p1-turn-results").innerText = "";
        $("p2-turn-results").innerText = "";

        qs("#p1 .health-bar").classList.remove("low-health");
        qs("#p1 .health-bar").style.width = "100%";
        qs("#p2 .health-bar").classList.remove("low-health");
        qs("#p2 .health-bar").style.width = "100%";

        qs("#p1 .hp").innerText = originalHp + "HP";
        clearBuffs("#p1");
        clearBuffs("#p2");
        gameId = null;
        playerId = null;

        let moveBtns = qsa("#p1 .moves button");
        for(let i = 0; i < moveBtns.length; i++) {
            moveBtns[i].disabled = true;
        }

        if (won) {
            let name = qs("#p2 .name").id;
            if (!$(name).classList.contains("found")) {
                addToPokedex(name);
                $(name).classList.add("found");
                $(name).addEventListener("click", showCard);
            }
        }
    }

    function flee() {
        let params = new FormData();
        params.append("guid", gameId);
        params.append("pid", playerId);
        params.append("movename", "flee");
        fetch(BASE_URL + "game.php", {method: "POST", body: params})
            .then(checkStatus)
            .then(resp => resp.json())
            .then(updateGameStats)
            .catch(handleError);
    }
  })();