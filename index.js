const express = require("express");
const app = express();
const deviceRoutes = require("./routes/deviceRoutes");
require("dotenv").config();
const cors = require("cors");

app.use(express.json());
app.use(cors()); // This is good
app.use("/api", deviceRoutes);

const PORT = process.env.PORT || 8005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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

