// Quick test to call the dashboard API
const token = 'YOUR_TOKEN_HERE'; // Replace with actual token from localStorage

fetch('http://localhost:5000/api/dashboard', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
    .then(res => res.json())
    .then(data => {
        console.log('Dashboard API Response:');
        console.log(JSON.stringify(data, null, 2));
    })
    .catch(err => {
        console.error('Error:', err.message);
    });
