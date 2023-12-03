document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleButton');
    const dataTable = document.getElementById('dataTable');

    toggleButton.addEventListener('click', function () {
        if (dataTable.style.display === 'block') {
            dataTable.style.display = 'none';
            toggleButton.textContent = 'Show Data';
        } else {
            dataTable.style.display = 'block';
            toggleButton.textContent = 'Hide Data';
        }
    });
});