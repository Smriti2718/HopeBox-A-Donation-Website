document.addEventListener('DOMContentLoaded', function() {
    // Get donation data from URL parameters
    const params = new URLSearchParams(window.location.search);
    const donationData = {
        receiptId: params.get('receiptId'),
        name: params.get('name'),
        email: params.get('email'),
        contact: params.get('contact'),
        location: params.get('location'),
        category: params.get('category'),
        quantity: params.get('quantity'),
        description: params.get('description'),
        date: new Date().toLocaleDateString()
    };

    // Populate receipt with donation data
    document.getElementById('receiptId').textContent = donationData.receiptId;
    document.getElementById('donationDate').textContent = donationData.date;
    document.getElementById('donorName').textContent = donationData.name;
    document.getElementById('donorEmail').textContent = donationData.email;
    document.getElementById('donorContact').textContent = donationData.contact;
    document.getElementById('donorLocation').textContent = donationData.location;
    document.getElementById('donationCategory').textContent = donationData.category;
    document.getElementById('donationQuantity').textContent = donationData.quantity;
    document.getElementById('donationDescription').textContent = donationData.description;
});

async function downloadReceipt() {
    try {
        const params = new URLSearchParams(window.location.search);
        const response = await fetch('/api/generate-receipt?' + params.toString());
        
        if (!response.ok) {
            throw new Error('Failed to generate receipt');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'donation-receipt.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading receipt:', error);
        alert('Error downloading receipt. Please try again.');
    }
}
