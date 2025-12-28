import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/", // your backend root
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTimetable = async () => {
  try {
    const res = await api.get("/timetable");
    console.log("Timetable:", res.data);
  } catch (err) {
    console.error("Error fetching timetable:", err);
  }
};

export default api;
