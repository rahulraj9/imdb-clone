const API_KEY = '19e5c4fc';
// const API_KEY = 'YOUR_OMDB_API_KEY';
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

let favouritesList; // Move the favouritesList variable outside the event listener function

let favouriteMovies = [];

document.addEventListener('DOMContentLoaded', () => {
  // Fetch the favouritesList element once the DOM is loaded
  favouritesList = document.getElementById('favouritesList');
  console.log(favouritesList)

  // Load favorite movies from local storage if available
  const storedFavourites = localStorage.getItem('favouriteMovies');
  if (storedFavourites) {
    favouriteMovies = JSON.parse(storedFavourites);
    updateFavoritesList();
  }
});

searchInput.addEventListener('input', debounce(searchMovies, 500));

function debounce(func, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(func, delay);
  };
}

async function searchMovies() {
  const searchTerm = searchInput.value.trim();
  if (searchTerm === '') {
    searchResults.innerHTML = '';
    return;
  }

  const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${searchTerm}`);
  const data = await response.json();

  if (data.Search) {
    displaySearchResults(data.Search);
  } else {
    searchResults.innerHTML = '<p>No results found.</p>';
  }
}

function displaySearchResults(results) {
    const html = results.map((movie) => {
      const isFavourite = favouriteMovies.some((favMovie) => favMovie.imdbID === movie.imdbID);
      const buttonText = isFavourite ? 'Remove from Fav' : 'Add to Favorites';
  
      return `
        <div class="card mt-3">
          <img src="${movie.Poster}" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${movie.Title}</h5>
            <p class="card-text">${movie.Year}</p>
            <button class="btn btn-primary" onclick="toggleFavorite('${movie.imdbID}')">${buttonText}</button>
            <a href="movie.html?id=${movie.imdbID}" class="btn btn-secondary">More Info</a>
          </div>
        </div>
      `;
    }).join('');
  
    searchResults.innerHTML = html;
  }
  
async function toggleFavorite(movieID) {
  const isFavourite = favouriteMovies.some((favMovie) => favMovie.imdbID === movieID);

  if (isFavourite) {
    removeFromFavorites(movieID);
  } else {
    await addToFavorites(movieID);
  }

  // After toggling the favorite status, update the search results
  const searchTerm = searchInput.value.trim();
  if (searchTerm !== '') {
    searchMovies();
  }
}

async function addToFavorites(movieID) {
  const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${movieID}`);
  const movie = await response.json();

  if (!favouriteMovies.some((favMovie) => favMovie.imdbID === movieID)) {
    favouriteMovies.push(movie);
    updateFavoritesList();
  }
}

function removeFromFavorites(movieID) {
  favouriteMovies = favouriteMovies.filter((favMovie) => favMovie.imdbID !== movieID);
  updateFavoritesList();
}

function updateFavoritesList() {
  // Check if favouritesList exists before updating its innerHTML
  if (favouritesList) {
    const html = favouriteMovies.map((movie) => `
      <li class="list-group-item">
        <span>${movie.Title} (${movie.Year})</span>
        <button class="btn btn-danger btn-sm float-right" onclick="toggleFavorite('${movie.imdbID}')">Remove</button>
      </li>
    `).join('');

    favouritesList.innerHTML = html;
  }

  // Save favorite movies to local storage
  localStorage.setItem('favouriteMovies', JSON.stringify(favouriteMovies));
}
