import axios from "axios";

const API_URL = "https://fakestoreapi.com/products";

export const fetchProducts = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const fetchProductById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createProduct = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
}; 