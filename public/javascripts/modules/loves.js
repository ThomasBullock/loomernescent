import axios from "axios";

function ajaxHeart(e) {
  e.preventDefault();

  axios
    .post(this.action)
    .then((res) => {
      const isLoved = this.heart.classList.toggle("heart__button--hearted"); // this.heart gives us the form button as any "name" elements can be accesed by this (the form)
      document.querySelector(".heart-count").textContent =
        res.data.loves.length;
      if (isLoved) {
        this.heart.classList.add("heart__button--float");
        setTimeout(
          () => this.heart.classList.remove("heart__button--float"),
          2500
        );
      }
    })
    .catch(console.error);
}

export default ajaxHeart;
