document.addEventListener('DOMContentLoaded', function() {
    const donationForm = document.getElementById('donation-form');
    
    donationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            contact: document.getElementById('contact').value,
            email: document.getElementById('email').value,
            location: document.getElementById('location').value,
            category: document.getElementById('category').value,
            description: document.getElementById('item-description').value,
            quantity: parseInt(document.getElementById('quantity').value),
        };

        try {
            const response = await fetch('/api/donate-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                // Redirect to receipt page with donation details
                const params = new URLSearchParams({
                    receiptId: data.donationId,
                    ...formData
                });
                window.location.href = '/donation-receipt.html?' + params.toString();
            } else {
                alert('Error: ' + (data.error || 'Something went wrong'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting donation. Please try again.');
        }
    });
});
