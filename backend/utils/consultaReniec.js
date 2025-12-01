import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_URL = "https://dniruc.apisperu.com/api/v1/dni/";

export const consultarDNI = async (dni) => {
  try {
    const token = process.env.RENIEC_TOKEN;
    const response = await axios.get(`${API_URL}${dni}?token=${token}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error consultando DNI:", error.message);
    return null;
  }
};
