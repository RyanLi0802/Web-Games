// const kd = require("./keydrown");

(function() {
    "use strict";

    let jumpTime = 0;
    let jumpTimer = null;
    let direction = 0;  // right -> 1, left -> 0
    let top, left;

    window.addEventListener("load", main);

    function main() {
      createFigure("red");

      // make sure the image is loaded before recoding its position
      $("red").addEventListener("load", function() {
        left = $("red").offsetLeft;
        top = $("red").offsetTop;

        openFire();
        jump();
        walk();
      });
      
    }

    function walk() {
        let length = Math.floor(Math.random() * 30);
        let drctTest = Math.random();
        let timer = setInterval(() => {
            if (endGame) {
                clearInterval(timer);
            } else if (length <= 0 || (drctTest < 0.5 && left <= 0)
                || (drctTest > 0.5 && left >= $("game-frame").clientWidth - figureWidth)) {
                clearInterval(timer);
                setTimeout(walk, 10);
            } else {
                length--;
                if(drctTest < 0.5) {
                    direction = 0;
                    left -= 5;
                } else {
                    direction = 1;
                    left += 5;
                }
                $("red").style.left = left + "px";
            }
        }, 16);
    }


    function openFire() {
        if (Math.random() < 0.7) {
            fire("red", top, left, direction);
        }
        if (!endGame) {
            setTimeout(openFire, 500);
        }
    }

      
    function jump() {
      if (jumpTimer == null && Math.random() < 0.7) {
        jumpTimer = setInterval(makeJump, 50);
      } else {
        setTimeout(jump, 500);
      }
    }

    // redundant, but I'm too lazy to factor it out
    function makeJump() {
      if (jumpTime > 10) {
        clearInterval(jumpTimer);
        jumpTimer = null;
        jumpTime = 0;
        if (!endGame) {
            setTimeout(jump, 10);
        }
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
  })();