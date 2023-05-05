

window.addEventListener('load', function () {
    (function () {
  
      var width = 1300;
      var height = 800;
  
      var stage = new Konva.Stage({
          container: 'playr_video_container_0',
          width: width,
          height: height
  
      });
  
      var layer = new Konva.Layer();
      stage.add(layer);
  
      var video = document.createElement('video');
      video.src =
          'video/videoplayback.mp4';
  
      var image = new Konva.Image({
          image: video,
          draggable: true,
          x: 0,
          y: 0
  
      });
      layer.add(image);
  
      video.oncanplay = () => {
          image.image(video);
      }
  
      // update Konva.Image size when meta is loaded
      video.addEventListener('loadedmetadata', function (e) {
          image.width(stage.width());
          image.height(stage.height());
          // image.width(containerWidth);
          // image.height(containerHeight);
      });
  
      var anim = new Konva.Animation(function () {
          //do nothing, animation just need to update the layer
      }, layer);
  
  
      layer.draw();
  
      var scaleBy = 1.05;
      stage.on('wheel', e => {
          e.evt.preventDefault();
          var oldScale = stage.scaleX();
  
          var mousePointTo = {
              x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
              y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
          };
  
          var newScale =
              e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
          stage.scale({ x: newScale, y: newScale });
  
            
          stage.position(newPos);
          stage.batchDraw();
      });
  
  
  
  
  
  
  
      /* predefine zoom and rotate */
      var zoom = 1,
        rotate = 0;
  
      /* Grab the necessary DOM elements */
      // var stage = document.getElementById('stage'),
      var v = document.getElementsByTagName('video')[0],
        controls = document.getElementById('change');
  
      /* Array of possible browser specific settings for transformation */
      var properties = ['transform', 'WebkitTransform', 'MozTransform',
        'msTransform', 'OTransform'],
        prop = properties[0];
  
      /* Iterators and stuff */
      var i, j, t;
  
      /* Find out which CSS transform the browser supports */
      for (i = 0, j = properties.length; i < j; i++) {
        if (typeof stage.style[properties[i]] !== 'undefined') {
          prop = properties[i];
          break;
        }
      }
  
      /* Position video */
      v.style.left = 0;
      v.style.top = 0;
  
      //move the video with the mouse
      v.addEventListener('mousedown', (function (e) {
        let shiftX = event.offsetX;
        let shiftY = event.offsetY;
        // console.log('shiftX: ', shiftX, 'shiftY: ', shiftY);
  
        //show pixels on the screen at push
        let styleX = document.getElementById("styleX");
        let styleY = document.getElementById("styleY");
        styleX.innerHTML = "X: " + shiftX;
        styleY.innerHTML = "Y: " + shiftY;
  
        // Find the actual parent that left/top is relative to
        let relativeParent = v.parentNode;
        for (; ;) {
          let pos = document.defaultView.getComputedStyle(relativeParent).position;
          console.log('pos: ', pos);
  
          if (pos === 'static' && relativeParent.parentNode)
            relativeParent = relativeParent.parentNode;
          else break;
        }
  
        // Flex has special treatment, as it's internal padding behaves like margin
        let relativeParentComputedStyle = document.defaultView.getComputedStyle(relativeParent);
        let isRelativeParentFlexItem = !!document.defaultView.getComputedStyle(relativeParent.parentNode).flex;
  
        // console.log('v.getBoundingClientRect().left: ', v.getBoundingClientRect().left, 'v.getBoundingClientRect().top: ', v.getBoundingClientRect().top);
        // console.log('shiftX: ', shiftX, 'shiftY: ', shiftY);
        // console.log('v.style.left: ', parseInt(v.style.left), 'v.style.top: ', parseInt(v.style.top));
  
  
  
        function moveAt(movementX, movementY, clientX, clientY) {
  
          // Extra special offsets
          let parentX = relativeParent.getBoundingClientRect().left;
          let parentY = relativeParent.getBoundingClientRect().top;
  
          let offsetX = isRelativeParentFlexItem ? parseFloat(relativeParentComputedStyle.paddingLeft) || 0 : 0;
          let offsetY = isRelativeParentFlexItem ? parseFloat(relativeParentComputedStyle.paddingTop) || 0 : 0;
  
          // Set position
          v.style.left = (parseInt(v.style.left, 10) + movementX) + 'px';
          v.style.top = (parseInt(v.style.top, 10) + movementY) + 'px';
  
          // v.style.left = (clientX - parentX - offsetX - shiftX) * zoom + 'px';
          // v.style.top = (clientY - parentY - offsetY - shiftY) * zoom + 'px';
  
          // Margins will not play well with left/top
          v.style.marginLeft = 'initial';
          v.style.marginRight = 'initial';
  
          //console.log('moveAt - v.style.left: ', v.style.left, 'v.style.top: ', v.style.top);
        }
        function onMouseMove(event) {
          moveAt(event.movementX, event.movementY, event.clientX, event.clientY);
        }
        document.addEventListener('mousemove', onMouseMove);
  
        v.addEventListener('mouseup', (function () {
          document.removeEventListener('mousemove', onMouseMove);
          v.onmouseup = null;
        }), false);
  
  
      }), false);
  
  
  
      /* If a button was clicked (uses event delegation)...*/
      controls.addEventListener('click', function (e) {
        t = e.target;
        if (t.nodeName.toLowerCase() === 'button') {
  
          /* Check the class name of the button and act accordingly */
          switch (t.className) {
  
            /* Toggle play functionality and button label */
            case 'play':
              if (v.paused) {
                v.play();
                t.innerHTML = 'pause';
              } else {
                v.pause();
                t.innerHTML = 'play';
              }
              break;
  
            /* Increase zoom and set the transformation */
            case 'zoomin':
              zoom = zoom + 0.5;
              v.style[prop] = 'scale(' + zoom + ') rotate(' + rotate + 'deg)';
  
              break;
  
            /* Decrease zoom and set the transformation */
            case 'zoomout':
              zoom = zoom - 0.5;
              v.style[prop] = 'scale(' + zoom + ') rotate(' + rotate + 'deg)';
              break;
  
            /* Increase rotation and set the transformation */
            case 'rotateleft':
              rotate = rotate + 5;
              v.style[prop] = 'rotate(' + rotate + 'deg) scale(' + zoom + ')';
              break;
            /* Decrease rotation and set the transformation */
            case 'rotateright':
              rotate = rotate - 5;
              v.style[prop] = 'rotate(' + rotate + 'deg) scale(' + zoom + ')';
              break;
  
            /* Move video around by reading its left/top and altering it */
            case 'left':
              v.style.left = (parseInt(v.style.left, 10) + 50) + 'px';
              break;
            case 'right':
              v.style.left = (parseInt(v.style.left, 10) - 50) + 'px';
              break;
            case 'up':
              v.style.top = (parseInt(v.style.top, 10) + 50) + 'px';
              break;
            case 'down':
              v.style.top = (parseInt(v.style.top, 10) - 50) + 'px';
              break;
  
            /* Reset all to default */
            case 'reset':
              zoom = 1;
              rotate = 0;
              v.style.top = 0 + 'px';
              v.style.left = 0 + 'px';
              v.style[prop] = 'rotate(' + rotate + 'deg) scale(' + zoom + ')';
              break;
          }
  
          e.preventDefault();
        }
      }, false);
  
  
      v.zoom = 1;
  
      if (v.addEventListener) {
        v.addEventListener("mousewheel", MouseWheelHandler, false);
        v.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
      }
      else v.attachEvent("onmousewheel", MouseWheelHandler);
  
      // function MouseWheelHandler(event) {
  
      //   // cross-browser wheel delta
      //   var e = event || e;
      //   var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  
      //   if (delta === 1) {
      //     zoom = zoom + 0.5;
          
      //   }
      //   else {
      //     if (zoom <= 1) {
      //       zoom = 1;
      //       v.style.top = 0 + 'px';
      //       v.style.left = 0 + 'px';
      //     } else {
      //       zoom = zoom - 0.5;
      //     }
      //   }
  
      //   var pos = $(v).position();
  
      //   console.log('pos: ', pos);
        
      //   let newLeft = (e.offsetX - pos.left) * (zoom - 1) + 'px';
      //   let newTop = (e.offsetY - pos.top) * (zoom - 1) + 'px';
  
      //   v.style[prop] = 'scale(' + zoom + ') rotate(' + rotate + 'deg)';
      //   v.style.transform = 'translate(' + parseInt(newLeft) + 'px, ' + parseInt(newTop) + 'px)';
  
      //   console.log('e.screenX: ', e.screenX);
      //   console.log('e.screenY: ', e.screenY);
  
      //   console.log('e.offsetX: ', e.offsetX);
      //   console.log('e.offsetY: ', e.offsetY);
  
      //   console.log('v.style.left : ', v.style.left);
      //   console.log('v.style.top : ', v.style.top);
  
      //   console.log('zoom: ', zoom);
  
      //   console.log('pos: ', pos);
  
  
      //   // $(v).css({ 'left': + newLeft + 'px' });
      //   // $(v).css({ 'top': + newTop + 'px' });
      //   // $(v).css({ 'position': 'relative' });
  
  
      //   return false;
      // }
  
  
  
  
  
  
    })();
  })