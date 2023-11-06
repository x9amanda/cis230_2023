document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleButton');
    const dataTable = document.getElementById('dataTable');

    toggleButton.addEventListener('click', function () {
        if (dataTable.style.display === 'none') {
            dataTable.style.display = 'table';
            toggleButton.textContent = 'Hide Data';
        } else {
            dataTable.style.display = 'none';
            toggleButton.textContent = 'Show Data';
        }
    });
});