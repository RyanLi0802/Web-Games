const figureWidth = 50; // each stick figure is 50px wide
let endGame = false;
let data = [];


// name - string, name of the figure (either 'red' or 'blue')
function createFigure(name) {
    let figure = document.createElement("IMG");
    figure.src = "img/" + name + ".png";
    figure.classList.add("figure");
    figure.style.bottom = "0px";
    figure.id = name;
    figure.setAttribute("data-hp", 5);

    if (name == "blue") {
        figure.style.left = "80%";
    } else {
        figure.style.left = "20%";
    }
    $("game-frame").appendChild(figure);
}


// figure - string, either red or blue
// top - int, the top position of the figure
// left - int, the left position of the figure
// direction - int, the direction the figure's facing (0 -> left, 1 -> right)
function fire(figure, top, left, direction) {
    let opponent, imgName;
    if (figure == "blue") {
        opponent = $("red");
        imgName = "fireball1";
        // let inputData = getInputData(top, left, direction, opponent);
        // let outputData = getOutputData(3);
        // data.push({input: inputData, output: outputData});
    } else {
        opponent = $("blue");
        imgName = "fireball2";
    }

    let ball = document.createElement("IMG");
    ball.src = "img/" + imgName + ".png";
    ball.classList.add("fireball");
    ball.classList.add(imgName);
    
    // default direction of a fireball is to the right
    if (direction == 0) {
        ball.classList.add("inverse");
        ball.style.left = left - figureWidth + "px";
    } else {
        ball.style.left = left + figureWidth + "px";
    }

    ball.style.top = top + 10 + "px";
    $("game-frame").appendChild(ball);
    
    ball.addEventListener("load", function() {
        if (ball.classList.contains("fireball")) {
            let timer = setInterval(() => {
                if (endGame) {
                    clearInterval(timer);
                } else if (overlap(ball, opponent)) {
                    clearInterval(timer);
                    ball.classList.remove("fireball");
                    exploded = true;
                    if (opponent.getAttribute("data-hp") == 1) {
                        endGame = true;
                        opponent.remove();
                        ball.src = "img/bang.png";
                        ball.classList.add("bang");
                        $("board").innerHTML = figure + " wins!";
                    } else {
                        opponent.setAttribute("data-hp", opponent.getAttribute("data-hp") - 1);
                        ball.src = "img/boom.png";
                        ball.classList.add("boom");
                        setTimeout(() => {ball.remove();}, 500);
                    }
                } else if (direction == 0) {
                    if (parseInt(ball.style.left) <= 0) {
                        clearInterval(timer);
                        ball.remove();
                    } else {
                        ball.style.left = parseInt(ball.style.left) - 10 + "px";
                    }
                } else {
                    if (parseInt(ball.style.left) >= $("game-frame").clientWidth - ball.clientWidth) {
                        clearInterval(timer);
                        ball.remove();
                    } else {
                        ball.style.left = parseInt(ball.style.left) + 10 + "px";
                    }
                }
            }, 20);
        }
    });
}


// gathers input data
// opponent - dom element that represents the opponent.
function getInputData(top, left, direction, opponent) {
    // [x, y] & direction of four fireballs, [x, y] of the opponent, [x, y] and direction of the player
    let inputData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let fireballs = qsa(".fireball2");
    let index = 0;
    let length = (fireballs.length < 4) ? fireballs.length : 4;
    for (let i = 0; i < length; i++) {
        inputData[index] = fireballs[i].offsetLeft / 1000;
        inputData[index + 1] = fireballs[i].offsetTop / 1000;
        inputData[index + 2] = fireballs[i].classList.contains(".inverse") ? 0 : 1;
        index += 3;
    }

    inputData[12] = opponent.offsetLeft / 1000;
    inputData[13] = opponent.offsetTop / 1000;
    inputData[14] = left / 1000;
    inputData[15] = top / 1000;
    inputData[16] = direction;

    return inputData;
}


// gathers output training data
// action - an int that represents the action made by the player;
//          move left --> 0, move right --> 1, jump --> 2, fire --> 3
function getOutputData(action) {
    let outputData = [0, 0, 0, 0];
    outputData[action] = 1;
    return outputData;
}


function overlap(elem1, elem2) {
    let rect1 = elem1.getBoundingClientRect();
    let rect2 = elem2.getBoundingClientRect();
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

/*---------------------------------------helper functions---------------------------------------- */
function qs(query) {
    return document.querySelector(query);
}

function $(id) {
    return document.getElementById(id);
}

// query - string
// return - an array of node objects
function qsa(query) {
    return document.querySelectorAll(query);
}