// ------------------------- Add store Autocomplete lat && long -------------------------
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

// ------------------------- Search Box -------------------------
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
        
        axios
            .get(`/api/search?q=${this.value}`)
            .then(res => {
                if(res.data.length) {
                    searchResults.innerHTML = DOMPurify.sanitize(searchResultsHTML(res.data));
                    return;
                }
                // Tell them no results found
                searchResults.innerHTML = DOMPurify.sanitize(`<div class="search__result">No results for ${this.value} found!</div>`);
            })
            .catch(err => {
                console.error(err);
            });
    });
    // Handle keyboard inputs
    searchInput.addEventListener('keyup', (e) =>{
        // If they aren't pressing up, down or enter, skip it!
        if(![38, 40, 13].includes(e.keyCode)) return;
        // Otherwise do something
        const activeClass = 'search__result--active';
        const current = search.querySelector(`.${activeClass}`);
        const items = search.querySelectorAll('.search__result');
        let next;
        if(e.keyCode === 40 && current) {
            next = current.nextElementSibling || items[0];
        } else if(e.keyCode === 40) {
            next = items[0];
        } else if (e.keyCode === 38 && current) {
            next = current.previousElementSibling || items[items.length - 1];
        } else if (e.keyCode === 38) {
            next = items[items.length - 1];
        } else if(e.keyCode === 13 && current.href) {
            window.location = current.href;
            return;
        }
        if(current) {
            current.classList.remove(activeClass);
        }
        next.classList.add(activeClass);
        
    });
}

typeAhead(searchBar);

// ------------------------- Map page map -------------------------

const mapPageMap = document.querySelector('#map');
const mapOptions = {
    center: {lat: 43.2, lng: -79.8},
    zoom: 11
}

function loadPlaces(map, lat = 43.2, lng = -79.8) {
    axios
        .get(`/api/search/near?lat=${lat}&lng=${lng}`)
        .then(res => {
            const places = res.data;
            if(!places.length) {
                alert('No places found');
                return;
            }
            // Create a bounds
            const bounds = new google.maps.LatLngBounds();
            const infoWindow = new google.maps.InfoWindow();

            const markers = places.map(place => {
                const [placeLng, placeLat] = place.location.coordinates;
                const position = { lat: placeLat, lng: placeLng };
                bounds.extend(position);
                const marker = new google.maps.Marker({
                    map: map,
                    position: position
                });
                marker.place = place;
                return marker;
            });
            // When someone clicks on a marker show the info of that place
            markers.forEach(marker => marker.addListener('click', function() {
                const html = `
                    <div class="popup">
                        <a href="/store/${this.place.slug}">
                            <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}">
                            <p>${this.place.name} - ${this.place.name.address}</p>
                        </a>
                    </div>
                `;
                console.log(this.place);
                infoWindow.setContent(html);
                infoWindow.open(map, this);
            }));

            // Zoom the map to fit all the markers
            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);
        });
}

function makeMap(mapDiv) {
    if(!mapDiv) return;
    // Make our map
    const map = new google.maps.Map(mapDiv, mapOptions);
    loadPlaces(map);
    const input = document.querySelector('[name="geolocate"]');
    const autocomplete = new google.maps.places.Autocomplete(input);
    
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
    });
}

makeMap( mapPageMap );

// Can change the lat && lng defauls to the users actual location with navigator.geolocation.getCurrentPosition (see JS30 Day 21 for tutorial)

// ------------------------- Hearts.js (hearting) -------------------------

const heartForms = document.querySelectorAll('form.heart');

function ajaxHeart(e) {
    e.preventDefault();
    
    axios
        .post(this.action)
        .then(res => {
            const isHearted = this.heart.classList.toggle('heart__button--hearted');
            document.querySelector('.heart-count').textContent = res.data.hearts.length;
            if(isHearted) {
                this.heart.classList.add('heart__button--float');
                setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500);
            }
        })
        .catch(err => console.error(err));
}

heartForms.forEach(heartForm => heartForm.addEventListener('submit', ajaxHeart));
