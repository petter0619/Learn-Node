// Add store Autocomplete lat && long
const input = document.getElementById('address');
const latInput = document.getElementById('lat');
const lngInput = document.getElementById('lng');

function autocomplete(input, latInput, lngInput) {
    if(!input) return;
    const dropdown = new google.maps.places.Autocomplete(input);

    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
    });
    // If someone hits Enter on address field don't submit form
    input.addEventListener('keydown', (e) => {
        if(e.keyCode === 13) e.preventDefault();
    });
}

autocomplete( input, latInput, lngInput );

// Search Box
//const axios = require('axios');
const searchBar = document.querySelector('.search');

function searchResultsHTML(stores) {
    return stores.map(store => {
        return `
            <a href="/store/${store.slug}" class="search__result">
                <strong>${store.name}</strong>
            </a>
        `;
    }).join('');
}

function typeAhead(search) {
    if(!search) return;
    const searchInput = search.querySelector('input[name="search"]');
    const searchResults = search.querySelector('.search__results');

    searchInput.addEventListener('input', function() {
        // If there is no value, quit it!
        if(!this.value) {
            searchResults.style.display = 'none';
            return;
        }
        // Show the search results
        searchResults.style.display = 'block';
        searchResults.innerHTML = '';
        
        axios
            .get(`/api/search?q=${this.value}`)
            .then(res => {
                if(res.data.length) {
                    searchResults.innerHTML = searchResultsHTML(res.data);
                }
            })
            .catch(err => {
                console.error(err);
            });
    });
}

typeAhead(searchBar);