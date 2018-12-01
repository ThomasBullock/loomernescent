import '../sass/style.scss';

import imageLoader from './modules/imageLoader';
import autocomplete from './modules/autocomplete';
import autoHeightHero from './modules/autoHeightHero';
import modal from './modules/modal';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/loves';

imageLoader(); 

const address = document.getElementById('address');
const latitude = document.getElementById('lat');
const longitude = document.getElementById('lng');

autocomplete( address, latitude, longitude );
typeAhead( (document.querySelector('.search')));

makeMap( document.getElementById('map') );

modal();

const loveForms = document.querySelectorAll('form.heart');
loveForms.forEach( (form) => {
	form.addEventListener('submit', ajaxHeart)
});



