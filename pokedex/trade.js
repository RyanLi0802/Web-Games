(function() {
    "use strict";

    const MY_SERVER = "http://192.168.1.115:8888/pokedex/";
    let polling1 = false;       // await proposals by you
    let polling2 = false;       // await proposals to you
    let polling3 = false;       // await results

    window.addEventListener("load", function() {
        $("trade-btn").addEventListener("click", showPage);
    });

    function showPage() {
        $("p1").classList.add("hidden");
        $("pokedex-view").classList.add("hidden");
        $("pvp-view").classList.add("hidden");
        $("trade-view").classList.remove("hidden");

        if (!polling1) {
            awaitProposals("by-you");
        }
        if (!polling2) {
            awaitProposals("to-you");
        }
        if (!polling3) {
            awaitResults();
        }

        qs("#by-you .results-table").innerHTML = "no proposals available";
        qs("#to-you .results-table").innerHTML = "no proposals available";
        
        $("view-proposals").addEventListener("click", function() {
            $("current-proposals-view").classList.remove("hidden");
            $("new-proposal-view").classList.add("hidden");
        })

        $("propose").removeEventListener("click", propose);
        $("propose").addEventListener("click", propose);
    }

    function propose() {
        $("current-proposals-view").classList.add("hidden");
        $("new-proposal-view").classList.remove("hidden");

        $("propose-submit").disabled = true;
        $("users").disabled = false;

        getUsers("users");

        $("show-dex").removeEventListener("click", showPokedices);
        $("show-dex").addEventListener("click", showPokedices);
    }

    function showPokedices() {
        $("users").disabled = true;
        qs("#trade-view .part-iv").classList.remove("hidden");

        makePokedex("my-pokemon").then(function() {
            showPokemons(pid, "my-pokemon");
        });
        makePokedex("their-pokemon").then(function() {
            showPokemons($("users").value, "their-pokemon");
        });

        $("propose-submit").disabled = false;
        $("propose-submit").removeEventListener("click", submitProposal);
        $("propose-submit").addEventListener("click", submitProposal);
        }

    function showPokemons(playerId, pokedex) {
        fetch(MY_SERVER + "retrieve.php?pid=" + playerId)
            .then(checkStatus)
            .then(resp => resp.json())
            .then(data => {
                let foundPkms = data.pokemons;
                for (let i = 0; i < foundPkms.length; i++) {
                    qs("#" + pokedex + " #" + foundPkms[i]).classList.add("found");
                    if(pokedex == "my-pokemon") {
                        qs("#" + pokedex + " #" + foundPkms[i]).addEventListener("click", function() {
                            $("offer").innerText = this.id;
                        });
                    } else if (pokedex == "their-pokemon") {
                        qs("#" + pokedex + " #" + foundPkms[i]).addEventListener("click", function() {
                            $("request").innerText = this.id;
                        });
                    }
                }
            });
    }

    // listens for propalsals via long polling, displays any new proposals
    //  to the result table within the given div
    //
    // divName - string, either "by-you" or "to-you"
    // tids - array, array of tids returned from the previous call
    function awaitProposals(divName, tids) {
        let column = null;
        if (divName == "by-you") {
            polling1 = true;
            column = "from_pid";
        } else {
            polling2 = true;
            column = "to_pid";
        }

        let params = new FormData();
        params.append("column", column);
        params.append("pid", pid);
        if (tids != null) {
            for (let i = 0; i < tids.length; i++) {
                params.append("tids[]", tids[i]);
            }
        }
        fetch(MY_SERVER + "trade-list.php", {method: "POST", body: params})
            .then(checkStatus)
            .then(resp => resp.json())
            .then(data => {
                displayTable(divName, data);
            })
            .catch(handleError);
    }

    function displayTable(divName, data) {
        let tids = new Array();
        let table = "#" + divName + " .results-table";

        if (data.length > 0) {
            qs(table).innerHTML = "<tr> <th>From</th> <th>To</th> <th>Offer</th> <th>Request</th> </tr>";
        } else {
            qs(table).innerHTML = "no proposals available";
        }

        for (let i = 0; i < data.length; i++) {
            let proposal = document.createElement("tr");
            proposal.id = data[i].tid;
            tids.push(data[i].tid);

            let td1 = document.createElement("td");
            td1.innerText = data[i]["from-player"];

            let td2 = document.createElement("td");
            td2.innerText = data[i]["to-player"];

            let td3 = document.createElement("td");
            td3.innerText = data[i].offer;

            let td4 = document.createElement("td");
            td4.innerText = data[i].request;

            proposal.appendChild(td1);
            proposal.appendChild(td2);
            proposal.appendChild(td3);
            proposal.appendChild(td4);

            if (divName == "to-you") {
                appendBtns(proposal);
            }

            qs(table).appendChild(proposal);
        }

        // after the table is populated, listen for new proposals with the current list
        //  of trade ids unless trade view is hidden
        if ($("trade-view").classList.contains("hidden")) {
            if (divName == "by-you") {
                polling1 = false;
            } else {
                polling2 = false;
            }
            return;
        }
        awaitProposals(divName, tids);
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
        // console.log(error);
        alert(error);
    }


    function appendBtns(proposal) {
        let accept = document.createElement("td");
        let decline = document.createElement("td");
        let acceptBtn = document.createElement("button");
        let declineBtn = document.createElement("button");
        
        acceptBtn.classList.add("small-btn");
        acceptBtn.innerText = "accept";
        acceptBtn.addEventListener("click", function() {
            if (confirm("Do you want to accept this trade proposal?")) {
                completeTrade(true, proposal.id);
            }
        });

        declineBtn.classList.add("small-btn");
        declineBtn.innerText = "decline";
        declineBtn.addEventListener("click", function() {
            if (confirm("Do you want to decline this trade proposal?")) {
                completeTrade(false, proposal.id);
            }
        });

        accept.appendChild(acceptBtn);
        decline.appendChild(declineBtn);
        proposal.appendChild(accept);
        proposal.appendChild(decline);
    }

    function submitProposal() {
        if ($("offer").innerText == "" || $("request").innerText == "") {
            alert("Missing Pokemons.\n Please complete the proposal before requesting a trade!");
        } else {
            qs("#trade-view .part-iv").classList.add("hidden");
            $("new-proposal-view").classList.add("hidden");
            
            let params = new FormData();
            params.append("pid1", pid);
            params.append("pid2", $("users").value);
            params.append("offer", $("offer").innerText);
            params.append("request", $("request").innerText);
            fetch(MY_SERVER + "propose.php", {method: "POST", body: params})
                .then(checkStatus)
                .then(resp => resp.json())
                .then(data => {
                    if (data.status == "success") {
                        alert(data.message);
                    }
                })
                .catch(handleError);

            $("offer").innerText = "";
            $("request").innerText = "";
        }
    }

    // accept-boolean, whether or not a trade was accepted
    function completeTrade(accept, tid) {
        let params = new FormData();
        params.append("tid", tid);
        params.append("accept", accept);

        fetch(MY_SERVER + "complete-trade.php", {method: "POST", body: params})
            .then(checkStatus)
            .then(resp => resp.json())
            .then(data => {
                if (data.status == "success") {
                    $(data.offer).classList.add("found");
                    $(data.offer).addEventListener("click", showCard);

                    $(data.request).classList.remove("found");
                    $(data.request).removeEventListener("click", showCard);
                } 
                alert(data.message);
            })
            .catch(handleError);
    }

    function awaitResults() {
        polling3 = true;
        let params = new FormData();
        params.append("pid", pid);
        fetch(MY_SERVER + "trade-results.php", {method: "POST", body: params})
            .then(checkStatus)
            .then(resp => resp.json())
            .then(data => {
                if (data.status == "accept") {
                    makePokedex("pokedex-view").then(getPokemons);
                }
                alert(data.message);

                if ($("trade-view").classList.contains("hidden")) {
                    polling3 = false;
                    return;
                }
                awaitResults();
            })
    }
})();