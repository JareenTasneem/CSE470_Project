import React, { useState, useEffect, useContext } from "react";
import {
  Camera,
  Moon,
  Sun,
  Languages,
  Bell,
  Loader2,
  X,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { AuthContext } from "./contexts/AuthContext";

const ThemeManager = {
  applyTheme: (theme) => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-system');
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('userTheme', theme);
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    }
  }
};

export default function AdminProfileCustomization() {
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    profile_photo: "",
    preferences: {
      theme: "light",
      notifications: true,
      language: "en",
    },
  });
  const [loading, setLoading] = useState({ profile: true, saving: false, uploadingPhoto: false });
  const [activeTab, setActiveTab] = useState("personal");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isHovering, setIsHovering] = useState(false);
  const { user, login } = useContext(AuthContext);

  // Notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Load admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        setAdminData(response.data);
        if (response.data.profile_photo) {
          const photoPath = response.data.profile_photo.startsWith("/")
            ? response.data.profile_photo.substring(1)
            : response.data.profile_photo;
          setPhotoPreview(`http://localhost:5000/${photoPath}`);
        }
        ThemeManager.applyTheme(response.data.preferences.theme);
        setLoading((prev) => ({ ...prev, profile: false }));
      } catch (error) {
        showNotification("Failed to load profile data", "error");
      } finally {
        setLoading((prev) => ({ ...prev, profile: false }));
      }
    };
    fetchProfile();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (adminData.preferences.theme === 'system') {
        ThemeManager.applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
    // eslint-disable-next-line
  }, []);

  // Form field updates
  const updateField = (field, value) => {
    setAdminData((prev) => ({ ...prev, [field]: value }));
  };
  const updateTheme = (theme) => {
    ThemeManager.applyTheme(theme);
    setAdminData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme,
      },
    }));
  };

  // Photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading((prev) => ({ ...prev, uploadingPhoto: true }));
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    try {
      const formData = new FormData();
      formData.append("profile_photo", file);
      const response = await axios.post(
        "http://localhost:5000/api/users/profile/photo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setAdminData((prev) => ({ ...prev, profile_photo: response.data.user.profile_photo }));
      showNotification("Profile photo updated successfully");
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to upload photo", "error");
      setPhotoPreview(null);
    } finally {
      setLoading((prev) => ({ ...prev, uploadingPhoto: false }));
    }
  };
  // Remove photo
  const removePhoto = async () => {
    try {
      await axios.delete("http://localhost:5000/api/users/profile/photo", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setAdminData((prev) => ({ ...prev, profile_photo: "" }));
      setPhotoPreview(null);
      setSelectedFile(null);
      showNotification("Profile photo removed successfully");
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to remove photo", "error");
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, saving: true }));
    try {
      const response = await axios.put("http://localhost:5000/api/users/profile", adminData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      if (login) login(response.data.user, localStorage.getItem("authToken"));
      showNotification("Profile updated successfully");
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  // Languages
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
  ];

  if (loading.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Tailwind, Inter font, animate.css, and theme styles (same as customer) */}
      <link
        href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
      />
      {/* (Copy the same <style> block from ProfileCustomization.jsx here for theme/animations) */}
      <style>{`
        body { font-family: 'Inter', sans-serif; transition: background-color 0.3s, color 0.3s; }
        .theme-light { --bg-primary: #f8fafc; --bg-secondary: #fff; --bg-tertiary: #f1f5f9; --text-primary: #1e293b; --text-secondary: #475569; --border-color: #e2e8f0; --accent-color: #3b82f6; }
        .theme-dark { --bg-primary: #0f172a; --bg-secondary: #1e293b; --bg-tertiary: #334155; --text-primary: #f8fafc; --text-secondary: #cbd5e1; --border-color: #334155; --accent-color: #60a5fa; }
        body { background-color: var(--bg-primary); color: var(--text-primary); }
        .theme-aware-card { background-color: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: all 0.3s; }
        .theme-aware-input { background-color: var(--bg-secondary); color: var(--text-primary); border-color: var(--border-color); }
        .theme-aware-input:focus { border-color: var(--accent-color); }
        .theme-aware-border { border-color: var(--border-color); }
        .theme-aware-text { color: var(--text-primary); }
        .theme-aware-text-secondary { color: var(--text-secondary); }
        .tab-transition { transition: all 0.3s; }
        .photo-container { transition: transform 0.3s, box-shadow 0.3s; }
        .photo-container:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
        .notification-enter { transform: translateY(-20px); opacity: 0; }
        .notification-enter-active { transform: translateY(0); opacity: 1; transition: all 0.3s; }
        .notification-exit { opacity: 1; }
        .notification-exit-active { opacity: 0; transition: opacity 0.3s; }
        input, select, textarea, button { font-family: inherit; transition: all 0.2s; }
        .input-highlight:focus { box-shadow: 0 0 0 3px rgba(59,130,246,0.3); }
        .btn-animated { position: relative; overflow: hidden; }
        .btn-animated:after { content: ''; position: absolute; width: 100%; height: 100%; top: 0; left: -100%; background: linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent); transition: all 0.6s; }
        .btn-animated:hover:after { left: 100%; }
        .hover-card { transition: transform 0.3s, box-shadow 0.3s; }
        .hover-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.2); }
        .form-group { transition: opacity 0.3s, transform 0.3s; }
        .form-group:focus-within { transform: translateY(-2px); }
        .theme-card { transition: all 0.3s; border: 2px solid transparent; }
        .theme-card.selected { border-color: var(--accent-color); transform: scale(1.03); }
        .theme-card:hover:not(.selected) { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
      `}</style>

      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-5xl mx-auto">
          {/* Notification Toast */}
          {notification.show && (
            <div className={`fixed top-6 right-6 z-50 rounded-lg shadow-lg p-4 animate__animated ${notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} animate__fadeInDown`}>
              <div className="flex items-center">
                {notification.type === "success" ? (
                  <CheckCircle size={20} className="mr-2 text-green-500" />
                ) : (
                  <X size={20} className="mr-2 text-red-500" />
                )}
                <span className="font-medium">{notification.message}</span>
                <button 
                  onClick={() => setNotification({ show: false, message: "", type: "" })}
                  className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="text-center mb-8 animate__animated animate__fadeIn">
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Admin Profile Customization
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Manage your admin profile and preferences
            </p>
          </div>

          <div className="theme-aware-card rounded-lg shadow-lg overflow-hidden animate__animated animate__fadeInUp">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex flex-col md:flex-row items-center">
                <div className="relative mb-4 md:mb-0 md:mr-6 photo-container"
                     onMouseEnter={() => setIsHovering(true)}
                     onMouseLeave={() => setIsHovering(false)}
                >
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden relative hover-card">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                            `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'><rect width='128' height='128' fill='#e5e7eb'/><text x='50%' y='50%' fill='#6b7280' font-family='sans-serif' font-size='48' text-anchor='middle' dy='.4em'>${adminData.name ? adminData.name.charAt(0).toUpperCase() : "?"}</text></svg>`
                          )}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-500">
                          {adminData.name ? adminData.name.charAt(0).toUpperCase() : "?"}
                        </span>
                      </div>
                    )}
                    <label
                      htmlFor="photo-upload"
                      className={`absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors ${isHovering ? 'animate__animated animate__pulse' : ''}`}
                      disabled={loading.uploadingPhoto}
                    >
                      {loading.uploadingPhoto ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <Camera size={18} className="text-white" />
                      )}
                    </label>
                    <input
                      type="file"
                      id="photo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={loading.uploadingPhoto}
                    />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold">
                    {adminData.name || "Your Name"}
                  </h2>
                  <p className="opacity-90">{adminData.email || "Your Email"}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b theme-aware-border">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm tab-transition ${
                    activeTab === "personal"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent theme-aware-text-secondary hover:text-blue-500 hover:border-blue-200"
                  }`}
                >
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm tab-transition ${
                    activeTab === "preferences"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent theme-aware-text-secondary hover:text-blue-500 hover:border-blue-200"
                  }`}
                >
                  Preferences
                </button>
              </nav>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                {/* Personal Info Tab */}
                {activeTab === "personal" && (
                  <div className="space-y-6 animate__animated animate__fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <label className="block theme-aware-text font-medium mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={adminData.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          className="w-full px-4 py-2 border rounded-md theme-aware-input input-highlight"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="block theme-aware-text font-medium mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={adminData.email}
                          className="w-full px-4 py-2 border rounded-md theme-aware-input cursor-not-allowed opacity-75"
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label className="block theme-aware-text font-medium mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={adminData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          className="w-full px-4 py-2 border rounded-md theme-aware-input input-highlight"
                        />
                      </div>
                      <div className="form-group">
                        <label className="block theme-aware-text font-medium mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={adminData.address}
                          onChange={(e) => updateField("address", e.target.value)}
                          className="w-full px-4 py-2 border rounded-md theme-aware-input input-highlight"
                        />
                      </div>
                      <div className="md:col-span-2 form-group">
                        <label className="block theme-aware-text font-medium mb-2">
                          Bio
                        </label>
                        <textarea
                          value={adminData.bio}
                          onChange={(e) => updateField("bio", e.target.value)}
                          className="w-full px-4 py-2 border rounded-md theme-aware-input input-highlight min-h-32"
                          placeholder="Tell us about yourself..."
                          maxLength="500"
                        />
                        <p className="text-xs theme-aware-text-secondary mt-1">
                          {adminData.bio.length}/500 characters
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <div className="space-y-8 animate__animated animate__fadeIn">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Theme Settings
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        <button
                          type="button"
                          className={`w-32 h-24 rounded-lg shadow-md p-4 flex flex-col items-center justify-center transition-all ${
                            adminData.preferences.theme === "light"
                              ? "ring-2 ring-blue-500 bg-white"
                              : "bg-white hover:bg-gray-50"
                          }`}
                          onClick={() => updateTheme("light")}
                        >
                          <Sun size={30} className="text-yellow-500 mb-2" />
                          <span className="text-sm font-medium">Light</span>
                        </button>
                        <button
                          type="button"
                          className={`w-32 h-24 rounded-lg shadow-md p-4 flex flex-col items-center justify-center transition-all ${
                            adminData.preferences.theme === "dark"
                              ? "ring-2 ring-blue-500 bg-gray-800 text-white"
                              : "bg-gray-800 text-white hover:bg-gray-700"
                          }`}
                          onClick={() => updateTheme("dark")}
                        >
                          <Moon size={30} className="text-gray-300 mb-2" />
                          <span className="text-sm font-medium">Dark</span>
                        </button>
                        <button
                          type="button"
                          className={`w-32 h-24 rounded-lg shadow-md p-4 flex flex-col items-center justify-center transition-all ${
                            adminData.preferences.theme === "system"
                              ? "ring-2 ring-blue-500 bg-gradient-to-r from-white to-gray-800"
                              : "bg-gradient-to-r from-white to-gray-800 hover:from-gray-50 hover:to-gray-700"
                          }`}
                          onClick={() => updateTheme("system")}
                        >
                          <div className="flex mb-2">
                            <Sun size={24} className="text-yellow-500" />
                            <Moon size={24} className="text-gray-300 ml-1" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            System
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-4">
                          Notifications
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={adminData.preferences.notifications}
                            onChange={(e) =>
                              setAdminData((prev) => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  notifications: e.target.checked,
                                },
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                            <Bell size={16} className="mr-1" />
                            {adminData.preferences.notifications ? "Enabled" : "Disabled"}
                          </span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-4">
                          Language
                        </label>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <Languages size={18} />
                          </div>
                          <select
                            value={adminData.preferences.language}
                            onChange={(e) =>
                              setAdminData((prev) => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  language: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {languages.map((lang) => (
                              <option key={lang.code} value={lang.code}>
                                {lang.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Footer Actions */}
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3 transition-colors">
                <button
                  type="submit"
                  className="inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 btn-animated"
                  disabled={loading.saving}
                >
                  {loading.saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                {activeTab === "personal" && adminData.profile_photo && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base font-medium theme-aware-text bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
} 