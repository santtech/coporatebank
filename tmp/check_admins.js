const mongoose = require('mongoose');
const User = require('./models/User').default;
require('dotenv').config();

async function checkAdmins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admins = await User.find({ roles: { $in: ['super-admin', 'administrator', 'admin'] } });
        console.log(JSON.stringify(admins, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkAdmins();
