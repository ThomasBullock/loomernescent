function imageLoader() {
	window.addEventListener('load', () => {
		console.log('we are in imageLoader')
		const images = document.querySelectorAll('a.hero__link img');
		// console.log(images);
		for(let i = 0; i < images.length; i++) {

			// console.log(images[i]);
			if(images[i].getAttribute('data-src')) {
				images[i].setAttribute('src', images[i].getAttribute('data-src'));
			}
		}
	});
}

export default imageLoader;