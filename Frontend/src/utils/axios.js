import axios from "axios";

// If using CRA proxy, use "" (empty string) as baseURL.
// If NOT using proxy, set your backend baseURL here (see note below).

const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://your-production-backend.com";

const instance = axios.create({
  baseURL,
  withCredentials: true, // Send cookies automatically
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default instance;
