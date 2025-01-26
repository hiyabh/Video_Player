window.addEventListener("load", function() {
  (function() {
    /* predefine zoom and rotate */
    let zoom = 1;
    let rotate = 0;

    /* Grab the necessary DOM elements */
    //var stage = document.getElementById('stage');
    var v = document.getElementsByTagName("video")[0],
      controls = document.getElementById("change");

    let ratioX = 1;
    let ratioY = 1;
    // let ratioX = v.videoWidth / v.offsetWidth;
    // let ratioY = v.videoHeight / v.offsetHeight;

    /* Array of possible browser specific settings for transformation */
    var properties = [
        "transform",
        "WebkitTransform",
        "MozTransform",
        "msTransform",
        "OTransform"
      ],
      prop = properties[0];

    /* Iterators and stuff */
    var i, j, t;

    /* Find out which CSS transform the browser supports */
    for (i = 0, j = properties.length; i < j; i++) {
      if (typeof stage.style[properties[i]] !== "undefined") {
        prop = properties[i];
        break;
      }
    }

    /* Position video */
    v.style.left = 0;
    v.style.top = 0;

    //move the video with the mouse
    v.addEventListener(
      "mousedown",
      function(e) {
        let shiftX = event.offsetX;
        let shiftY = event.offsetY;

        //show pixels on the screen at push
        let styleX = document.getElementById("styleX");
        let styleY = document.getElementById("styleY");

        styleX.innerHTML = "X: " + Math.floor(shiftX * ratioX);
        styleY.innerHTML = "Y: " + Math.floor(shiftY * ratioY);

        // Find the actual parent that left/top is relative to
        let relativeParent = v.parentNode;
        for (;;) {
          let pos = document.defaultView.getComputedStyle(relativeParent)
            .position;

          if (pos === "static" && relativeParent.parentNode)
            relativeParent = relativeParent.parentNode;
          else break;
        }

        // Flex has special treatment, as it's internal padding behaves like margin
        let relativeParentComputedStyle = document.defaultView.getComputedStyle(
          relativeParent
        );
        let isRelativeParentFlexItem = !!document.defaultView.getComputedStyle(
          relativeParent.parentNode
        ).flex;

        function moveAt(movementX, movementY, clientX, clientY) {
          // Extra special offsets
          let parentX = relativeParent.getBoundingClientRect().left;
          let parentY = relativeParent.getBoundingClientRect().top;

          let offsetX = isRelativeParentFlexItem
            ? parseFloat(relativeParentComputedStyle.paddingLeft) || 0
            : 0;
          let offsetY = isRelativeParentFlexItem
            ? parseFloat(relativeParentComputedStyle.paddingTop) || 0
            : 0;

          // Set position
          v.style.left = parseInt(v.style.left, 10) + movementX + "px";
          v.style.top = parseInt(v.style.top, 10) + movementY + "px";

          // v.style.left = (clientX - parentX - offsetX - shiftX) * zoom + 'px';
          // v.style.top = (clientY - parentY - offsetY - shiftY) * zoom + 'px';

          // Margins will not play well with left/top
          v.style.marginLeft = "initial";
          v.style.marginRight = "initial";

        }
        function onMouseMove(event) {
          moveAt(
            event.movementX,
            event.movementY,
            event.clientX,
            event.clientY
          );
        }
        document.addEventListener("mousemove", onMouseMove);

        v.addEventListener(
          "mouseup",
          function() {
            document.removeEventListener("mousemove", onMouseMove);
            v.onmouseup = null;
          },
          false
        );
      },
      false
    );

    /* If a button was clicked (uses event delegation)...*/
    controls.addEventListener(
      "click",
      function(e) {
        t = e.target;
        if (t.nodeName.toLowerCase() === "button") {
          /* Check the class name of the button and act accordingly */
          switch (t.className) {
            /* Toggle play functionality and button label */
            case "play":
              if (v.paused) {
                v.play();
                t.innerHTML = "pause";
              } else {
                v.pause();
                t.innerHTML = "play";
              }
              break;

            /* Increase zoom and set the transformation */
            case "zoomin":
              zoom = zoom + 0.5;
              v.style[prop] = "scale(" + zoom + ") rotate(" + rotate + "deg)";
              break;

            /* Decrease zoom and set the transformation */
            case "zoomout":
              zoom = zoom - 0.5;
              v.style[prop] = "scale(" + zoom + ") rotate(" + rotate + "deg)";
              break;

            /* Increase rotation and set the transformation */
            case "rotateleft":
              rotate = rotate + 5;
              v.style[prop] = "rotate(" + rotate + "deg) scale(" + zoom + ")";
              break;

            /* Decrease rotation and set the transformation */
            case "rotateright":
              rotate = rotate - 5;
              v.style[prop] = "rotate(" + rotate + "deg) scale(" + zoom + ")";
              break;

            /* Move video around by reading its left/top and altering it */
            case "left":
              v.style.left = parseInt(v.style.left, 10) - 50 + "px";
              break;
            case "right":
              v.style.left = parseInt(v.style.left, 10) + 50 + "px";
              break;
            case "up":
              v.style.top = parseInt(v.style.top, 10) - 50 + "px";
              break;
            case "down":
              v.style.top = parseInt(v.style.top, 10) + 50 + "px";
              break;

            /* Reset all to default */
            case "reset":
              zoom = 1;
              rotate = 0;
              v.style.top = 0 + "px";
              v.style.left = 0 + "px";
              v.style[prop] = "rotate(" + rotate + "deg) scale(" + zoom + ")";
              break;
          }

          e.preventDefault();
        }
      },
      false
    );

    //Continuous click
    var interval;

    $("#zoomin")
      .mousedown(function() {
        interval = setInterval(performWhileMouseDownZoomin, 100);
      })
      .mouseup(function() {
        clearInterval(interval);
      });
    function performWhileMouseDownZoomin() {
      zoom = zoom + 0.5;
      v.style[prop] = "scale(" + zoom + ") rotate(" + rotate + "deg)";
    }

    $("#zoomout")
      .mousedown(function() {
        interval = setInterval(performWhileMouseDownZoomout, 100);
      })
      .mouseup(function() {
        clearInterval(interval);
      });
    function performWhileMouseDownZoomout() {
      zoom = zoom - 0.5;
      v.style[prop] = "scale(" + zoom + ") rotate(" + rotate + "deg)";
    }

    $("#left")
      .mousedown(function() {
        interval = setInterval(performWhileMouseDownLeft, 100);
      })
      .mouseup(function() {
        clearInterval(interval);
      });
    function performWhileMouseDownLeft() {
      v.style.left = parseInt(v.style.left, 10) - 50 + "px";
    }

    $("#right")
      .mousedown(function() {
        interval = setInterval(performWhileMouseDownRight, 100);
      })
      .mouseup(function() {
        clearInterval(interval);
      });
    function performWhileMouseDownRight() {
      v.style.left = parseInt(v.style.left, 10) + 50 + "px";
    }

    $("#up")
      .mousedown(function() {
        interval = setInterval(performWhileMouseDownUp, 100);
      })
      .mouseup(function() {
        clearInterval(interval);
      });
    function performWhileMouseDownUp() {
      v.style.top = parseInt(v.style.top, 10) - 50 + "px";
    }

    $("#down")
      .mousedown(function() {
        interval = setInterval(performWhileMouseDownDown, 100);
      })
      .mouseup(function() {
        clearInterval(interval);
      });
    function performWhileMouseDownDown() {
      v.style.top = parseInt(v.style.top, 10) + 50 + "px";
    }

    $("#rotateleft")
      .mousedown(function() {
        interval = setInterval(performWhileMouseDownRotateleft, 100);
      })
      .mouseup(function() {
        clearInterval(interval);
      });
    function performWhileMouseDownRotateleft() {
      rotate = rotate + 5;
      v.style[prop] = "rotate(" + rotate + "deg) scale(" + zoom + ")";
    }
    $("#rotateright")
      .mousedown(function() {
        interval = setInterval(performWhileMouseDownRotateright, 100);
      })
      .mouseup(function() {
        clearInterval(interval);
      });
    function performWhileMouseDownRotateright() {
      rotate = rotate - 5;
      v.style[prop] = "rotate(" + rotate + "deg) scale(" + zoom + ")";
    }

    // v.zoom = 1;

    if (v.addEventListener) {
      v.addEventListener("mousewheel", MouseWheelHandler, false);
      v.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
    } else v.attachEvent("onmousewheel", MouseWheelHandler);

    function MouseWheelHandler(event) {
      // cross-browser wheel delta
      var e = event || e;
      var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));

      //actual width % height of the video
      let width = v.offsetWidth;
      let height = v.offsetHeight;

      if (delta === 1) {
        zoom = zoom + 0.5;

        v.style.top =
          parseInt(v.style.top) +
          (height / 2 - parseInt(event.offsetY)) / 2 +
          "px";
        v.style.left =
          parseInt(v.style.left) +
          (width / 2 - parseInt(event.offsetX)) / 2 +
          "px";
      } else {
        if (zoom <= 1) {
          zoom = 1;
          v.style.top = 0 + "px";
          v.style.left = 0 + "px";
        } else {
          zoom = zoom - 0.5;

          v.style.top =
            parseInt(v.style.top) -
            (height / 2 - parseInt(event.offsetY)) / 2 +
            "px";
          v.style.left =
            parseInt(v.style.left) -
            (width / 2 - parseInt(event.offsetX)) / 2 +
            "px";
        }
      }

      v.style[prop] = "scale(" + zoom + ") rotate(" + rotate + "deg)";

    }
  })();
});
