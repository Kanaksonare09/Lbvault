const axios = require('axios');
(async () => {
  try {
    const res = await axios.post('http://localhost:5010/api/reports/generate-voice', {
      reportId: "661234567890123456789012", // we don't know the exact ID but it should return 404 instead of 500
      language: "en"
    });
    console.log("SUCCESS:", res.status);
  } catch(e) {
    console.log("ERROR STATUS:", e.response ? e.response.status : e.message);
    console.log("ERROR DATA:", e.response ? e.response.data : "");
  }
})();
