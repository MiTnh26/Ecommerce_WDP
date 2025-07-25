"use client";

import { useState, useEffect } from "react";
import "../../style/admin/UserManagement.css";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Calendar,
  ShoppingCart,
  User,
  Mail,
  Phone,
  Activity,
  Info,
  Ban,
  Check,
} from "lucide-react";
import { useMemo } from "react";

function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/admin/getUser`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Data fetch thành công:", data);
        setUserList(data);
      })
      .catch((err) => console.error("❌ Lỗi khi lấy thông tin user:", err));
  }, []);

  const filteredUsers = userList.filter((user) => {
    const normalize = (str) => (str || "").toLowerCase().replace(/\s+/g, "");
    const search = normalize(searchTerm);
    const username = normalize(user.Username);
    const email = normalize(user.Email);

    const matchesSearch =
      username.includes(search) || email.includes(search);

    const matchesRole = roleFilter === "" || user.UserRole === roleFilter;
    const matchesStatus = statusFilter === "" || user.Status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (Status) => {
    switch (Status) {
      case "Active":
        return <span className="status-badge status-active">Active</span>;

      case "Banned":
        return <span className="status-badge status-banned">Banned</span>;
      default:
        return <span className="status-badge status-default">{Status}</span>;
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const response = await fetch(
        `http://localhost:5000/admin/banUserById/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(),
        }
      );

      if (!response.ok) {
        throw new Error("Cập nhật trạng thái thất bại");
      }

      const result = await response.json();
      console.log("✅ Cập nhật thành công:", result);

      fetch(`http://localhost:5000/admin/getUser`)
        .then((res) => res.json())
        .then((data) => setUserList(data));
    } catch (error) {
      console.error("❌ Lỗi cập nhật trạng thái người dùng:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái người dùng.");
    }
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      Seller: { text: "Seller", class: "badge-info" },
      Customer: { text: "Customer", class: "badge-light" },
    };
    const roleInfo = roleMap[role] || { text: role, class: "badge-secondary" };
    return <span className={`badge ${roleInfo.class}`}>{roleInfo.text}</span>;
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const stats = useMemo(() => {
    return {
      total: userList.length,
      active: userList.filter((u) => u.Status === "Active").length,
      banned: userList.filter((u) => u.Status === "Banned").length,
    };
  }, [userList]);

  return (
    <AdminLayout currentPage="users" pageTitle="Manage Users">
      {/* Stats Cards */}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Accounts</span>
            <i className="ti ti-users stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Accounts</span>
            <i className="ti ti-user-check stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.active}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Banned Accounts</span>
            <i className="ti ti-user-x stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.banned}</div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">
            <h3>Customer List</h3>
            <p>Manage All Account In System</p>
          </div>
        </div>

        <div className="table-controls">
          <div className="controls-wrapper">
            {/* Search */}
            <div className="search-container">
              <div className="search-box">
                <i className="ti ti-search"></i>
                <input
                  type="text"
                  placeholder="Find Account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="filter-container">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Role</option>
                <option value="Seller">Seller</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="filter-container">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Banned">Banned</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(roleFilter || statusFilter || searchTerm) && (
              <button
                onClick={() => {
                  setRoleFilter("");
                  setStatusFilter("");
                  setSearchTerm("");
                }}
                className="clear-filters-btn"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <img
                        src={user.Image || "/placeholder.svg"}
                        alt={user.Username}
                        className="user-avatar-small"
                      />
                      <div className="user-details">
                        <div className="user-name">{user.Username}</div>
                        <div className="user-email">{user.Email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{getRoleBadge(user.UserRole)}</td>
                  <td>{getStatusBadge(user.Status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleViewUser(user)}
                        title="Xem chi tiết"
                      >
                        <i className="ti ti-eye"></i>
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`btn-action ${
                          user.Status === "Banned"
                            ? "btn-active"
                            : "btn-suspend"
                        }`}
                        title={user.Status === "Banned" ? "Active" : "Ban"}
                      >
                        {user.Status === "Banned" ? (
                          <Check className="icon-small" />
                        ) : (
                          <Ban className="icon-small" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div
            className="modal-content user-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Chi tiết người dùng</h3>
              <button
                className="modal-close"
                onClick={() => setShowUserModal(false)}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details-content">
                <div className="user-header">
                  <img
                    src={selectedUser.Image || "/placeholder.svg"}
                    alt={selectedUser.Username}
                    className="user-avatar-large"
                  />
                  <div className="user-info-large">
                    <h4>{selectedUser.Username}</h4>
                    <p>{selectedUser.Email}</p>
                    <div className="user-role-large">
                      {getRoleBadge(selectedUser.UserRole)}
                    </div>
                  </div>
                  <div className="user-status-large">
                    {getStatusBadge(selectedUser.Status)}
                  </div>
                </div>

                <div className="user-stats">
                  <div className="stat-item">
                    <i className="ti ti-calendar"></i>
                    <div>
                      <span className="stat-label">Ngày tham gia</span>
                      <span className="stat-value">
                        {new Date(selectedUser.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <i className="ti ti-shopping-cart"></i>
                    <div>
                      <span className="stat-label">Tổng đơn hàng</span>
                      <span className="stat-value">
                        {selectedUser.totalOrders || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="user-contact">
                  <h5>Thông tin cá nhân</h5>
                  <div className="contact-item">
                    <i className="ti ti-user"></i>
                    <span>
                      {selectedUser.FirstName} {selectedUser.LastName}
                    </span>
                  </div>
                  <div className="contact-item">
                    <i className="ti ti-mail"></i>
                    <span>{selectedUser.Email}</span>
                  </div>
                  <div className="contact-item">
                    <i className="ti ti-phone"></i>
                    <span>{selectedUser.PhoneNumber || "Chưa cập nhật"}</span>
                  </div>

                  <div className="contact-item">
                    <i className="ti ti-calendar"></i>
                    <span>
                      Sinh nhật:{" "}
                      {selectedUser.DateOfBirth
                        ? new Date(selectedUser.DateOfBirth).toLocaleDateString(
                            "vi-VN",
                            {
                              timeZone: "Asia/Ho_Chi_Minh",
                            }
                          )
                        : "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default UserManagement;
