// src/utils/geocode.js
import dotenv from "dotenv";
dotenv.config();

const OPENCAGE_KEY = process.env.OPENCAGE_API_KEY || null;

/**
 * Geocode address using OpenCage (if key) otherwise Nominatim.
 * Returns: { latitude: Number, longitude: Number } or null
 */
export const geocodeAddress = async ({ location, place, pinCode, country = "India" }) => {
  const queryParts = [];
  if (place) queryParts.push(place);
  if (location) queryParts.push(location);
  if (pinCode) queryParts.push(pinCode);
  if (country) queryParts.push(country);

  const q = encodeURIComponent(queryParts.join(", "));

  try {
    console.log("GEOCODER: Using OpenCage?", OPENCAGE_KEY ? "YES" : "NO");

    if (OPENCAGE_KEY) {
      // --- OpenCage ---
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${q}&key=${OPENCAGE_KEY}&limit=1`;
      console.log("GEOCODER: OpenCage URL =>", url);

      const r = await fetch(url);
      console.log("GEOCODER: OpenCage status:", r.status);

      const json = await r.json();
      console.log("GEOCODER: OpenCage result count:", json?.results?.length || 0);

      if (json && json.results && json.results.length > 0) {
        const { lat, lng } = json.results[0].geometry;
        return { latitude: Number(lat), longitude: Number(lng) };
      }

      return null;
    } else {
      // --- Nominatim ---
      const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;
      console.log("GEOCODER: Nominatim URL =>", url);

      const r = await fetch(url, {
        headers: {
          "User-Agent": process.env.GEOCODER_USER_AGENT || "MyMedicalApp/1.0 (your-email@example.com)"
        }
      });

      console.log("GEOCODER: Nominatim status:", r.status);

      const text = await r.text();
      console.log("GEOCODER: Nominatim response length:", text.length);

      let json;
      try {
        json = JSON.parse(text || "[]");
      } catch (err) {
        console.error("GEOCODER: Nominatim parse error:", err.message);
        return null;
      }

      if (json && json.length > 0) {
        return { latitude: Number(json[0].lat), longitude: Number(json[0].lon) };
      }

      return null;
    }
  } catch (err) {
    console.error("GEOCODER ERROR:", err.message);
    return null;
  }
};
