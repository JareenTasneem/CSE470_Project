import React, { useEffect, useState } from "react";
import axios from "./axiosConfig";
import { toast } from "react-toastify";
import { useAuth } from "./contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Check if user is admin
    if (!user || user.user_type !== "Admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/users/admin/all");
      setUsers(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response?.status === 401) {
        toast.error("Please log in to access this feature");
        navigate("/");
      } else if (err.response?.status === 403) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
      } else {
        setError("Failed to fetch users");
        toast.error("Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditing(user._id);
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      user_type: user.user_type
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`/users/admin/${editing}`, editData);
      toast.success("User updated successfully");
      setEditing(null);
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleBan = async (id) => {
    try {
      await axios.put(`/users/admin/${id}/ban`);
      toast.success("User ban status updated");
      fetchUsers();
    } catch (err) {
      console.error("Error updating ban status:", err);
      toast.error(err.response?.data?.message || "Failed to update ban status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await axios.delete(`/users/admin/${id}`);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        toast.error(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(u => {
    const s = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      (u.phone && u.phone.toLowerCase().includes(s))
    );
  });

  if (!user || user.user_type !== "Admin") {
    return null;
  }

  if (loading) return <div className="dashboard-card">Loading...</div>;
  if (error) return <div className="dashboard-card error">{error}</div>;

  return (
    <div className="dashboard-card">
      <h2>User Account Management</h2>
      <p>View, edit, ban, or delete user accounts.</p>
      <div style={{ marginBottom: "1rem", maxWidth: 350 }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} className={user.banned ? "banned" : ""}>
                <td>
                  {editing === user._id ? (
                    <input
                      className="form-control"
                      value={editData.name}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editing === user._id ? (
                    <input
                      className="form-control"
                      value={editData.email}
                      onChange={e => setEditData({ ...editData, email: e.target.value })}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editing === user._id ? (
                    <input
                      className="form-control"
                      value={editData.phone}
                      onChange={e => setEditData({ ...editData, phone: e.target.value })}
                    />
                  ) : (
                    user.phone || "-"
                  )}
                </td>
                <td>
                  {editing === user._id ? (
                    <select
                      className="form-control"
                      value={editData.user_type}
                      onChange={e => setEditData({ ...editData, user_type: e.target.value })}
                    >
                      <option value="Customer">Customer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  ) : (
                    user.user_type
                  )}
                </td>
                <td>
                  <span className={`badge ${user.banned ? "bg-danger" : "bg-success"}`}>
                    {user.banned ? "Banned" : "Active"}
                  </span>
                </td>
                <td>
                  {editing === user._id ? (
                    <button className="btn btn-success btn-sm" onClick={handleSave}>
                      Save
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(user)}>
                      Edit
                    </button>
                  )}
                  <button 
                    className="btn btn-warning btn-sm ms-2" 
                    onClick={() => handleBan(user._id)}
                  >
                    {user.banned ? "Unban" : "Ban"}
                  </button>
                  <button 
                    className="btn btn-danger btn-sm ms-2" 
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 