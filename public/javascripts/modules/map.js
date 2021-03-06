import axios from 'axios';
import styles from './mapStyles';

const mapOptions = {
		center: { lat: 43.2, lng: 0 },
		zoom: 5,
		styles: styles
	};

// console.log(styles);

function loadBands(map, lat, lng) {
	let apiRequest;
	if(!lat && !lng) {
		apiRequest = `/api/v1/bands/all`;
	} else {
		apiRequest = `/api/v1/bands/near?lat=${lat}&lng=${lng}`;
	}
	axios.get(apiRequest)
		.then(res => {
			const places = res.data
			// console.log(places)
			if(!places.length) {
				alert('No bands where found in that city try another one :)');
				return;
			}
			
			// create bounds
			const bounds = new google.maps.LatLngBounds();
			const infoWindow = new google.maps.InfoWindow();
			
			const markers = places.map(band => {
				const [bandLng, bandLat] = band.location.coordinates;  // destructuring
				const position = { lat: bandLat, lng: bandLng };
				bounds.extend(position);
				const marker = new google.maps.Marker({
					map: map,
					position: position
				});
				marker.band = band;
				// console.log(marker)
				return marker;
			});
			
			// when somone clicks on a marker, show the details of the band
			markers.forEach( (marker) => {
				marker.addListener('click', function() {
					const html = `<div class="popup">
													<a href="/band/${this.band.slug}">
														<img src="/uploads/${this.band.photos.squareSm || 'band.jpg'}" alt="${this.band.name}" />
														<p><strong>${this.band.name}</strong></p>
													</a>
												</div>`
					infoWindow.setContent(html);
					infoWindow.open(map, this) // popup infowindow on this which the marker clicked on 
				})
			});
			
			// zoom the map to fit all the markers perfectly
			map.setCenter(bounds.getCenter());
			map.fitBounds(bounds);
			if(markers.length === 1) {
				map.setZoom(map.getZoom() - 12);				
			} else if(markers.length <= 10) {
				map.setZoom(map.getZoom() - 8);	
			}

		})
}

function makeMap(mapDiv) {
	if(!mapDiv) return;  // dont run on pages without map!
	
	// make our map
	const map = new google.maps.Map(mapDiv, mapOptions);
	loadBands(map);
	const input = document.querySelector('[name="geolocate"]');
	const autocomplete = new google.maps.places.Autocomplete(input);
	autocomplete.addListener('place_changed', () => {
		const place = autocomplete.getPlace();
		// console.log(place);
		loadBands(map, place.geometry.location.lat(), place.geometry.location.lng());
	})
}


export default makeMap;
// navigator.geolocation.getCurrentPosition