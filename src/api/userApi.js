import axios from "axios";

const API_URL = "https://fakestoreapi.com/users";

export const fetchUsers = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const fetchUserById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
}; 