# Web-Games


## Summary

Welcome! This is a collection of the web games I developed using JavaScript and PHP. The Pokedex Game is a server based card game where players can encounter, fight, and collect wild Pokemons and interact with one another through real-time trading. The Stick Figure Game is a keyboard based action game wherein the players fights against a computer controlled stick figure. It also supports users to teach the computer to be better at playing the game.


### Pokedex Game

**Please note that the pvp section (battle another trainer) of the game is currently unavailable as I'm still developing its code**

This game is inspired by a UW [CSE 154](https://courses.cs.washington.edu/courses/cse154/20sp/index.html) course assignment.
Similar to that assignment, the game uses an [API](https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/) provided by the UW CSE department and allows players to battle and collect different Pokemons in the original Kanto Pokedex.

However, unlike the original assignment, this game is run on a server and allows real-time interactions between players.

To set up the game, you will have to
  1. set up a local server on your computer
  2. set up the database using pokedex.sql
  3. open common.php and adjust the variables for connections to the database
  4. open lib.js and change value of MY_SERVER to be the url of your local server
  
  
![Pokedex View](/screenshots/pokedex-view.png)

Once you've logged into the game, you'll see a pokedex. The colored icons represent the Pokemons you have found while all the other black icons are Pokemons that you yet have to unlock. You can click on any of the colored icons to see the name, typing, moves, Hp, and Pokedex entry of the Pokemon.

![Battle View](/screenshots/battle-view.png)

Once you click the "choose this pokemon!" button on the bottom left corner, you will encounter a random wild Pokemon and enter Pokemon battle mode. Click on any move buttons to use move. Each move either does a certain amount of damage or applies a buff/debuff to the Pokemon itself or its opponent. After you win the battle, the Pokemon you battled with will be registered to your Pokedex! Your progress will be automatically saved.


To trade with another player, simply click on the "trade pokemon" button. There, you can either view the current trades proposals both to you and made by you, or you can request a new trade with another player. A new trade will be proposed once you click on the "request trade" button and the trade will be completed once the other player chooses either to accept or decline your proposal. Your Pokedex will be updated once a proposal is accepted.

![View Proposals](/screenshots/view-proposals.png)

![Request Trade](/screenshots/request-trade.png)




### Stick Figure Game
In this game, you will control a blue stick figure and fight with a red stick figure controlled by the computer. The battle starts once the the page is loaded.
Press A and D to move the figure left or right. Press W to jump and press Space to fire a fireball. A stick figure declared victory once it hits the other stick figure with five fireballs.

![Stick Figure Fight](/screenshots/stick-figure.png)

To train the computer to be better at playing this game, you will first have to
  1. uncomment `<script src="ml.js" type="text/javascript"></script>` at line 12 in index.html
  2. uncomment function gatherData (line 90-94) and all its function calls (line 28, 47, 73, and 82) in blue.js
  3. uncomment line 33-35 in lib.js (code shown below)
  ```
        let inputData = getInputData(top, left, direction, opponent);
        let outputData = getOutputData(3);
        data.push({input: inputData, output: outputData});
  ```
  4. change set the hp of each stick figure to 50 (or something bigger) in order to gather enough training data; you can do this by changing `figure.setAttribute("data-hp", 5);` (line 13 in lib.js) to `figure.setAttribute("data-hp", 50);`
  5. play the game again; after the game ends the computer will train an ANN network using the recorded data; please be patient as it will take some time
  6. once training is completed, the browser will download a file that contains the stringified version of the trained model
  7. copy and paste the stringified model to net.js (replace the empty curly braces with this string)
  8. in index.html, comment out `<script src="red.js" type="text/javascript"></script>` and `<script src="ml.js" type="text/javascript"></script>`, and uncomment `<script src="net.js" type="text/javascript"></script>` and `<script src="red-ml.js" type="text/javascript"></script>`
  9. set the hp of each stick figure back to 5; comment out line 28, 47, 73, 82, and 90-94 in blue.js; comment out line 33-35 in lib.js
  10. play the game again and see how the computer performs!

*The current ANN model is a relatively inefficient way of training the computer to play an action game like this. I'm working on improving this part by utilizing an RNN model or by unsupervised learning.*
  
