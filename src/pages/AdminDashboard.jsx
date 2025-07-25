import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "../api/productApi";
import { fetchOrders, fetchOrderById } from "../api/orderApi";
import { fetchUsers } from "../api/userApi";

const orderStatusList = ["Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"];

const AdminDashboard = () => {
  const { state } = useAuth();
  const { user } = state;
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ title: "", price: "", image: "" });
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState("products");
  const [orderRefresh, setOrderRefresh] = useState(0); // trigger reload
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState({});
  const [userList, setUserList] = useState([]);
  const [localOrders, setLocalOrders] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch data from API
  useEffect(() => {
    if (tab === "products") {
      setLoading(true);
      fetchProducts().then(setProducts).finally(() => setLoading(false));
    } else if (tab === "orders") {
      setLoading(true);
      // Lấy đơn hàng từ localStorage mỗi lần tab hoặc orderRefresh thay đổi
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      setLocalOrders(orders);
      // Khởi tạo trạng thái đơn hàng giả lập
      const statusObj = {};
      orders.forEach((o) => (statusObj[o.id] = orderStatus[o.id] || o.status || "Đang xử lý"));
      setOrderStatus(statusObj);
      setLoading(false);
    } else if (tab === "users") {
      setLoading(true);
      fetchUsers().then((data) => {
        setUsers(data);
        setUserList(data);
      }).finally(() => setLoading(false));
    }
  }, [tab, orderRefresh]);

  if (!user || user.role !== "admin") return null;

  // Product handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.image) return;
    setLoading(true);
    if (editId) {
      await updateProduct(editId, { ...form, price: Number(form.price) });
    } else {
      await createProduct({ ...form, price: Number(form.price) });
    }
    fetchProducts().then(setProducts).finally(() => setLoading(false));
    setEditId(null);
    setForm({ title: "", price: "", image: "" });
  };
  const handleEdit = (p) => {
    setForm({ title: p.title, price: p.price, image: p.image });
    setEditId(p.id);
  };
  const handleDelete = async (id) => {
    setLoading(true);
    await deleteProduct(id);
    fetchProducts().then(setProducts).finally(() => setLoading(false));
    if (editId === id) {
      setEditId(null);
      setForm({ title: "", price: "", image: "" });
    }
  };

  // Đơn hàng: xem chi tiết
  const handleShowOrder = (id) => {
    const detail = localOrders.find((o) => o.id === id);
    setOrderDetail(detail);
    setShowOrderModal(true);
  };
  // Đơn hàng: đổi trạng thái (giả lập)
  const handleChangeOrderStatus = (id, status) => {
    setOrderStatus((prev) => {
      const updated = { ...prev, [id]: status };
      const updatedOrders = localOrders.map((o) =>
        o.id === id ? { ...o, status } : o
      );
      setLocalOrders(updatedOrders);
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      setOrderRefresh((x) => x + 1);
      return updated;
    });
  };
  // Xóa đơn hàng
  const handleDeleteOrder = (id) => {
    const updatedOrders = localOrders.filter((o) => o.id !== id);
    setLocalOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setOrderRefresh((x) => x + 1);
  };

  // Xóa user (giả lập)
  const handleDeleteUser = (id) => {
    setUserList((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab("products")} className={`px-4 py-2 rounded ${tab === "products" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Sản phẩm</button>
        <button onClick={() => setTab("orders")} className={`px-4 py-2 rounded ${tab === "orders" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Đơn hàng</button>
        <button onClick={() => setTab("users")} className={`px-4 py-2 rounded ${tab === "users" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Người dùng</button>
      </div>
      {tab === "products" && (
        <>
          <div className="bg-white rounded shadow p-6 mb-8">
            <h3 className="font-semibold mb-2">{editId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Tên sản phẩm" className="border rounded px-3 py-2 flex-1" />
              <input name="price" value={form.price} onChange={handleChange} placeholder="Giá" type="number" className="border rounded px-3 py-2 w-32" />
              <input name="image" value={form.image} onChange={handleChange} placeholder="Link ảnh" className="border rounded px-3 py-2 flex-1" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">{editId ? "Lưu" : "Thêm"}</button>
              {editId && <button type="button" onClick={() => { setEditId(null); setForm({ title: "", price: "", image: "" }); }} className="ml-2 px-3 py-2 bg-gray-200 rounded">Hủy</button>}
            </form>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="font-semibold mb-4">Danh sách sản phẩm</h3>
            {loading ? <div className="text-center py-8">Đang tải...</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Ảnh</th>
                    <th className="p-2 border">Tên</th>
                    <th className="p-2 border">Giá</th>
                    <th className="p-2 border">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="p-2 border"><img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded" /></td>
                      <td className="p-2 border">{p.title}</td>
                      <td className="p-2 border">{p.price.toLocaleString()}₫</td>
                      <td className="p-2 border">
                        <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline mr-2">Sửa</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </>
      )}
      {tab === "orders" && (
        <div className="bg-white rounded shadow p-6">
          <h3 className="font-semibold mb-4">Danh sách đơn hàng</h3>
          {loading ? <div className="text-center py-8">Đang tải...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Mã đơn</th>
                  <th className="p-2 border">Khách hàng</th>
                  <th className="p-2 border">Tổng tiền</th>
                  <th className="p-2 border">Số SP</th>
                  <th className="p-2 border">Trạng thái</th>
                  <th className="p-2 border">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {localOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="p-2 border">
                      <button className="text-blue-600 hover:underline" onClick={() => handleShowOrder(o.id)}>#{o.id}</button>
                    </td>
                    <td className="p-2 border">{o.user?.name || o.info?.name}</td>
                    <td className="p-2 border">{o.total?.toLocaleString()}₫</td>
                    <td className="p-2 border">{o.items?.length}</td>
                    <td className="p-2 border">
                      <select value={orderStatus[o.id]} onChange={e => handleChangeOrderStatus(o.id, e.target.value)} className="border rounded px-2 py-1">
                        {orderStatusList.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-2 border">
                      <button className="text-blue-600 hover:underline mr-2" onClick={() => handleShowOrder(o.id)}>Xem chi tiết</button>
                      <button className="text-red-500 hover:underline" onClick={() => handleDeleteOrder(o.id)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
          {/* Modal chi tiết đơn hàng */}
          {showOrderModal && orderDetail && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative">
                <button className="absolute top-2 right-2 text-xl" onClick={() => setShowOrderModal(false)}>&times;</button>
                <h4 className="text-lg font-bold mb-2">Chi tiết đơn hàng #{orderDetail.id}</h4>
                <div className="mb-2 text-sm text-gray-600">Khách: {orderDetail.user?.name || orderDetail.info?.name}</div>
                <div className="mb-2">Ngày đặt: {orderDetail.date}</div>
                <div className="mb-2">Sản phẩm:</div>
                <ul className="list-disc pl-6">
                  {orderDetail.items.map((p, idx) => (
                    <li key={idx}>{p.title} - SL: {p.qty} - Giá: {p.price.toLocaleString()}₫</li>
                  ))}
                </ul>
                <div className="mt-4 font-bold">Tổng tiền: {orderDetail.total?.toLocaleString()}₫</div>
                <div className="mt-2">Trạng thái: {orderStatus[orderDetail.id]}</div>
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "users" && (
        <div className="bg-white rounded shadow p-6">
          <h3 className="font-semibold mb-4">Danh sách người dùng</h3>
          {loading ? <div className="text-center py-8">Đang tải...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Tên</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Vai trò</th>
                  <th className="p-2 border">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((u) => (
                  <tr key={u.id}>
                    <td className="p-2 border">{u.name.firstname} {u.name.lastname}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border">user</td>
                    <td className="p-2 border">
                      <button className="text-red-500 hover:underline" onClick={() => handleDeleteUser(u.id)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AdminDashboard; 