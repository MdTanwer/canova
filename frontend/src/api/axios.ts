import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Change if your backend runs elsewhere
  withCredentials: true,
});

export default api;
