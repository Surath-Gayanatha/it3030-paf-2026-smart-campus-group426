const jwt = require('jsonwebtoken');
const axios = require('axios');

const secret = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';
const token = jwt.sign(
    { sub: 'wijesinghesandani2001@gmail.com', role: 'ADMIN', name: 'Admin User' },
    Buffer.from(secret, 'utf8'),
    { expiresIn: '1h', algorithm: 'HS256' }
);

async function testEndpoint() {
    try {
        const res = await axios.patch('http://localhost:8081/api/tickets/ab597/status', {
            status: 'IN_PROGRESS',
            assignedTechnician: 'Cpc Refmansys',
            assignedTechnicianId: 'mockId12345'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('SUCCESS:', res.data);
    } catch (err) {
        console.log('ERROR STATUS:', err.response?.status);
        console.log('ERROR DATA:', err.response?.data);
        console.log('ERROR MESSAGE:', err.message);
    }
}

testEndpoint();
