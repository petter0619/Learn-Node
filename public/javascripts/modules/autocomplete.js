const input = document.querySelector('#address');
const latInput = document.querySelector('#lat');
const lngInput = document.querySelector('#lng');

function autocomplete(input, latInput, lngInput) {
    console.log(input, latInput, lngInput);
    if(!input) return;
    const dropdown = new google.maps.places.Autocomplete(input);
}

export default autocomplete;
autocomplete();