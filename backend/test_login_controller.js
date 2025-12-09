require('dotenv').config();
const authController = require('./controllers/auth.controller');

// Mock Request and Response
const req = {
    body: {
        email: 'adminpro@roca.com',
        password: 'Admin123!'
    }
};

const res = {
    status: function (code) {
        console.log('Response Status:', code);
        return this;
    },
    json: function (data) {
        console.log('Response Data:', data);
        return this;
    }
};

console.log('--- TESTING LOGIN CONTROLLER DIRECTLY ---');
authController.login(req, res);
