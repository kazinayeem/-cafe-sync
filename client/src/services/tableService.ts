import axios from "axios";

const API_URL = "http://localhost:5000/api/tables";

// ✅ Get all tables
export const getTables = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// ✅ Add a new table
export const addTable = async (name: string, seats: number) => {
  const res = await axios.post(API_URL, { name, seats });
  return res.data;
};

// ✅ Update table status
export const updateTableStatus = async (id: string, status: string) => {
  const res = await axios.post(`${API_URL}/${id}/status`, { status });
  return res.data;
};

// ✅ Edit table name and seats
export const updateTable = async (
  id: string,
  name?: string,
  seats?: number
) => {
  const res = await axios.put(`${API_URL}/${id}`, { name, seats });
  return res.data;
};

// ✅ Delete table
export const deleteTable = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
