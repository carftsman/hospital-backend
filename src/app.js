// src/app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// =======================
// Admin Routes
// =======================
import hospitalAdminRoutes from "./modules/hospital/admin/routes/hospitalRequest.routes.js";
import hospitalStatusRoutes from "./modules/hospital/admin/routes/hospitalStatus.routes.js";
import hospitalAuthRoutes from "./modules/hospital/admin/routes/auth.routes.js";
import categoryAdminRoutes from "./modules/hospital/admin/routes/category.routes.js";
import doctorAdminRoutes from "./modules/hospital/admin/routes/doctor.routes.js";
import uploadRoutes from "./modules/hospital/admin/routes/upload.routes.js";
import bookedSlotsRoutes from "./modules/hospital/admin/routes/notification.routes.js";
import hospitalOpenStatusRoutes from "./modules/hospital/admin/routes/openStatus.routes.js";

// =======================
// User Routes
// =======================
import userAuthRoutes from "./modules/hospital/user/routes/auth.routes.js";
import nearbyRoutes from "./modules/hospital/user/routes/nearby.routes.js";
import onlineCategoriesRoutes from "./modules/hospital/user/routes/category.routes.js";
import hospitalByModeRoutes from "./modules/hospital/user/routes/hospital.routes.js";
import hospitalHomeSearchRoutes from "./modules/hospital/user/routes/search.routes.js";
import hospitalHomeSuggestionsRoutes from "./modules/hospital/user/routes/suggestions.routes.js";
import searchByModeRoutes from "./modules/hospital/user/routes/modeSearch.router.js";
import modeSuggestionRoutes from "./modules/hospital/user/routes/modeSuggestion.routes.js";
import hospitalDoctorsRoutes from "./modules/hospital/user/routes/hospitalDoctors.routes.js";
import bookingRoutes from "./modules/hospital/user/routes/booking.router.js";
import userBookingRoutes from "./modules/hospital/user/routes/userBooking.routes.js";
import profileRoutes from "./modules/hospital/user/routes/profile.routes.js";
import symptomRoutes from "./modules/hospital/user/routes/symptom.routes.js";
import appointmentRoutes from "./modules/hospital/user/routes/appointments.routes.js";
import hospitalInfoRoutes from "./modules/hospital/user/routes/hospitalInfo.routes.js";

// =======================
// Swagger
// =======================
import { swaggerUiServe, swaggerUiSetup } from "./swagger/swagger.js";


// =======================
// App Init
// =======================
dotenv.config();
const app = express();

// =======================
// Middleware
// =======================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// Health Check
// =======================
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "server running" });
});

// =======================
// Admin APIs
// =======================
app.use("/api/hospital/admin", hospitalAdminRoutes);
app.use("/api/hospital/admin/hospitals", hospitalStatusRoutes);
app.use("/api/hospital/admin/auth", hospitalAuthRoutes);
app.use("/api/hospital/admin/categories", categoryAdminRoutes);
app.use("/api/hospital/admin/doctors", doctorAdminRoutes);
app.use("/api/hospital/admin", hospitalOpenStatusRoutes);
app.use("/api/hospital/admin", bookedSlotsRoutes);
app.use("/api/upload", uploadRoutes);
 
//user routes
app.use("/api/hospital/user", nearbyRoutes);
app.use("/api/hospital/user", onlineCategoriesRoutes);
app.use("/api/hospital/user", hospitalByModeRoutes);
app.use("/api/hospital/user", hospitalHomeSearchRoutes);
app.use("/api/hospital/user", hospitalHomeSuggestionsRoutes);
app.use("/api/hospital/user", searchByModeRoutes);
app.use("/api/hospital/user", modeSuggestionRoutes);
app.use("/api/hospital/user", hospitalDoctorsRoutes);
app.use("/api/hospital/user", bookingRoutes);
app.use("/api/hospital/user", userBookingRoutes);
app.use("/api/hospital/user/profile", profileRoutes);
app.use("/api/hospital/user", symptomRoutes);


//user 
app.use("/api/hospital/user/auth", userAuthRoutes);

//  THIS IS THE CORRECT ONE
app.use("/api/appointments", appointmentRoutes);


app.use("/api-docs", swaggerUiServe, swaggerUiSetup);

app.use("/api/hospital/user", hospitalInfoRoutes);

export default app;
