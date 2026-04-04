const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('https://earnkavach2.onrender.com/auth/register', {
      name: "Utkarsh",
      email: "utkarsh.arora09@gmail.com",
      password: "password123",
      platform: "Zomato"
    });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("Error status:", err.response.status);
      console.log("Error data:", err.response.data);
    } else {
      console.log("Network error:", err.message);
    }
  }
}
test();
