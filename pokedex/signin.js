(function() {
    "use strict";

    const MY_SERVER = "http://192.168.1.115:8888/pokedex/";
    window.addEventListener("load", init);

    function init() {
        $("log-in-btn").addEventListener("click", logIn);
        $("sign-up-btn").addEventListener("click", signUp);    
    }
    function logIn() {
        changeView();
        qs("#sign-in-form p").innerText = "Log In";
        $("sign-in-form").addEventListener("submit", function(evt) {
            evt.preventDefault();
            submitSignIn("login.php");
        });
    }

    function signUp() {
        changeView();
        qs("#sign-in-form p").innerText = "Sign Up";
        $("sign-in-form").addEventListener("submit", function(evt) {
            // if we've gotten in here, all HTML5 validation checks have passed
            evt.preventDefault();
            submitSignIn("signup.php");
        });
    }

    function changeView() {
        $("sign-in-options").classList.add("hidden");
        $("log-in-btn").classList.add("hidden");
        $("sign-up-btn").classList.add("hidden");
        $("sign-in-form").classList.remove("hidden");
    }

    function submitSignIn(fileName) {
        let params = new FormData($("sign-in-form"));

        fetch(MY_SERVER + fileName, {method: "POST", body: params})
            .then(checkStatus)
            .then(resp => resp.json())
            .then(response)
            .catch(handleError);
    }

    function response(data) {
        if (data.status !== "success") {
            alert(data.message);
        } else {
            storeInfo(data);
            showMainPage();
        }
    }


    function storeInfo(data) {
        pid = data.pid;
        username = data.username;
    }
    function showMainPage() {
        $("sign-in-page").classList.add("hidden");
        $("main-page").classList.remove("hidden");
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
})();