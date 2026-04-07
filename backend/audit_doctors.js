const mongoose = require('mongoose');
const User = require('./models/User');

async function audit() {
    try {
        const mongoUri = 'mongodb+srv://adminLabV:diya123@diyawadhwa.90k7oln.mongodb.net/labVault';
        await mongoose.connect(mongoUri);
        const doctors = await User.find({ role: 'doctor' }).select('name email status');
        console.log('AUDIT_START');
        console.log(JSON.stringify(doctors, null, 2));
        console.log('AUDIT_END');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

audit();
