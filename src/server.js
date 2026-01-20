// src/server.js
import app from "./app.js";
import dotenv from "dotenv";

import { expireHoldBookings } from "./jobs/expireHoldBookings.job.js";
import { releaseExpiredBookings } from "./jobs/releaseExpiredBookings.job.js";

setInterval(expireHoldBookings, 60 * 1000); // every 1 min
setInterval(releaseExpiredBookings, 2 * 60 * 1000); // every 2 min

// every 1 minute
setInterval(async () => {
  try {
    await expireHoldBookings();
  } catch (err) {
    console.error("Expire booking job failed:", err);
  }
}, 60 * 1000);

// run every 1 minute

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
});
