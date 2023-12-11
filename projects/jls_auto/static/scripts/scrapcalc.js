document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('scrapForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const curb_weight = parseFloat(document.getElementById('curb_weight').value) || 0;
        const year = document.getElementById('year').value;
        const make = document.getElementById('make').value;
        const model = document.getElementById('model').value;

        fetch('/scrapresult', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ year, make, model, curb_weight }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!isNaN(data.scrapPrice)) {
                window.location.href = '/scrapresult';
            } else {
                console.error('Invalid scrapPrice on the client side:', data.scrapPrice);
            }
        })
        .catch(error => {
            console.error('Error fetching scrap steel price:', error);
            // Log the response text for additional information
            console.error('Response text:', error.response.text());
        });
    });
});