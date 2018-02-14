import '../sass/style.scss';

// import { $, $$ } from './modules/bling';
import imageLoader from './modules/imageLoader';
import autocomplete from './modules/autocomplete';
import autoHeightHero from './modules/autoHeightHero';
import modal from './modules/modal';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/loves';

imageLoader(); 

// import getSpotifyData from './modules/spotify';

// import request from 'request';

const address = document.getElementById('address');
const latitude = document.getElementById('lat');
const longitude = document.getElementById('lng');

// const bandName = document.getElementById('band-name');
// const spotifyID = document.getElementById('spotifyID');
// const spotifyURL = document.getElementById('spotifyURL');

autocomplete( address, latitude, longitude );
typeAhead( (document.querySelector('.search')));
// getSpotifyData( bandName, spotifyID, spotifyURL );

// document.onload = autoHeightHero();

// window.addEventListener('resize', () => {
// 	autoHeightHero();
// });


makeMap( document.getElementById('map') );

modal();

// const heartForms = $$('form.heart')
const loveForms = document.querySelectorAll('form.heart');
loveForms.forEach( (form) => {
	form.addEventListener('submit', ajaxHeart)
});



