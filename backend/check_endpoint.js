const http = require('http');

function checkPort(port) {
    const options = {
        hostname: 'localhost',
        port: port,
        path: '/api/guest-meal/orders/000000000000000000000000/status',
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log(`Port ${port} Status: ${res.statusCode}`);
            console.log(`Port ${port} Response: ${data.substring(0, 200)}`); // detailed check
        });
    });

    req.on('error', (e) => {
        console.log(`Port ${port} Error: ${e.message}`);
    });

    req.write(JSON.stringify({ status: 'Preparing' }));
    req.end();
}

checkPort(5001);
checkPort(5002);
