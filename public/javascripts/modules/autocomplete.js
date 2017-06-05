function autocomplete(input, latInput, lngInput) {
	if(!input) {
		return
	}
	var options = {
	  types: ['(cities)']
	};

	const dropdown = new google.maps.places.Autocomplete(input, options);

	dropdown.addListener('place_changed', () => {
		const place = dropdown.getPlace();

		latInput.value = place.geometry.location.lat(); 
		lngInput.value = place.geometry.location.lng(); 		
	});

	// if somone hits enter on the address field
	input.addEventListener('keydown', (e) => {
		if(e.keyCode === 13) {
			e.preventDefault();
		}	
	})
}

export default autocomplete;