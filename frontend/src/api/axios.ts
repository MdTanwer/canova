import axios from "axios";

// Use import.meta.env for Vite. If using CRA, replace with process.env.REACT_APP_API_BASE_URL
const baseURL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
