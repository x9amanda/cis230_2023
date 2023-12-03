async function submitForm(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
        const response = await fetch('/scrapresult', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            window.location.href = '/scrapresult';
        } else {
            console.error('Error:', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}