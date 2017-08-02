import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(results) {
	return results.map(band => {
		return `
			<a href="/band/${band.slug}" class="search__result">
				<strong>${band.name}</strong>
			</a>
		`;
	}).join('')
}


function typeAhead(search) {
	if(!search) return;
	
	const searchInput = search.querySelector('input[name="search"]');
	const searchResults = search.querySelector('.search__results');
	
	// console.log(searchInput, searchResults)
	
	searchInput.addEventListener('input', function() {
		// if there is no value, hide results and return!
		if(!this.value) {
			searchResults.style.display = 'none';
			return
		} 

		// show the search results!
		searchResults.style.display = 'block';
		// searchResults.innerHTML = '';
		
		axios
			.get(`/api/v1/search?q=${this.value}`)
			.then(response => {
				if(response.data.length) {
					const html = dompurify.sanitize(searchResultsHTML(response.data));
					searchResults.innerHTML = html;
					return;
				} 
				// tell them nothing came back
				if(this.value.length > 3) {
					searchResults.innerHTML = dompurify.sanitize(
						`<span class="search__result"><strong>No results found for ${this.value}</strong></span>`
						);					
				}

				
			})
			.catch(err => {
				console.error(err)
			});
	}); 
	
	// handle keyboard inputs
	searchInput.addEventListener('keyup', (e) => {
		console.log(e.keyCode);
		// if they aren't pressing up, down or enter then ignore!
		if(![38, 40, 13].includes(e.keyCode)) {
			return; // exit!
		}
		
		const activeClass = 'search__result--active';
		const current = searchResults.querySelector(`.${activeClass}`);
		const items = search.querySelectorAll('.search__result')
		let next;
		console.log(items);
		if(e.keyCode === 40 && current) { // they press down and there is a current selected
			next = current.nextElementSibling || items[0];
		} else if (e.keyCode === 38 && current) {
			next = current.previousElementSibling || items[items.length - 1];
		} else if (e.keyCode === 40) {
			next = items[0];
		} else if (e.keyCode === 38) {
			next = items[items.length - 1];
		} else if (e.keyCode === 13 && current.href) {
			window.location = current.href;
			return;
		}
		
		next.classList.add(activeClass);
		
		if(current) {
			current.classList.remove(activeClass);
		}
		console.log('Do Something!');
	})
}

export default typeAhead;