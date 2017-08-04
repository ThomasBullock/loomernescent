function modal() {
	const modal = document.getElementById('galleryModal');

	function closeModal() {
		modal.style.display = "none";
		modalTitle.textContent = '';
		modalBody.innerHTML = '';
	}

	if(!modal) {
		return;
	}

	const galleryBtns = Array.from(document.querySelectorAll('.single__gallery-thumb img'));
  const modalBody = document.querySelector('.modal__body');
  const modalTitle = document.querySelector('.modal__title');
  // const modalFooter = document.querySelector('.modal__footer');        
  const close = document.querySelector('.modal__close');

	console.log(galleryBtns);	

	galleryBtns.forEach( (btn, index) => {
		btn.addEventListener('click', (e) => {
			const imgString = e.target.src.split('/').pop();
			const imgAlt = e.target.alt; 
			// imgString = imgStringArray
			const imgStringLg = `${imgString.split('_')[0]}_Lg.jpeg`;
			console.log(imgStringLg)
			const modalImg = document.createElement('img');

			modalImg.src = `/uploads/${imgStringLg}`;
      modalTitle.textContent = imgAlt;			
			modalBody.appendChild(modalImg);
			modal.style.display = "block";
		})
	})

  close.addEventListener('click', closeModal);
  window.addEventListener('click', function(e){
      if (event.target == modal) {
          closeModal()    
      }            
  });	

}

export default modal;