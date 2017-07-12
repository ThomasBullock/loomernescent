function autoHeightHero() {

	const hero = document.querySelector('.hero');
	const heroWrapper = document.querySelector('.hero__link-wrapper');
	if(!hero) {
		return;
	}
	console.dir(heroWrapper);
	console.dir(hero);	
	hero.style.height = `${heroWrapper.offsetHeight}px`;
}

export default autoHeightHero;