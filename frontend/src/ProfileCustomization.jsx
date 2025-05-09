import React, { useState, useEffect } from "react";
import {
  Camera,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Moon,
  Sun,
  Languages,
  Bell,
  Award,
  Loader2,
  X,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import axios from "axios";

// Theme Management Utility
const ThemeManager = {
  applyTheme: (theme) => {
    const root = document.documentElement;
    
    // Remove any existing theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-system');
    
    // Add the new theme class
    root.classList.add(`theme-${theme}`);
    
    // Save the theme preference in localStorage
    localStorage.setItem('userTheme', theme);
    
    // Apply system theme if needed
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    }
  }
};

export default function ProfileCustomization() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    birthdate: "",
    gender: "",
    profile_photo: "",
    membership_tier: "Bronze",
    loyaltyPoints: 0,
    social_links: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
    preferences: {
      theme: "light",
      notifications: true,
      language: "en",
    },
  });

  const [loading, setLoading] = useState({
    profile: true,
    saving: false,
    uploadingPhoto: false,
  });
  const [activeTab, setActiveTab] = useState("personal");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isHovering, setIsHovering] = useState(false);

  // Show notification function
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        // Format date for input field
        const formattedData = {
          ...response.data,
          birthdate: response.data.birthdate
            ? response.data.birthdate.split("T")[0]
            : "",
        };

        setUserData(formattedData);
        if (formattedData.profile_photo) {
          // Remove any leading slashes if present and construct the URL
          const photoPath = formattedData.profile_photo.startsWith("/")
            ? formattedData.profile_photo.substring(1)
            : formattedData.profile_photo;
          setPhotoPreview(`http://localhost:5000/${photoPath}`);
        }
        
        // Apply theme from user data
        ThemeManager.applyTheme(formattedData.preferences.theme);
        setLoading((prev) => ({ ...prev, profile: false }));
      } catch (error) {
        showNotification("Failed to load profile data", "error");
      } finally {
        setLoading((prev) => ({ ...prev, profile: false }));
      }
    };

    fetchUserProfile();
    
    // Listen for system theme changes if using system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (userData.preferences.theme === 'system') {
        ThemeManager.applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, saving: true }));

    try {
      // Prepare data for API
      const dataToSend = {
        ...userData,
        birthdate: userData.birthdate || null,
      };

      await axios.put("http://localhost:5000/api/users/profile", dataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      showNotification("Profile updated successfully");
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading((prev) => ({ ...prev, uploadingPhoto: true }));
    setSelectedFile(file);

    // Create preview
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

      setUserData((prev) => ({
        ...prev,
        profile_photo: response.data.user.profile_photo,
      }));

      showNotification("Profile photo updated successfully");
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to upload photo", "error");
      setPhotoPreview(null);
    } finally {
      setLoading((prev) => ({ ...prev, uploadingPhoto: false }));
    }
  };

  // Handle photo removal
  const removePhoto = async () => {
    try {
      await axios.delete("http://localhost:5000/api/users/profile/photo", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      setUserData((prev) => ({
        ...prev,
        profile_photo: "",
      }));
      setPhotoPreview(null);
      setSelectedFile(null);

      showNotification("Profile photo removed successfully");
    } catch (error) {
      showNotification(error.response?.data?.message || "Failed to remove photo", "error");
    }
  };

  // Update form fields
  const updateField = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSocialLink = (platform, value) => {
    setUserData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

  const updateTheme = (theme) => {
    // Apply theme to DOM
    ThemeManager.applyTheme(theme);
    
    // Update state
    setUserData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme,
      },
    }));
  };

  // Get tier color
  const getTierColor = (tier) => {
    switch (tier) {
      case "Bronze":
        return "bg-amber-600";
      case "Silver":
        return "bg-gray-400";
      case "Gold":
        return "bg-yellow-500";
      default:
        return "bg-amber-600";
    }
  };

  // Get tier badge styles with animation
  const getTierBadgeClass = (tier) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white transform transition-all duration-300 hover:scale-105";
    
    switch (tier) {
      case "Bronze":
        return `${baseClasses} bg-gradient-to-r from-amber-600 to-amber-500`;
      case "Silver":
        return `${baseClasses} bg-gradient-to-r from-gray-500 to-gray-400`;
      case "Gold":
        return `${baseClasses} bg-gradient-to-r from-yellow-600 to-yellow-400`;
      default:
        return `${baseClasses} bg-gradient-to-r from-amber-600 to-amber-500`;
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
      {/* Add Tailwind CSS CDN */}
      <link
        href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
        rel="stylesheet"
      />
      {/* Add Inter font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {/* Add animate.css for additional animations */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
      />

      {/* Add theme styles and animations */}
      <style>
        {`
          /* Base styles */
          body {
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            transition: background-color 0.3s ease, color 0.3s ease;
          }
          
          /* Theme styling */
          .theme-light {
            --bg-primary: #f8fafc;
            --bg-secondary: #ffffff;
            --bg-tertiary: #f1f5f9;
            --text-primary: #1e293b;
            --text-secondary: #475569;
            --border-color: #e2e8f0;
            --accent-color: #3b82f6;
          }
          
          .theme-dark {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-tertiary: #334155;
            --text-primary: #f8fafc;
            --text-secondary: #cbd5e1;
            --border-color: #334155;
            --accent-color: #60a5fa;
          }
          
          /* Apply theme variables */
          body {
            background-color: var(--bg-primary);
            color: var(--text-primary);
          }
          
          .theme-aware-card {
            background-color: var(--bg-secondary);
            color: var(--text-primary);
            border-color: var(--border-color);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
          }
          
          .theme-aware-input {
            background-color: var(--bg-secondary);
            color: var(--text-primary);
            border-color: var(--border-color);
          }
          
          .theme-aware-input:focus {
            border-color: var(--accent-color);
          }
          
          .theme-aware-border {
            border-color: var(--border-color);
          }
          
          .theme-aware-text {
            color: var(--text-primary);
          }
          
          .theme-aware-text-secondary {
            color: var(--text-secondary);
          }
          
          /* Animations */
          .tab-transition {
            transition: all 0.3s ease;
          }
          
          .photo-container {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .photo-container:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          
          .notification-enter {
            transform: translateY(-20px);
            opacity: 0;
          }
          
          .notification-enter-active {
            transform: translateY(0);
            opacity: 1;
            transition: all 0.3s ease;
          }
          
          .notification-exit {
            opacity: 1;
          }
          
          .notification-exit-active {
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          input, select, textarea, button {
            font-family: inherit;
            transition: all 0.2s ease;
          }
          
          .input-highlight:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }
          
          /* Social button hover animations */
          .social-button {
            transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
          }
          
          .social-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.1);
          }
          
          /* Button animations */
          .btn-animated {
            position: relative;
            overflow: hidden;
          }
          
          .btn-animated:after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: -100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: all 0.6s ease;
          }
          
          .btn-animated:hover:after {
            left: 100%;
          }
          
          /* Card hover effect */
          .hover-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .hover-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.2);
          }
          
          /* Form group animations */
          .form-group {
            transition: opacity 0.3s ease, transform 0.3s ease;
          }
          
          .form-group:focus-within {
            transform: translateY(-2px);
          }
          
          /* Theme card selection effect */
          .theme-card {
            transition: all 0.3s ease;
            border: 2px solid transparent;
          }
          
          .theme-card.selected {
            border-color: var(--accent-color);
            transform: scale(1.03);
          }
          
          .theme-card:hover:not(.selected) {
            transform: translateY(-3px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>

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
              Profile Customization
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Manage your profile and preferences
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
                            `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
                              <rect width="128" height="128" fill="#e5e7eb"/>
                              <text x="50%" y="50%" fill="#6b7280" font-family="sans-serif" font-size="48" text-anchor="middle" dy=".4em">
                                ${userData.name ? userData.name.charAt(0).toUpperCase() : "?"}
                              </text>
                            </svg>`
                          )}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-500">
                          {userData.name
                            ? userData.name.charAt(0).toUpperCase()
                            : "?"}
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
                    {userData.name || "Your Name"}
                  </h2>
                  <p className="opacity-90">{userData.email || "Your Email"}</p>

                  <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                    <span className={getTierBadgeClass(userData.membership_tier)}>
                      <Award size={16} className="mr-1" /> {userData.membership_tier}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 transform transition-all duration-300 hover:scale-105">
                      {userData.loyaltyPoints} Points
                    </span>
                  </div>
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
                  onClick={() => setActiveTab("social")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm tab-transition ${
                    activeTab === "social"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent theme-aware-text-secondary hover:text-blue-500 hover:border-blue-200"
                  }`}
                >
                  Social Links
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
                          value={userData.name}
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
                          value={userData.email}
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
                          value={userData.phone}
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
                          value={userData.address}
                          onChange={(e) =>
                            updateField("address", e.target.value)
                          }
                          className="w-full px-4 py-2 border rounded-md theme-aware-input input-highlight"
                        />
                      </div>

                      <div className="form-group">
                        <label className="block theme-aware-text font-medium mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={userData.birthdate}
                          onChange={(e) =>
                            updateField("birthdate", e.target.value)
                          }
                          className="w-full px-4 py-2 border rounded-md theme-aware-input input-highlight"
                        />
                      </div>

                      <div className="form-group">
                        <label className="block theme-aware-text font-medium mb-2">
                          Gender
                        </label>
                        <div className="relative">
                          <select
                            value={userData.gender}
                            onChange={(e) =>
                              updateField("gender", e.target.value)
                            }
                            className="w-full px-4 py-2 border rounded-md appearance-none theme-aware-input input-highlight"
                          >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <ChevronDown size={16} />
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 form-group">
                        <label className="block theme-aware-text font-medium mb-2">
                          Bio
                        </label>
                        <textarea
                          value={userData.bio}
                          onChange={(e) => updateField("bio", e.target.value)}
                          className="w-full px-4 py-2 border rounded-md theme-aware-input input-highlight min-h-32"
                          placeholder="Tell us about yourself..."
                          maxLength="500"
                        />
                        <p className="text-xs theme-aware-text-secondary mt-1">
                          {userData.bio.length}/500 characters
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Links Tab */}
                {activeTab === "social" && (
                  <div className="space-y-6 animate__animated animate__fadeIn">
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6 transition-colors">
                      <p className="text-blue-800 dark:text-blue-100 text-sm">
                        Connect your social accounts to enhance your profile visibility
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Facebook size={24} />
                        </div>
                        <div className="ml-4 flex-grow">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Facebook
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                              https://facebook.com/
                            </span>
                            <input
                              type="text"
                              value={userData.social_links.facebook}
                              onChange={(e) =>
                                updateSocialLink("facebook", e.target.value)
                              }
                              placeholder="username"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Twitter size={24} />
                        </div>
                        <div className="ml-4 flex-grow">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Twitter
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                              https://twitter.com/
                            </span>
                            <input
                              type="text"
                              value={userData.social_links.twitter}
                              onChange={(e) =>
                                updateSocialLink("twitter", e.target.value)
                              }
                              placeholder="username"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Instagram size={24} />
                        </div>
                        <div className="ml-4 flex-grow">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Instagram
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                              https://instagram.com/
                            </span>
                            <input
                              type="text"
                              value={userData.social_links.instagram}
                              onChange={(e) =>
                                updateSocialLink("instagram", e.target.value)
                              }
                              placeholder="username"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Linkedin size={24} />
                        </div>
                        <div className="ml-4 flex-grow">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            LinkedIn
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                              https://linkedin.com/in/
                            </span>
                            <input
                              type="text"
                              value={userData.social_links.linkedin}
                              onChange={(e) =>
                                updateSocialLink("linkedin", e.target.value)
                              }
                              placeholder="username"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
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
                            userData.preferences.theme === "light"
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
                            userData.preferences.theme === "dark"
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
                            userData.preferences.theme === "system"
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
                            checked={userData.preferences.notifications}
                            onChange={(e) =>
                              setUserData((prev) => ({
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
                            {userData.preferences.notifications
                              ? "Enabled"
                              : "Disabled"}
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
                            value={userData.preferences.language}
                            onChange={(e) =>
                              setUserData((prev) => ({
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

                {activeTab === "personal" && userData.profile_photo && (
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