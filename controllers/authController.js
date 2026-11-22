const axios = require("axios");
const { admin, db } = require("../services/firebaseAdmin");

const API_KEY = process.env.API_KEY || "AIzaSyD41lDo6eWv_oDarj4zZnRRKZsu7dmImHo";

/**
 * Register a new user in Firebase Authentication and create initial user document in Firebase Realtime Database
 */
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required.",
      message: "Email and password are required."
    });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name ? name.trim() : "";

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({
      error: "Please enter a valid email address.",
      message: "Please enter a valid email address."
    });
  }

  // Firebase password requirements (minimum 6 characters)
  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters long.",
      message: "Password must be at least 6 characters long."
    });
  }

  try {
    let uid;
    let registeredEmail = trimmedEmail;
    let registeredName = trimmedName;

    // 1. Try Firebase Admin SDK first
    try {
      const userRecord = await admin.auth().createUser({
        email: trimmedEmail,
        password: password,
        displayName: registeredName || undefined,
      });

      uid = userRecord.uid;
      registeredEmail = userRecord.email;
      registeredName = userRecord.displayName || registeredName;
    } catch (adminError) {
      console.warn("Firebase Admin createUser warning:", adminError.code || adminError.message);

      // Handle specific Firebase Admin Auth errors directly
      if (adminError.code === "auth/email-already-exists") {
        return res.status(400).json({
          error: "The email address is already in use by another account.",
          message: "The email address is already in use by another account."
        });
      }
      if (adminError.code === "auth/invalid-email") {
        return res.status(400).json({
          error: "The email address is invalid.",
          message: "The email address is invalid."
        });
      }
      if (adminError.code === "auth/weak-password" || adminError.code === "auth/invalid-password") {
        return res.status(400).json({
          error: "Password must be at least 6 characters long.",
          message: "Password must be at least 6 characters long."
        });
      }

      // Fallback: Use Firebase Identity Toolkit REST API
      const restResponse = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
        {
          email: trimmedEmail,
          password: password,
          returnSecureToken: true
        }
      );

      uid = restResponse.data.localId;
      registeredEmail = restResponse.data.email;

      // Update displayName via Identity Toolkit if provided
      if (registeredName) {
        try {
          await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
            {
              idToken: restResponse.data.idToken,
              displayName: registeredName,
              returnSecureToken: false
            }
          );
        } catch (updateErr) {
          console.warn("Could not update displayName via REST:", updateErr.message);
        }
      }
    }

    // 2. Initialize user entry in Firebase Realtime Database
    try {
      const userRef = db.ref(`users/${uid}`);
      await userRef.update({
        uid: uid,
        name: registeredName || "User",
        email: registeredEmail,
        created_at: new Date().toISOString()
      });
    } catch (dbErr) {
      console.warn("Realtime Database warning on user registration:", dbErr.message);
    }

    return res.status(201).json({
      message: "User registered successfully",
      userId: uid,
      email: registeredEmail,
      name: registeredName
    });
  } catch (error) {
    console.error("Error during registration:", error);
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      "Failed to register user";

    if (errorMessage.includes("EMAIL_EXISTS")) {
      return res.status(400).json({
        error: "The email address is already in use by another account.",
        message: "The email address is already in use by another account."
      });
    }
    if (errorMessage.includes("INVALID_EMAIL")) {
      return res.status(400).json({
        error: "Please enter a valid email address.",
        message: "Please enter a valid email address."
      });
    }
    if (errorMessage.includes("WEAK_PASSWORD")) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long.",
        message: "Password must be at least 6 characters long."
      });
    }

    return res.status(500).json({
      error: errorMessage,
      message: errorMessage
    });
  }
};

/**
 * Login user via Firebase Identity Toolkit
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required.",
      message: "Email and password are required."
    });
  }

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        email: email.trim().toLowerCase(),
        password,
        returnSecureToken: true
      }
    );

    const { idToken, refreshToken, localId, displayName } = response.data;

    res.status(200).json({
      message: "Login successful",
      userId: localId,
      idToken,
      refreshToken,
      email: response.data.email || email,
      name: displayName || ""
    });
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || "Authentication failed";
    let formattedMessage = "Authentication failed";

    if (errorMessage.includes("EMAIL_NOT_FOUND") || errorMessage.includes("INVALID_PASSWORD") || errorMessage.includes("INVALID_LOGIN_CREDENTIALS")) {
      formattedMessage = "Invalid email or password.";
    } else if (errorMessage.includes("USER_DISABLED")) {
      formattedMessage = "This user account has been disabled.";
    } else if (errorMessage.includes("TOO_MANY_ATTEMPTS_TRY_LATER")) {
      formattedMessage = "Too many failed login attempts. Please try again later.";
    }

    res.status(401).json({
      error: formattedMessage,
      message: formattedMessage
    });
  }
};

/**
 * Logout user
 */
const logoutUser = async (req, res) => {
  res.status(200).json({
    message: "Logged out successfully"
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
