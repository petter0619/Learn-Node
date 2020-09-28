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