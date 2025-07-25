"use client";

import { useEffect, useState } from "react";

function ProfileView({ onUpdateSuccess }) {
  const [user, setUser] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    gender: "",
    phoneNumber: "",
    dateOfBirth: "",
  });

  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get userId from localStorage
  useEffect(() => {
    const getUserIdFromStorage = () => {
      try {
        // Thử lấy từ user object trong localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.id || userData.userId || userData.ID) {
            return userData.id || userData.userId || userData.ID;
          }
        }

        // Thử lấy trực tiếp từ userId key
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
          return storedUserId;
        }

        // Thử lấy từ auth token hoặc session
        const authData = localStorage.getItem("auth");
        if (authData) {
          const authObject = JSON.parse(authData);
          if (authObject.userId || authObject.user?.id) {
            return authObject.userId || authObject.user.id;
          }
        }

        return null;
      } catch (error) {
        console.error("Lỗi khi lấy userId từ localStorage:", error);
        return null;
      }
    };

    const id = getUserIdFromStorage();
    setUserId(id);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/customer/profile/${userId}`
        );
        const data = await response.json();
        console.log("✅ Data fetch thành công:", data);
        setUser(data);

        // Set form data when user data is loaded
        setFormData({
          firstName: data.FirstName || "",
          lastName: data.LastName || "",
          username: data.Username || "",
          email: data.Email || "",
          gender: data.Gender || "",
          phoneNumber: data.PhoneNumber || "",
          dateOfBirth: data.DateOfBirth
            ? new Date(data.DateOfBirth).toISOString().split("T")[0]
            : "",
        });
      } catch (error) {
        console.error("❌ Lỗi khi lấy thông tin user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleProfileUpdated = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/customer/profile/${userId}`
      );
      const data = await response.json();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      console.error("Lỗi khi refetch user sau update:", error);
    }
    setShowUpdateModal(false);
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setMessage({ type: "", text: "" });
    setSelectedImage(null);
    setImagePreview(null);
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.FirstName || "",
        lastName: user.LastName || "",
        username: user.Username || "",
        email: user.Email || "",
        gender: user.Gender || "",
        phoneNumber: user.PhoneNumber || "",
        dateOfBirth: user.DateOfBirth
          ? new Date(user.DateOfBirth).toISOString().split("T")[0]
          : "",
      });
    }
  };

  const handleOpenModal = () => {
    setShowUpdateModal(true);
    setMessage({ type: "", text: "" });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleBackToDashboard = () => {
    window.location.href =
      "http://localhost:3000/Ecommerce/admin/admin-dashboard";
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Please select a valid image file" });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "Image size cannot exceed 5MB",
        });
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear any previous error messages
      setMessage({ type: "", text: "" });
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("image-upload-input");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Form handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage({ type: "", text: "" });

    // Validate required fields (after trimming/removing spaces)
    const trimAndRemoveSpaces = (str) => (str || "").replace(/\s+/g, "").trim();
    const trimOnly = (str) => (str || "").trim();
    const requiredFields = [
      trimOnly(formData.firstName),
      trimOnly(formData.lastName),
      trimAndRemoveSpaces(formData.username),
      trimAndRemoveSpaces(formData.email),
      trimOnly(formData.gender),
      trimAndRemoveSpaces(formData.phoneNumber),
      formData.dateOfBirth ? trimOnly(formData.dateOfBirth) : ""
    ];
    if (requiredFields.some((val) => !val)) {
      setFormLoading(false);
      setMessage({ type: "error", text: "All fields are required and cannot be empty or only spaces." });
      return;
    }
    // Validate date of birth is not in the future
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const now = new Date();
      if (dob > now) {
        setFormLoading(false);
        setMessage({ type: "error", text: "Date of birth cannot be in the future." });
        return;
      }
    }

    try {
      // Prepare FormData for both profile info and image
      const form = new FormData();
      form.append("FirstName", trimOnly(formData.firstName));
      form.append("LastName", trimOnly(formData.lastName));
      form.append("Username", trimAndRemoveSpaces(formData.username));
      form.append("Email", trimAndRemoveSpaces(formData.email));
      form.append("Gender", trimOnly(formData.gender));
      form.append("PhoneNumber", trimAndRemoveSpaces(formData.phoneNumber));
      form.append(
        "DateOfBirth",
        formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : ""
      );
      if (selectedImage) {
        form.append("Image", selectedImage);
      }

      const response = await fetch(
        `http://localhost:5000/customer/profile/${userId}`,
        {
          method: "PUT",
          body: form,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "An error occurred while updating information"
        );
      }

      setMessage({
        type: "success",
        text: "Information updated successfully!",
      });
      setTimeout(() => {
        handleProfileUpdated();
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi gửi request:", error);
      setMessage({
        type: "error",
        text: error.message || "Could not connect to server",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && showUpdateModal) {
        handleCloseModal();
      }
    };

    if (showUpdateModal) {
      document.addEventListener("keydown", handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [showUpdateModal]);

  // Inline Styles
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "0.5rem" : "1rem",
    },
    loadingContainer: {
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    loadingContent: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "1rem",
      color: "#374151",
    },
    loadingSpinner: {
      width: "24px",
      height: "24px",
      border: "2px solid #e5e7eb",
      borderTop: "2px solid #3b82f6",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    profileCard: {
      width: "100%",
      maxWidth: "32rem",
      background: "white",
      borderRadius: isMobile ? "1rem" : "1.5rem",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      overflow: "hidden",
      position: "relative",
    },
    backButtonContainer: {
      position: "absolute",
      top: isMobile ? "1rem" : "1.5rem",
      left: isMobile ? "1rem" : "1.5rem",
      zIndex: 10,
    },
    backButton: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: isMobile ? "0.5rem 0.75rem" : "0.75rem 1rem",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      border: "1px solid #e5e7eb",
      borderRadius: "0.75rem",
      color: "#374151",
      fontWeight: "500",
      fontSize: isMobile ? "0.8rem" : "0.875rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    backButtonText: {
      whiteSpace: "nowrap",
      display: isMobile ? "none" : "block",
    },
    backButtonIcon: {
      fontSize: "1.125rem",
      fontWeight: "bold",
    },
    cardContent: {
      padding: isMobile ? "1.5rem" : "2rem",
      paddingTop: isMobile ? "3.5rem" : "4rem",
    },
    avatarSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "1.5rem",
    },
    avatarContainer: {
      position: "relative",
      marginBottom: "1rem",
    },
    avatarBorder: {
      padding: "0.25rem",
      background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
      borderRadius: "50%",
    },
    avatar: {
      width: "8rem",
      height: "8rem",
      border: "4px solid white",
      borderRadius: "50%",
      objectFit: "cover",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    },
    avatarFallback: {
      width: "8rem",
      height: "8rem",
      borderRadius: "50%",
      background: "linear-gradient(to bottom right, #dbeafe, #f3e8ff)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#374151",
      border: "4px solid white",
    },
    userName: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "0.25rem",
      textAlign: "center",
    },
    userHandle: {
      color: "#6b7280",
      textAlign: "center",
    },
    separator: {
      height: "1px",
      backgroundColor: "#e5e7eb",
      margin: "1.5rem 0",
      border: "none",
    },
    infoSection: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    infoRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.5rem 0",
    },
    infoLabel: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    infoIcon: {
      fontSize: "1rem",
      width: "1.2rem",
      textAlign: "center",
    },
    infoLabelText: {
      fontWeight: "500",
      color: "#374151",
    },
    infoValue: {
      color: "#111827",
      textAlign: "right",
      flex: 1,
      marginLeft: "1rem",
      wordBreak: "break-all",
    },
    updateButtonContainer: {
      marginTop: "2rem",
    },
    updateButton: {
      width: "100%",
      height: "3rem",
      borderRadius: "9999px",
      fontWeight: "600",
      background: "linear-gradient(to right, #f97316, #eab308)",
      border: "none",
      color: "white",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      cursor: "pointer",
      fontSize: "1rem",
    },
    updateButtonIcon: {
      fontSize: "1rem",
    },
    errorCard: {
      width: "100%",
      maxWidth: "28rem",
      background: "white",
      borderRadius: "1rem",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    },
    errorContent: {
      padding: "1.5rem",
      textAlign: "center",
    },
    errorText: {
      color: "#6b7280",
      fontSize: "1rem",
      marginBottom: "0.5rem",
    },
    errorSubtext: {
      color: "#9ca3af",
      fontSize: "0.875rem",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "1rem",
      animation: "fadeIn 0.3s ease-out",
    },
    modalContent: {
      background: "white",
      borderRadius: isMobile ? "1rem" : "1.5rem",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
      width: "100%",
      maxWidth: isMobile ? "calc(100vw - 1rem)" : "36rem",
      maxHeight: "90vh",
      overflowY: "auto",
      animation: "slideUp 0.3s ease-out",
      position: "relative",
      margin: isMobile ? "0.5rem" : "0",
    },
    modalHeader: {
      padding: isMobile ? "1.5rem 1.5rem 1rem" : "2rem 2rem 1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #f3f4f6",
    },
    modalTitle: {
      fontSize: isMobile ? "1.25rem" : "1.5rem",
      fontWeight: "bold",
      color: "#111827",
      margin: 0,
    },
    modalClose: {
      background: "#f3f4f6",
      border: "none",
      width: "2.5rem",
      height: "2.5rem",
      borderRadius: "50%",
      cursor: "pointer",
      color: "#6b7280",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.25rem",
      fontWeight: "bold",
      transition: "all 0.2s ease",
    },
    modalBody: {
      padding: isMobile ? "1rem 1.5rem 1.5rem" : "1rem 2rem 2rem",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
    },
    avatarUploadSection: {
      display: "flex",
      alignItems: "center",
      gap: "1.5rem",
      padding: "1rem",
      background: "#f9fafb",
      borderRadius: "1rem",
      border: "2px dashed #e5e7eb",
      transition: "all 0.2s ease",
      flexDirection: isMobile ? "column" : "row",
      textAlign: isMobile ? "center" : "left",
    },
    currentAvatarPreview: {
      flexShrink: 0,
    },
    avatarPreviewImg: {
      width: "4rem",
      height: "4rem",
      borderRadius: "50%",
      objectFit: "cover",
      border: "3px solid white",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    avatarPreviewFallback: {
      width: "4rem",
      height: "4rem",
      borderRadius: "50%",
      background: "linear-gradient(to bottom right, #dbeafe, #f3e8ff)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1rem",
      fontWeight: "bold",
      color: "#374151",
      border: "3px solid white",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    avatarUploadControls: {
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      flex: 1,
      width: isMobile ? "100%" : "auto",
    },
    fileInputHidden: {
      display: "none",
    },
    uploadButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      padding: "0.75rem 1rem",
      background: "linear-gradient(to right, #3b82f6, #1d4ed8)",
      border: "none",
      borderRadius: "0.5rem",
      color: "white",
      fontWeight: "500",
      fontSize: "0.875rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
      width: isMobile ? "100%" : "auto",
    },
    uploadIcon: {
      fontSize: "1rem",
    },
    removeImageButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      padding: "0.5rem 1rem",
      background: "#ef4444",
      border: "none",
      borderRadius: "0.5rem",
      color: "white",
      fontWeight: "500",
      fontSize: "0.875rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
      width: isMobile ? "100%" : "auto",
    },
    removeIcon: {
      fontSize: "0.875rem",
    },
    imageInfo: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginTop: "0.5rem",
      padding: "0.5rem",
      background: "#f0f9ff",
      borderRadius: "0.5rem",
      fontSize: "0.875rem",
      color: "#0369a1",
    },
    imageName: {
      fontWeight: "500",
    },
    imageSize: {
      color: "#64748b",
    },
    gridContainer: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: "1rem",
    },
    fieldGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    label: {
      fontWeight: "600",
      color: "#374151",
      fontSize: "0.875rem",
      marginBottom: "0.25rem",
    },
    input: {
      width: "100%",
      padding: "0.875rem 1rem",
      border: "2px solid #e5e7eb",
      borderRadius: "0.75rem",
      fontSize: "0.875rem",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
      backgroundColor: "#fafafa",
    },
    select: {
      width: "100%",
      padding: "0.875rem 1rem",
      border: "2px solid #e5e7eb",
      borderRadius: "0.75rem",
      fontSize: "0.875rem",
      backgroundColor: "#fafafa",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
    },
    dateInput: {
      width: "100%",
      padding: "0.875rem 1rem",
      border: "2px solid #e5e7eb",
      borderRadius: "0.75rem",
      fontSize: "0.875rem",
      backgroundColor: "#fafafa",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
    },
    buttonContainer: {
      display: "flex",
      gap: "1rem",
      paddingTop: "1rem",
      marginTop: "1rem",
      borderTop: "1px solid #f3f4f6",
      flexDirection: isMobile ? "column" : "row",
    },
    cancelButton: {
      flex: 1,
      padding: "0.875rem 1.5rem",
      background: "#f3f4f6",
      border: "none",
      borderRadius: "0.75rem",
      color: "#374151",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      transition: "all 0.2s ease",
      fontSize: "0.875rem",
    },
    submitButton: {
      flex: isMobile ? 1 : 2,
      padding: "0.875rem 1.5rem",
      background: "linear-gradient(to right, #f97316, #eab308)",
      border: "none",
      borderRadius: "0.75rem",
      color: "white",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      transition: "all 0.2s ease",
      fontSize: "0.875rem",
      boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
    },
    formLoadingIcon: {
      width: "1rem",
      height: "1rem",
      border: "2px solid transparent",
      borderTop: "2px solid white",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    successMessage: {
      background: "#dcfce7",
      border: "1px solid #bbf7d0",
      color: "#166534",
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem",
      fontSize: "0.875rem",
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    errorMessage: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#dc2626",
      padding: "0.75rem 1rem",
      borderRadius: "0.5rem",
      fontSize: "0.875rem",
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
  };

  // Show error if no userId found
  if (!userId && !loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.errorCard}>
          <div style={styles.errorContent}>
            <p style={styles.errorText}>Không tìm thấy thông tin đăng nhập</p>
            <p style={styles.errorSubtext}>Vui lòng đăng nhập lại</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.loadingSpinner}></div>
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.errorCard}>
          <div style={styles.errorContent}>
            <p style={styles.errorText}>Không tìm thấy thông tin người dùng</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add keyframes for animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}
      </style>

      <div style={styles.container}>
        <div style={styles.profileCard}>
          {/* Back Button */}
          <div style={styles.backButtonContainer}>
            <button
              style={styles.backButton}
              onClick={handleBackToDashboard}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(249, 250, 251, 0.98)";
                e.target.style.borderColor = "#d1d5db";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.95)";
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
              }}
            >
              <span style={styles.backButtonIcon}>←</span>
              <span style={styles.backButtonText}>Back to Dashboard</span>
            </button>
          </div>

          <div style={styles.cardContent}>
            {/* Avatar and Name Section */}
            <div style={styles.avatarSection}>
              <div style={styles.avatarContainer}>
                <div style={styles.avatarBorder}>
                  {user.Image ? (
                    <img
                      src={user.Image || "/placeholder.svg"}
                      alt="Profile Avatar"
                      style={styles.avatar}
                    />
                  ) : (
                    <div style={styles.avatarFallback}>
                      {getInitials(user.FirstName, user.LastName)}
                    </div>
                  )}
                </div>
              </div>

              <h2 style={styles.userName}>
                {user.FirstName} {user.LastName}
              </h2>
              <p style={styles.userHandle}>
                {user.Username ? `@${user.Username}` : user.Email}
              </p>
            </div>

            <hr style={styles.separator} />

            {/* User Information */}
            <div style={styles.infoSection}>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>
                  <span style={styles.infoIcon}>📧</span>
                  <span style={styles.infoLabelText}>Email</span>
                </div>
                <span style={styles.infoValue}>{user.Email || "-"}</span>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>
                  <span style={styles.infoIcon}>👤</span>
                  <span style={styles.infoLabelText}>Gender</span>
                </div>
                <span style={styles.infoValue}>{user.Gender || "-"}</span>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>
                  <span style={styles.infoIcon}>📅</span>
                  <span style={styles.infoLabelText}>Date of Birth</span>
                </div>
                <span style={styles.infoValue}>
                  {formatDate(user.DateOfBirth || "")}
                </span>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>
                  <span style={styles.infoIcon}>📞</span>
                  <span style={styles.infoLabelText}>Phone Number</span>
                </div>
                <span style={styles.infoValue}>{user.PhoneNumber || "-"}</span>
              </div>
            </div>

            {/* Update Button */}
            <div style={styles.updateButtonContainer}>
              <button
                style={styles.updateButton}
                onClick={handleOpenModal}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    "linear-gradient(to right, #ea580c, #d97706)";
                  e.target.style.boxShadow =
                    "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    "linear-gradient(to right, #f97316, #eab308)";
                  e.target.style.boxShadow =
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <span style={styles.updateButtonIcon}>✏️</span>
                Update Information
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Update Profile Modal */}
      {showUpdateModal && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Update Personal Information</h3>
              <button
                style={styles.modalClose}
                onClick={handleCloseModal}
                aria-label="Close modal"
                onMouseEnter={(e) => {
                  e.target.style.background = "#e5e7eb";
                  e.target.style.color = "#374151";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#f3f4f6";
                  e.target.style.color = "#6b7280";
                  e.target.style.transform = "scale(1)";
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleSubmit} style={styles.form}>
                {/* Success/Error Message */}
                {message.text && (
                  <div
                    style={
                      message.type === "success"
                        ? styles.successMessage
                        : styles.errorMessage
                    }
                  >
                    {message.text}
                  </div>
                )}

                {/* Avatar Upload Section */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Profile Picture</label>
                  <div
                    style={styles.avatarUploadSection}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.background = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.background = "#f9fafb";
                    }}
                  >
                    <div style={styles.currentAvatarPreview}>
                      {imagePreview ? (
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          style={styles.avatarPreviewImg}
                        />
                      ) : user.Image ? (
                        <img
                          src={user.Image || "/placeholder.svg"}
                          alt="Current Avatar"
                          style={styles.avatarPreviewImg}
                        />
                      ) : (
                        <div style={styles.avatarPreviewFallback}>
                          {getInitials(user.FirstName, user.LastName)}
                        </div>
                      )}
                    </div>

                    <div style={styles.avatarUploadControls}>
                      <input
                        id="image-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        style={styles.fileInputHidden}
                      />

                      <label
                        htmlFor="image-upload-input"
                        style={styles.uploadButton}
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            "linear-gradient(to right, #2563eb, #1e40af)";
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow =
                            "0 4px 12px rgba(59, 130, 246, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background =
                            "linear-gradient(to right, #3b82f6, #1d4ed8)";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 2px 8px rgba(59, 130, 246, 0.3)";
                        }}
                      >
                        <span style={styles.uploadIcon}>📷</span>
                        {selectedImage ? "Change Image" : "Select Image"}
                      </label>

                      {selectedImage && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          style={styles.removeImageButton}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#dc2626";
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow =
                              "0 4px 12px rgba(239, 68, 68, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#ef4444";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow =
                              "0 2px 8px rgba(239, 68, 68, 0.3)";
                          }}
                        >
                          <span style={styles.removeIcon}>🗑️</span>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedImage && (
                    <div style={styles.imageInfo}>
                      <span style={styles.imageName}>
                        📎 {selectedImage.name}
                      </span>
                      <span style={styles.imageSize}>
                        ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  )}
                </div>

                <div style={styles.gridContainer}>
                  <div style={styles.fieldGroup}>
                    <label htmlFor="firstName" style={styles.label}>
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      placeholder="Enter first name"
                      style={styles.input}
                      required
                      onFocus={(e) => {
                        e.target.style.outline = "none";
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                        e.target.style.backgroundColor = "white";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e5e7eb";
                        e.target.style.boxShadow = "none";
                        e.target.style.backgroundColor = "#fafafa";
                      }}
                    />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label htmlFor="lastName" style={styles.label}>
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      placeholder="Enter last name"
                      style={styles.input}
                      required
                      onFocus={(e) => {
                        e.target.style.outline = "none";
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                        e.target.style.backgroundColor = "white";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e5e7eb";
                        e.target.style.boxShadow = "none";
                        e.target.style.backgroundColor = "#fafafa";
                      }}
                    />
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="username" style={styles.label}>
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder="Enter username"
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.borderColor = "#3b82f6";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      e.target.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                      e.target.style.backgroundColor = "#fafafa";
                    }}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="email" style={styles.label}>
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email"
                    style={styles.input}
                    required
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.borderColor = "#3b82f6";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      e.target.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                      e.target.style.backgroundColor = "#fafafa";
                    }}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="gender" style={styles.label}>
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    style={styles.select}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.borderColor = "#3b82f6";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      e.target.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                      e.target.style.backgroundColor = "#fafafa";
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="dateOfBirth" style={styles.label}>
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    style={styles.dateInput}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.borderColor = "#3b82f6";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      e.target.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                      e.target.style.backgroundColor = "#fafafa";
                    }}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="phoneNumber" style={styles.label}>
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    placeholder="Enter phone number"
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.borderColor = "#3b82f6";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      e.target.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                      e.target.style.backgroundColor = "#fafafa";
                    }}
                  />
                </div>

                <div style={styles.buttonContainer}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={styles.cancelButton}
                    disabled={formLoading}
                    onMouseEnter={(e) => {
                      if (!formLoading) {
                        e.target.style.background = "#e5e7eb";
                        e.target.style.color = "#111827";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formLoading) {
                        e.target.style.background = "#f3f4f6";
                        e.target.style.color = "#374151";
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    style={{
                      ...styles.submitButton,
                      opacity: formLoading ? 0.6 : 1,
                      cursor: formLoading ? "not-allowed" : "pointer",
                      transform: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!formLoading) {
                        e.target.style.background =
                          "linear-gradient(to right, #ea580c, #d97706)";
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow =
                          "0 6px 16px rgba(249, 115, 22, 0.4)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formLoading) {
                        e.target.style.background =
                          "linear-gradient(to right, #f97316, #eab308)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 4px 12px rgba(249, 115, 22, 0.3)";
                      }
                    }}
                  >
                    {formLoading && <div style={styles.formLoadingIcon}></div>}
                    {formLoading ? "Updating..." : "Update Information"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfileView;
