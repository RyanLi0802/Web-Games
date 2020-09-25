// const kd = require("./keydrown");

(function() {
    "use strict";

    let jumpTime = 0;
    let jumpTimer = null;
    let coolDown = false;
    let direction = 0;  // right -> 1, left -> 0
    let top, left;

    window.addEventListener("load", main);

    function main() {
      createFigure("blue");

      // make sure the image is loaded before recoding its position
      $("blue").addEventListener("load", function() {
        left = $("blue").offsetLeft;
        top = $("blue").offsetTop;
      });
      
      
      kd.W.down(jump);
      kd.A.down(moveLeft);
      kd.D.down(moveRight);
      kd.SPACE.press(function() {
        // gatherData(3);
        if (!coolDown) {
          coolDown = true;
          fire("blue", top, left, direction);
          setTimeout(function() {
            coolDown = false;
          }, 500);
        }
      });

      kd.run(function () {
          kd.tick();
          if (endGame) {
            kd.stop();
          }
        });
    }

    function jump() {
      // gatherData(2);
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
        $("blue").style.top = top + "px";
        jumpTime++;
      } 
    }


    function moveLeft() {
      // gatherData(0);
      direction = 0;
      if (left > 0) {
        left -= 5;
        $("blue").style.left = left + "px";
      }
    }

    function moveRight() {
      // gatherData(1);
      direction = 1;
      if (left < $("game-frame").clientWidth - figureWidth) {
        left += 5;
        $("blue").style.left = left + "px";
      }
    }

    // function gatherData(action) {
    //   let inputData = getInputData(top, left, direction, $("red"));
    //   let outputData = getOutputData(action);
    //   data.push({input: inputData, output: outputData});
    // }
  })();