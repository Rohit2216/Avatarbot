const axios = require("axios");

const loginUser = async (req, res) => {
  const { email, password } = req.body;
console.log("req.body", req.body)
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  try {
    const API_KEY = "AIzaSyD41lDo6eWv_oDarj4zZnRRKZsu7dmImHo"; // found in Firebase > Project Settings > General > Web API key

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    const { idToken, refreshToken, localId } = response.data;

    res.status(200).json({
      message: "Login successful",
      userId: localId,
      idToken,
      refreshToken,
	    email
    });
  } catch (error) {
    res.status(401).json({
      error: error.response?.data?.error?.message || "Authentication failed"
    });
  }
};

module.exports = { loginUser };
