const mongoose = require('mongoose');
const User = require('./models/User');

async function approveDoctor(email) {
    try {
        const mongoUri = 'mongodb+srv://adminLabV:diya123@diyawadhwa.90k7oln.mongodb.net/labVault';
        await mongoose.connect(mongoUri);
        
        const result = await User.findOneAndUpdate(
            { email: email, role: 'doctor' },
            { status: 'APPROVED' },
            { new: true }
        );

        if (result) {
            console.log(`\n\nSuccess: Doctor ${result.name} (${result.email}) has been APPROVED!`);
        } else {
            console.log(`\n\nError: Doctor with email ${email} was not found or is not a doctor role.`);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error during approval:', err);
        process.exit(1);
    }
}

const email = process.argv[2];
if (!email) {
    console.log("Usage: node approve_doctor.js <email>");
    process.exit(1);
}

approveDoctor(email);
