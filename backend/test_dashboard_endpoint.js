const http = require('http');

// Configuración
const LOGIN_URL = '/api/auth/login';
const DASHBOARD_URL = '/api/reportes/dashboard';
const PORT = 4001;

function request(path, method, body, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data }); // Raw body if not JSON
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function test() {
    try {
        console.log("1. Logging in...");
        const loginRes = await request(LOGIN_URL, 'POST', {
            email: 'davidadmin@gmail.com',
            password: 'admin123'
        });

        if (loginRes.status !== 200) {
            console.error("Login failed", loginRes);
            return;
        }

        const token = loginRes.body.token;
        console.log("Login success. Token obtained.");

        console.log("2. Fetching Dashboard Stats...");
        const statsRes = await request(DASHBOARD_URL, 'GET', null, token);

        console.log("Status:", statsRes.status);
        console.log("Body:", JSON.stringify(statsRes.body, null, 2));

    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
