import axios from "axios";
import dompurify from "dompurify";

function searchResultsHTML(results, type) {
  const path = type === "name" ? "band" : "album";
  return results
    .map((item) => {
      return `
			<a href="/${path}/${item.slug}" class="search__result">
				<strong>${item[type]}</strong>
			</a>
		`;
    })
    .join("");
}

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector(".search__results");

  // console.log(searchInput, searchResults)

  searchInput.addEventListener("input", function () {
    // if there is no value, hide results and return!
    if (!this.value) {
      searchResults.style.display = "none";
      return;
    }

    // show the search results!
    searchResults.style.display = "block";

    axios
      .get(`/api/v1/search?q=${this.value}`)
      .then((response) => {
        if (response.data.length) {
          console.log(response.data);
          const responseType = response.data[0].hasOwnProperty("name")
            ? "name"
            : "title";
          const html = dompurify.sanitize(
            searchResultsHTML(response.data, responseType)
          );
          searchResults.innerHTML = html;
          return;
        }
        // tell them nothing came back
        if (this.value.length > 3) {
          searchResults.innerHTML = dompurify.sanitize(
            `<span class="search__result"><strong>No results found for ${this.value}</strong></span>`
          );
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

  // handle keyboard inputs
  searchInput.addEventListener("keyup", (e) => {
    // if they aren't pressing up, down or enter then ignore!
    if (![38, 40, 13].includes(e.keyCode)) {
      return; // exit!
    }

    const activeClass = "search__result--active";
    const current = searchResults.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll(".search__result");
    let next;
    // console.log(items);
    if (e.keyCode === 40 && current) {
      // they press down and there is a current selected
      next = current.nextElementSibling || items[0]; // go to nextSibling and if there isn't one goto 0
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1]; // go to prevSibling and if there isn't one goto end
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }

    next.classList.add(activeClass);

    if (current) {
      current.classList.remove(activeClass);
    }
    console.log("Do Something!");
  });
}

export default typeAhead;
