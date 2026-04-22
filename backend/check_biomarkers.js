const mongoose = require('mongoose');
const ReportBiomarker = require('./models/ReportBiomarker');

mongoose.connect('mongodb://127.0.0.1:27017/healthscan', { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
    const b = await ReportBiomarker.find().sort({createdAt: -1}).limit(5);
    console.log(b.map(x => ({ name: x.biomarkerName, value: x.value, display: x.valueDisplay })));
    process.exit(0);
});
