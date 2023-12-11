document.addEventListener('DOMContentLoaded', function () {
    // Function to update the results table with data
    function updateResultsTable(data) {
        const dataTable = document.getElementById('dataTable');
        const tbody = dataTable.querySelector('tbody');

        // Clear existing rows
        tbody.innerHTML = '';

        // Check if data is available
        if (data) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.year}</td>
                <td>${data.make}</td>
                <td>${data.model}</td>
                <td>${data.curb_weight}</td>
                <td>${data.scrapPrice}</td>
            `;
            tbody.appendChild(row);
        } else {
            // Display a message if no data is available
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = '<td colspan="6">No data available</td>';
            tbody.appendChild(noDataRow);
        }
    }

    // Get curb weight from the hidden input field
    const curb_weight = document.getElementById('curb_weight').value || 0;

    // Get other form data (year, make, model) as needed
    const year = document.getElementById('year').value;
    const make = document.getElementById('make').value;
    const model = document.getElementById('model').value;

    // Ensure that scrapPrice is a valid number
    fetch('/api_metal_price', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year, make, model, curb_weight }),
    })
        .then(response => response.json())
        .then(data => {
            // Check if data.scrapPrice is a valid number
            if (!isNaN(data.scrapPrice)) {
                // Display the result on scrapresult page
                updateResultsTable({
                    year,
                    make,
                    model,
                    curb_weight: curb_weight,
                    scrapPrice: parseFloat(data.scrapPrice.toFixed(2)), // Convert to number and round to 2 decimal places
                });
            } else {
                console.error('Invalid scrapPrice on the client side:', data.scrapPrice);
            }
        })
        .catch(error => {
            // Handle errors
            console.error('Error fetching scrap steel price:', error);

            // Display an error message if needed
            const dataTable = document.getElementById('dataTable');
            const tbody = dataTable.querySelector('tbody');
            const errorRow = document.createElement('tr');
            errorRow.innerHTML = `<td colspan="6">Error fetching scrap steel price</td>`;
            tbody.appendChild(errorRow);
        });
});