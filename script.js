const movieForm = document.getElementById('movieForm');
const movieNameInput = document.getElementById('movieName');
const movieList = document.getElementById('movieList');
const MAX_VOTES = 5;

function getVoteCount() {
    return parseInt(localStorage.getItem('voteCount') || '0');
}

function incrementVoteCount() {
    const currentVoteCount = getVoteCount();
    localStorage.setItem('voteCount', currentVoteCount + 1);
}

function updateVoteButtonsState() {
    const currentVoteCount = getVoteCount();
    const voteButtons = document.querySelectorAll('.vote-button');
    voteButtons.forEach(button => {
        button.disabled = currentVoteCount >= MAX_VOTES;
    });
}

async function fetchMovies() {
    try {
        const response = await fetch('https://holiday-movie-voting-backend.vercel.app/movies');
        const movies = await response.json();
        movies.sort((a, b) => b.votes - a.votes);
        movieList.innerHTML = '';
        movies.forEach(addMovieToList);
        updateVoteButtonsState();
    } catch (error) {
        console.error('Failed to fetch movies:', error);
        alert('Failed to load movies. Please try again later.');
    }
}

function addMovieToList(movie) {
    const listItem = document.createElement('li');
    listItem.textContent = `${movie.name} (${movie.votes} votes) `;
    const voteButton = document.createElement('button');
    voteButton.textContent = 'Vote';
    voteButton.classList.add('vote-button');
    voteButton.addEventListener('click', async () => {
        try {
            await fetch(`https://holiday-movie-voting-backend.vercel.app/vote/${movie._id}`, { method: 'POST' });
            incrementVoteCount();
            movie.votes++; // Update the local vote count
            listItem.textContent = `${movie.name} (${movie.votes} votes) `; // Update the text
            listItem.appendChild(voteButton); // Re-append the button
            updateVoteButtonsState();
        } catch (error) {
            console.error('Failed to vote:', error);
            alert('Failed to vote. Please try again later.');
        }
    });
    listItem.appendChild(voteButton);
    movieList.appendChild(listItem);
}

movieForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const movieName = movieNameInput.value.trim();
    if (!movieName) {
        alert('Please enter one of your favorite holiday movie titles.');
        return;
    }
    try {
        const response = await fetch('https://holiday-movie-voting-backend.vercel.app/add-movie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: movieName })
        });
        const movie = await response.json();
        addMovieToList(movie);
        movieNameInput.value = '';
    } catch (error) {
        console.error('Failed to add movie:', error);
        alert('Failed to add movie. Please try again later.');
    }
});

function resizeIframe(obj) {
    obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
}

fetchMovies();
