import http from 'http';

const data = JSON.stringify({
    wpm: 120,
    accuracy: 99,
    type: 'Test Script'
});

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/certificates',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        // We'll skip auth for a moment to see if it even hits the route (should get 401 or 403)
        // If we get 404, then route is not registered.
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
