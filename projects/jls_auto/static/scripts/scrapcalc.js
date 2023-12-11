document.addEventListener('DOMContentLoaded', function () {
    // Get the form element by its ID
    const form = document.getElementById('scrapForm');

    // Add a submit event listener to the form
    form.addEventListener('submit', function (event) {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Get values from form inputs
        const curb_weight = parseFloat(document.getElementById('curb_weight').value) || 0;
        const year = document.getElementById('year').value;
        const make = document.getElementById('make').value;
        const model = document.getElementById('model').value;

        // Make a fetch request to the server endpoint '/scrapresult'
        fetch('/scrapresult', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Convert form data to JSON and include it in the request body
            body: JSON.stringify({ year, make, model, curb_weight }),
        })
        .then(response => {
            // Check if the response status is OK (2xx)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {
            // Check if the received data is a valid number
            if (!isNaN(data.scrapPrice)) {
                // If valid, redirect to '/scrapresult'
                window.location.href = '/scrapresult';
            } else {
                // Log an error if scrapPrice is not a valid number
                console.error('Invalid scrapPrice on the client side:', data.scrapPrice);
            }
        })
        .catch(error => {
            // Log any errors that occurred during the fetch request
            console.error('Error fetching scrap steel price:', error);
        
            // Check if the error has a response
            if (error.response) {
                // The error is from the server, log the status and response details
                console.error('Server error:', error.response.statusText);
                return error.response.json(); // added line to log the response details
            } else {
                // The error is not from the server, log it
                console.error('Non-server error:', error.message);
                throw error; // rethrow the error to continue to the next catch block
            }
        })
        .catch(error => {
            // Handle the response details from the server
            if (error && error.message) {
                console.error('Response details:', error.message);
            }
        });
    });
});
