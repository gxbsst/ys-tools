/* eslint-disable import/first */
global.requestAnimationFrame =
  global.requestAnimationFrame || function requestAnimationFrame(callback) {
    setTimeout(callback, 0);
  };
import {jsdom} from 'jsdom';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({adapter: new Adapter()});




// fixed jsdom miss
const documentHTML = '<!doctype html><html><body><div id="root"></div></body></html>';
global.document = jsdom(documentHTML);
global.window = document.defaultView;
global.navigator = global.window.navigator;

function mockCanvas(window) {
  window.HTMLCanvasElement.prototype.getContext = function () {
    return {
      fillRect: function () {
      },
      clearRect: function () {
      },
      getImageData: function (x, y, w, h) {
        return {
          data: new Array(w * h * 4)
        };
      },
      putImageData: function () {
      },
      createImageData: function () {
        return []
      },
      setTransform: function () {
      },
      drawImage: function () {
      },
      save: function () {
      },
      fillText: function () {
      },
      restore: function () {
      },
      beginPath: function () {
      },
      moveTo: function () {
      },
      lineTo: function () {
      },
      closePath: function () {
      },
      stroke: function () {
      },
      translate: function () {
      },
      scale: function () {
      },
      rotate: function () {
      },
      arc: function () {
      },
      fill: function () {
      },
      measureText: function () {
        return {width: 0};
      },
      transform: function () {
      },
      rect: function () {
      },
      clip: function () {
      },
    };
  }

  window.HTMLCanvasElement.prototype.toDataURL = function () {
    return '';
  }
}


mockCanvas(global.window);
