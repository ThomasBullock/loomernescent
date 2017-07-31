/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/

// FS is a built in module to node that let's us read files from the system we're running on
const fs = require('fs');

// moment.js is a handy library for displaying dates. We need this in our templates to display things like "Posted 5 minutes ago"
exports.moment = require('moment');

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = (obj) => JSON.stringify(obj, null, 2);

// Making a static map is really long - this is a handy helper function to make one
exports.staticMap = ([lng, lat]) => `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=800x150&key=${process.env.MAP_KEY}&markers=${lat},${lng}&scale=2`;

// inserting an SVG
exports.icon = (name) => fs.readFileSync(`./public/images/icons/${name}.svg`);

// Some details about the site
exports.siteName = `Loomernescent | Shoegazer Portal`;

exports.menu = [
  { slug: '/bands', title: 'Bands', icon: 'store', },
  { slug: '/pedals', title: 'Pedals', icon: 'pedal', },  
  { slug: '/tags', title: 'Tags', icon: 'tag', }
  // { slug: '/add', title: 'Add', icon: 'add', }
];

exports.buildDatesString = (string) => {
	console.log(string);
	const datesString = string.reduce((accum, next, index, arr)=> {
		if(arr.length === 1 || arr.length === 3 && arr.length - 1 == index) {
			return accum += exports.moment(next).format('YYYY') + "-present";
		} else if(index === 1 && arr.length - 1 !== index) {
			return accum += "-" + exports.moment(next).format('YYYY') + ", ";
		} else if(index === 1) {
			return accum += "-" + exports.moment(next).format('YYYY');
		} else if(index === 0) {
			return accum += exports.moment(next).format('YYYY');
		}
	}, "")
	return datesString;
}
