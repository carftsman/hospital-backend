// src/server.js
import app from "./app.js";
import dotenv from "dotenv";

import { expireHoldBookings } from "./jobs/expireHoldBookings.job.js";
import { releaseExpiredBookings } from "./jobs/releaseExpiredBookings.job.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// =======================
// Safe job scheduler
// =======================
async function startJobs() {
  // Expire HOLD bookings every 1 minute
  async function runExpireJob() {
    try {
      await expireHoldBookings();
    } catch (err) {
      console.error("Expire booking job failed:", err.message);
    } finally {
      setTimeout(runExpireJob, 60 * 1000);
    }
  }

  // Release expired bookings every 2 minutes
  async function runReleaseJob() {
    try {
      await releaseExpiredBookings();
    } catch (err) {
      console.error("Release booking job failed:", err.message);
    } finally {
      setTimeout(runReleaseJob, 2 * 60 * 1000);
    }
  }

  runExpireJob();
  runReleaseJob();
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("DATABASE_URL:", process.env.DATABASE_URL);

  
  startJobs();
});
