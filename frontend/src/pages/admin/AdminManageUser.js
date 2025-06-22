import { useState, useEffect } from "react";
import "../../style/UserManagement.css";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Eye,
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
  }, []); // ✅ Chạy một lần duy nhất

  const filteredUsers = userList.filter((user) => {
    const matchesSearch =
      user.Username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "" || user.UserRole === roleFilter;
    const matchesStatus = statusFilter === "" || user.Status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (Status) => {
    switch (Status) {
      case "Active":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Active
          </span>
        );

      case "Banned":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            Banned
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            {Status}
          </span>
        );
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

      // Sau khi cập nhật thành công, làm mới danh sách người dùng (hoặc cập nhật thủ công nếu cần)
      // Ví dụ: gọi lại API getUser
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

  // const handleDeleteUser = (userId) => {
  //   if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
  //     console.log("Deleting user:", userId);
  //   }
  // };
  const stats = useMemo(() => {
    return {
      total: userList.length,
      active: userList.filter((u) => u.Status === "Active").length,
      banned: userList.filter((u) => u.Status === "Banned").length,
    };
  }, [userList]);
  return (
    <AdminLayout currentPage="users" pageTitle="Quản lý người dùng">
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
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="relative  min-w-64">
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
            <div className="min-w-40">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Role</option>

                <option value="Seller">Seller</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="min-w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`p-1 rounded ${
                          user.Status === "Banned"
                            ? "text-green-600 hover:text-green-900"
                            : "text-orange-600 hover:text-orange-900"
                        }`}
                        title={user.Status === "Banned" ? "Active" : "Banned"}
                      >
                        {user.Status === "Banned" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                      </button>
                      {/* <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteUser(user._id)}
                        title="Delete"
                      >
                        <i className="ti ti-trash"></i>
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Account Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* User Header */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                    <img
                      src={selectedUser.Image}
                      alt={selectedUser.Username}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedUser.Username}
                    </h4>
                    <p className="text-gray-600">{selectedUser.Email}</p>
                    <div className="mt-2">
                      {getRoleBadge(selectedUser.UserRole)}
                    </div>
                  </div>
                  <div>{getStatusBadge(selectedUser.Status)}</div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">Joining Date</div>
                      <div className="text-lg font-semibold">
                        {new Date(selectedUser.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <ShoppingCart className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                      <div className="text-lg font-semibold">
                        {selectedUser.totalOrders || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h5 className="text-lg font-semibold mb-4">
                    Contact Information
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-400" />
                      <span>
                        Full Name: {selectedUser.FirstName || "Not Updated"}{" "}
                        {selectedUser.LastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span>Email: {selectedUser.Email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span>
                        Phone Number:{" "}
                        {selectedUser.PhoneNumber || "Not Updated"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span>
                        {selectedUser && (
                          <div>
                            <span>
                              Date Of Birth:{" "}
                              {selectedUser.DateOfBirth
                                ? new Date(
                                    selectedUser.DateOfBirth
                                  ).toLocaleDateString("vi-VN")
                                : "Not Updated"}
                            </span>
                          </div>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div>
                  <h5 className="text-lg font-semibold mb-4">
                    Recent Activities
                  </h5>
                  <div className="space-y-3">
                    {selectedUser.recentActivities?.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {activity.text}
                          </div>
                          <div className="text-sm text-gray-600">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="flex items-center justify-center gap-2 p-8 text-gray-500">
                        <Info className="h-6 w-6" />
                        <span>No activity yet</span>
                      </div>
                    )}
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
