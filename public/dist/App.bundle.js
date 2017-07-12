/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
function autoHeightHero() {

	var hero = document.querySelector('.hero');
	var heroWrapper = document.querySelector('.hero__link-wrapper');
	if (!hero) {
		return;
	}
	console.dir(heroWrapper);
	console.dir(hero);
	hero.style.height = heroWrapper.offsetHeight + 'px';
}

exports.default = autoHeightHero;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
function autocomplete(input, latInput, lngInput) {
	if (!input) {
		return;
	}
	var options = {
		types: ['(cities)']
	};

	var dropdown = new google.maps.places.Autocomplete(input, options);

	dropdown.addListener('place_changed', function () {
		var place = dropdown.getPlace();

		latInput.value = place.geometry.location.lat();
		lngInput.value = place.geometry.location.lng();
	});

	// if somone hits enter on the address field
	input.addEventListener('keydown', function (e) {
		if (e.keyCode === 13) {
			e.preventDefault();
		}
	});
}

exports.default = autocomplete;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(2);

var _autocomplete = __webpack_require__(1);

var _autocomplete2 = _interopRequireDefault(_autocomplete);

var _autoHeightHero = __webpack_require__(0);

var _autoHeightHero2 = _interopRequireDefault(_autoHeightHero);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import getSpotifyData from './modules/spotify';

// import request from 'request';

// import { $, $$ } from './modules/bling';
var address = document.getElementById('address');
var latitude = document.getElementById('lat');
var longitude = document.getElementById('lng');

// const bandName = document.getElementById('band-name');
// const spotifyID = document.getElementById('spotifyID');
// const spotifyURL = document.getElementById('spotifyURL');

(0, _autocomplete2.default)(address, latitude, longitude);
// getSpotifyData( bandName, spotifyID, spotifyURL );

// document.onload = autoHeightHero();

// window.addEventListener('resize', () => {
// 	autoHeightHero();
// });

/***/ })
/******/ ]);
//# sourceMappingURL=App.bundle.js.map