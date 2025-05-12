import React, { useState, useEffect } from "react";
import axios from "./axiosConfig";

export default function Notifications() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [notices, setNotices] = useState([]);

  // Fetch all notices for admin view
  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const res = await axios.get("/special-notices/all"); // admin sees all
    setNotices(res.data);
  };

  // Search users
  const handleSearch = async () => {
    const res = await axios.get(`/users/search?q=${encodeURIComponent(search)}`);
    setResults(res.data);
  };

  // Add/remove user from selection
  const toggleUser = (user) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  // Submit notification
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/special-notices", {
      message,
      targetUsers: selectedUsers.map((u) => u._id),
    });
    setMessage("");
    setSelectedUsers([]);
    setSuccess("Notification sent!");
    fetchNotices();
    setTimeout(() => setSuccess(""), 2000);
  };

  // Delete a notice
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      await axios.delete(`/special-notices/${id}`);
      fetchNotices();
    }
  };

  return (
    <div>
      <h2>Send Special Notification</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Search Users (optional):</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or email"
          />
          <button type="button" onClick={handleSearch}>
            Search
          </button>
        </div>
        <div>
          {results.map((user) => (
            <div key={user._id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedUsers.some((u) => u._id === user._id)}
                  onChange={() => toggleUser(user)}
                />
                {user.name} ({user.email})
              </label>
            </div>
          ))}
        </div>
        <div>
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send Notification</button>
        {success && <div style={{ color: "green" }}>{success}</div>}
      </form>
      <div>
        <small>
          <b>Note:</b> If you do not select any users, the notification will be shown to all users.
        </small>
      </div>
      <hr />
      <h3>Current Notices</h3>
      <ul>
        {notices.map((notice) => (
          <li key={notice._id}>
            {notice.message}
            <button
              style={{ marginLeft: 8, color: "red" }}
              onClick={() => handleDelete(notice._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 