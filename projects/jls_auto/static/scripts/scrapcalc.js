// scrapcalc.js
// Select the button element using its id
const button = document.getElementById('button');

function calculateScrapPrice(event) {
    event.preventDefault();

    const year = document.getElementById('year').value;
    const make = document.getElementById('make').value;
    const model = document.getElementById('model').value;
    const curb_weight = document.getElementById('curb_weight').value;

    axios.post('/scrapresult', { year, make, model, curb_weight })
        .then(response => {
            // Redirect to /scrapresult only if needed
            window.location.href = '/scrapresult';
        })
        .catch(error => {
            // Handle errors and display an error message if needed
            console.error('Error fetching scrap steel price:', error);
        });
}

// Add an event listener to the button
button.addEventListener('click', calculateScrapPrice);
