const token = 'YOUR_TOKEN_HERE';

fetch('https://interview-sync-ldw4.onrender.com/api/dashboard', {
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
