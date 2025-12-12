// src/api/index.js
import axios from "axios";

export const API = axios.create({
  baseURL: "https://veterinaria-pro.onrender.com/api",
});
