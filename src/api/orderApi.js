import axios from "axios";

const API_URL = "https://fakestoreapi.com/carts";

export const fetchOrders = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const fetchOrderById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
}; 