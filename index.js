// const express = require("express");
// const app = express();
// const deviceRoutes = require("./routes/deviceRoutes");
// require("dotenv").config();
// const cors = require("cors");

// app.use(express.json());
// app.use(cors()); // This is good
// app.use("/api", deviceRoutes);

// const PORT = process.env.PORT || 8005;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// // const express = require("express");
// // const https = require("https");
// // const fs = require("fs");
// // const cors = require("cors");
// // const deviceRoutes = require("./routes/deviceRoutes");
// // require("dotenv").config();

// // const app = express();

// // // Middleware
// // app.use(express.json());
// // app.use(cors());

// // // Routes
// // app.use("/api", deviceRoutes);

// // // SSL options
// // const options = {
// //   key: fs.readFileSync("/etc/letsencrypt/live/soodprints.in/privkey.pem"),
// //   cert: fs.readFileSync("/etc/letsencrypt/live/soodprints.in/fullchain.pem")
// // };

// // // HTTPS server
// // const PORT = process.env.PORT || 8020;
// // https.createServer(options, app).listen(PORT, () => {
// //   console.log(`HTTPS Server running on port ${PORT}`);
// // });



require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const deviceRoutes = require("./routes/deviceRoutes");

const app = express();

app.use(express.json());
app.use(cors()); // This is good

// Ping / Health-check API endpoint
app.get("/ping", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Hurray! Server is alive",
    timestamp: new Date().toISOString()
  });
});

app.use("/api", deviceRoutes);

const PORT = process.env.PORT || 8005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Automatically hit the ping API every 10 seconds
  const pingUrl = process.env.PING_URL || `http://127.0.0.1:${PORT}/ping`;
  setInterval(async () => {
    try {
      const response = await axios.get(pingUrl);
      console.log(`[Keep-Alive Ping] Hit ${pingUrl} - Status: ${response.status} at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error(`[Keep-Alive Ping] Error hitting ${pingUrl}:`, error.message);
    }
  }, 10000); // 10 seconds
});

// const express = require("express");
// const https = require("https");
// const fs = require("fs");
// const cors = require("cors");
// const deviceRoutes = require("./routes/deviceRoutes");
// require("dotenv").config();

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Routes
// app.use("/api", deviceRoutes);

// // SSL options
// const options = {
//   key: fs.readFileSync("/etc/letsencrypt/live/soodprints.in/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/soodprints.in/fullchain.pem")
// };

// // HTTPS server
// const PORT = process.env.PORT || 8020;
// https.createServer(options, app).listen(PORT, () => {
//   console.log(`HTTPS Server running on port ${PORT}`);
// });

