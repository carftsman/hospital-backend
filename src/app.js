// src/app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";



// admin
import hospitalAdminRoutes from "./modules/hospital/admin/routes/hospitalRequest.routes.js";
import hospitalStatusRoutes from "./modules/hospital/admin/routes/hospitalStatus.routes.js";
import hospitalAuthRoutes from "./modules/hospital/admin/routes/auth.routes.js";
import categoryAdminRoutes from "./modules/hospital/admin/routes/category.routes.js";
import doctorAdminRoutes from "./modules/hospital/admin/routes/doctor.routes.js";
import timeslotAdminRoutes from "./modules/hospital/admin/routes/timeslot.routes.js";
import uploadRoutes from "./modules/hospital/admin/routes/upload.routes.js";
import bookedSlots from "./modules/hospital/admin/routes/notification.routes.js";
import userAuthRoutes from "./modules/hospital/user/routes/auth.routes.js";
import hospitalOpenStatusRoutes from "./modules/hospital/admin/routes/openStatus.routes.js";
import nearbyRoutes from "./modules/hospital/user/routes/nearby.routes.js";
import onlineCategories from "./modules/hospital/user/routes/category.routes.js";
import hospitalBymode from "./modules/hospital/user/routes/hospital.routes.js";
import hospitalHomeSearch from "./modules/hospital/user/routes/search.routes.js";
import hospitalHomeSugg from "./modules/hospital/user/routes/suggestions.routes.js"
import searchbymode from "./modules/hospital/user/routes/modeSearch.router.js";
import modeBySuggestions from "./modules/hospital/user/routes/modeSuggestion.routes.js";
import docByHospitals from "./modules/hospital/user/routes/hospitalDoctors.routes.js";
import timeSlots from "./modules/hospital/user/routes/timeslot.routes.js";
import bookSlot from "./modules/hospital/user/routes/booking.router.js";
import UserbookedSlots from "./modules/hospital/user/routes/userBooking.routes.js";
import { swaggerUiServe, swaggerUiSetup } from "./swagger/swagger.js";
import profileRoutes from "./modules/hospital/user/routes/profile.routes.js";
import symptomRoutes from "./modules/hospital/user/routes/symptom.routes.js";

dotenv.config();

const app = express();

// 1) CORS must be registered first
app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","Accept"],
  credentials: false,
}));

// REMOVE — This is what causes crash
// app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Health route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "server running" });
});

// All routes
app.use("/api/hospital/admin", hospitalAdminRoutes);
app.use("/api/hospital/admin/hospitals", hospitalStatusRoutes);
app.use("/api/hospital/admin/auth", hospitalAuthRoutes);
app.use("/api/hospital/admin/categories", categoryAdminRoutes);
app.use("/api/hospital/admin/doctors", doctorAdminRoutes);
app.use("/api/hospital/admin/timeslots", timeslotAdminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/hospital/admin", hospitalOpenStatusRoutes);
app.use("/api/hospital/admin", bookedSlots)

//user 
app.use("/api/hospital/user/auth", userAuthRoutes);

////user routes
app.use("/api/hospital/user", nearbyRoutes);
app.use("/api/hospital/user", onlineCategories);
app.use("/api/hospital/user", hospitalBymode);
app.use("/api/hospital/user",hospitalHomeSearch);
app.use("/api/hospital/user", hospitalHomeSugg);
app.use("/api/hospital/user", searchbymode);
app.use("/api/hospital/user", modeBySuggestions);
app.use("/api/hospital/user", docByHospitals);
app.use("/api/hospital/user", timeSlots);
app.use("/api/hospital/user", bookSlot);
app.use("/api/hospital/user", UserbookedSlots);
app.use("/api/hospital/user/profile", profileRoutes);
app.use("/api/hospital/user", symptomRoutes);

//swager
app.use("/api-docs", swaggerUiServe, swaggerUiSetup);


export default app;
