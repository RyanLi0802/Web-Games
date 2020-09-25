// const kd = require("./keydrown");

(function() {
    "use strict";

    let jumpTime = 0;
    let jumpTimer = null;
    let direction = 1;  // right -> 1, left -> 0
    let top, left;
    let coolDown = false;

    window.addEventListener("load", main);

    function main() {
        createFigure("red");
        const net = new brain.NeuralNetwork();
        net.fromJSON(model);

      // make sure the image is loaded before recoding its position
      $("red").addEventListener("load", function() {
        left = $("red").offsetLeft;
        top = $("red").offsetTop;

        let timer = setInterval(function() {
            let output = net.run(getInputData(top, left, direction, $("blue")));
            let outputArray = [Math.round(output[0]), Math.round(output[1]), 
                               Math.round(output[2]), Math.round(output[3])];
            switch (1) {
                case outputArray[3]:
                    if (!coolDown) {
                        coolDown = true;
                        fire("red", top, left, direction);
                        setTimeout(function() {
                            coolDown = false;
                        }, 500);
                    }
                    break;
                case outputArray[2]:
                    jump();
                    break;
                case outputArray[1]:
                      moveRight();
                      break;
                case outputArray[0]:
                    moveLeft();
                    break; 
            }
        }, 16);
      });
      
    }



    function jump() {
        if (jumpTimer == null) {
          jumpTimer = setInterval(makeJump, 50);
        }
      }
  
  
      function makeJump() {
        if (jumpTime > 10) {
          clearInterval(jumpTimer);
          jumpTimer = null;
          jumpTime = 0;
        } else {
          let diff = Math.pow(jumpTime - 5, 2) * 6;
          if (jumpTime < 5) {
            top -= diff;
          } else if (jumpTime > 5) {
            top += diff;
          }
          $("red").style.top = top + "px";
          jumpTime++;
        } 
      }
  
  
      function moveLeft() {
        direction = 0;
        if (left > 0) {
          left -= 5;
          $("red").style.left = left + "px";
        }
      }
  
      function moveRight() {
        direction = 1;
        if (left < $("game-frame").clientWidth - figureWidth) {
          left += 5;
          $("red").style.left = left + "px";
        }
      }

  })();