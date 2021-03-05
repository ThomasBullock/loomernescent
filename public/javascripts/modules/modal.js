function modal() {
  const modal = document.getElementById("galleryModal");

  function closeModal() {
    modal.style.display = "none";
    modalBody.innerHTML = "";
  }

  if (!modal) {
    return;
  }

  const galleryBtns = Array.from(
    document.querySelectorAll(".single__gallery-thumb img")
  );
  const modalBody = document.querySelector(".modal__body");
  const close = document.querySelector(".modal__close");

  galleryBtns.forEach((btn, index) => {
    btn.addEventListener("click", (e) => {
      const imgString = e.target.src.split("/").pop();
      const imgStringLg = `${imgString.split("_")[0]}_Lg.jpeg`;
      const modalImg = document.createElement("img");

      modalImg.src = `/uploads/${imgStringLg}`;

      modalBody.appendChild(modalImg);
      modal.style.display = "block";
    });
  });

  close.addEventListener("click", closeModal);
  window.addEventListener("click", function (e) {
    if (event.target == modal) {
      closeModal();
    }
  });
}

export default modal;
