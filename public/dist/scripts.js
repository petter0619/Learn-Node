const input = document.getElementById('address');
const latInput = document.getElementById('lat');
const lngInput = document.getElementById('lng');

function autocomplete(input, latInput, lngInput) {
    console.log(input, latInput, lngInput);
    if(!input) return;
    const dropdown = new google.maps.places.Autocomplete(input);
}

autocomplete( input, latInput, lngInput );