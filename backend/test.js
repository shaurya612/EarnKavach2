const axios = require('axios');

async function test() {
  try {
    console.log("Testing POST /claim...");
    const claimPayload = {
      fraud_data: [1.2, 35, 120, 10, 1, 0.4],
      income_data: [1500, 2, 0.8],
      actual_income: 1000,
      coverage: 0.8
    };
    
    // Note: The external APIs might be down or hibernating if they are free render instances.
    const res = await axios.post('https://earnkavach2.onrender.com/claim', claimPayload);
    console.log("Response:", res.data);
  } catch (error) {
    if (error.response) {
      console.error("API Error Response:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

test();
