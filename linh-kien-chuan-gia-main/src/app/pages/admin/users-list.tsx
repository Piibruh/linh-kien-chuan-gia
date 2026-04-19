import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Users as UsersIcon,
  Shield,
  ShieldAlert,
  Mail,
  Phone,
  Calendar,
  Eye,
  X,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStore, StoredUser } from '../../../store/adminStore';
import { UserRole } from '../../../store/authStore';

type SortField = 'name' | 'email' | 'role' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function UsersList() {
  const navigate = useNavigate();
  const { users, orders, deleteUser, updateUserRole } = useAdminStore();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<StoredUser | null>(null);

  const handleViewUser = (u: StoredUser) => setSelectedUser(u);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter((u) => {
      // Search filter
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.phone && u.phone.includes(searchQuery));

      // Role filter
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') comparison = a.name.localeCompare(b.name);
      if (sortField === 'email') comparison = a.email.localeCompare(b.email);
      if (sortField === 'role') comparison = a.role.localeCompare(b.role);
      if (sortField === 'createdAt')
        comparison = new Date((a as any).createdAt || 0).getTime() - new Date((b as any).createdAt || 0).getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [users, searchQuery, roleFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  // Bulk selection
  const isAllSelected =
    paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedUsers.has(u.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const newSet = new Set(selectedUsers);
      paginatedUsers.forEach((u) => newSet.delete(u.id));
      setSelectedUsers(newSet);
    } else {
      const newSet = new Set(selectedUsers);
      paginatedUsers.forEach((u) => newSet.add(u.id));
      setSelectedUsers(newSet);
    }
  };

  const handleSelectUser = (id: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedUsers(newSet);
  };

  // Actions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${name}"?`)) return;

    setDeletingUserId(id);
    try {
      await deleteUser(id);
      toast.success(`Đã xóa người dùng "${name}"`);

      // Remove from selection if selected
      const newSet = new Set(selectedUsers);
      newSet.delete(id);
      setSelectedUsers(newSet);
    } catch {
      toast.error('Không thể xóa người dùng');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) {
      toast.error('Vui lòng chọn ít nhất một người dùng');
      return;
    }

    const count = selectedUsers.size;
    if (!confirm(`Bạn có chắc muốn xóa ${count} người dùng đã chọn?`)) return;

    setBulkDeleteLoading(true);
    try {
      const promises = Array.from(selectedUsers).map((id) => deleteUser(id));
      await Promise.all(promises);
      toast.success(`Đã xóa ${count} người dùng thành công`);
      setSelectedUsers(new Set());
    } catch {
      toast.error('Có lỗi xảy ra khi xóa người dùng');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, newRole);
      toast.success('Đã cập nhật vai trò người dùng');
    } catch {
      toast.error('Không thể cập nhật vai trò');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    if (role === 'admin') return 'bg-red-100 text-red-800 border-red-200';
    if (role === 'staff') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getRoleLabel = (role: UserRole) => {
    if (role === 'admin') return 'Admin';
    if (role === 'staff') return 'Nhân viên';
    return 'User';
  };

  const getRoleIcon = (role: UserRole) => {
    if (role === 'admin') return <ShieldAlert className="w-3 h-3" />;
    if (role === 'staff') return <Shield className="w-3 h-3" />;
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const roleStats = useMemo(() => {
    const stats = {
      admin: users.filter((u) => u.role === 'admin').length,
      staff: users.filter((u) => u.role === 'staff').length,
      user: users.filter((u) => u.role === 'user').length,
    };
    return stats;
  }, [users]);

  return (
    <div className="min-h-screen bg-[#f6f7f7]">
      {/* Header */}
      <div className="bg-white border-b border-[#c3c4c7] sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin?tab=customers')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-[#1d2327]">Quản lý người dùng</h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {filteredUsers.length} người dùng
                  {selectedUsers.size > 0 && ` (${selectedUsers.size} đã chọn)`}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/users/add')}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#2271b1] rounded hover:bg-[#135e96] transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm người dùng
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-[#c3c4c7] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UsersIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-[#1d2327]">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#c3c4c7] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Admin</p>
                <p className="text-2xl font-bold text-[#1d2327]">{roleStats.admin}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#c3c4c7] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nhân viên</p>
                <p className="text-2xl font-bold text-[#1d2327]">{roleStats.staff}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#c3c4c7] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <UsersIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">User</p>
                <p className="text-2xl font-bold text-[#1d2327]">{roleStats.user}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-[#c3c4c7] rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-[#c3c4c7] flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm người dùng..."
                  className="w-full pl-10 pr-4 py-2 border border-[#8c8f94] rounded focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-[#8c8f94] rounded hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
                {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleteLoading}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {bulkDeleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Xóa ({selectedUsers.size})
                  </>
                )}
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="p-4 bg-gray-50 border-t border-[#c3c4c7] grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Vai trò</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
                >
                  <option value="all">Tất cả</option>
                  <option value="user">User</option>
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Hiển thị</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
                >
                  <option value={20}>20 người dùng/trang</option>
                  <option value={50}>50 người dùng/trang</option>
                  <option value={100}>100 người dùng/trang</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white border border-[#c3c4c7] rounded-lg shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-1">Không tìm thấy người dùng</p>
              <p className="text-sm text-gray-500">Thử thay đổi bộ lọc hoặc thêm người dùng mới</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[#c3c4c7]">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Tên
                          {sortField === 'name' && (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center gap-1">
                          Email
                          {sortField === 'email' && (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Điện thoại
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('role')}
                      >
                        <div className="flex items-center gap-1">
                          Vai trò
                          {sortField === 'role' && (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1">
                          Ngày tạo
                          {sortField === 'createdAt' && (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c3c4c7]">
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedUsers.has(user.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#1d2327] text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">ID: {user.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {getRoleIcon(user.role)}
                              {getRoleLabel(user.role)}
                            </span>
                            {updatingUserId === user.id && (
                              <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/users/edit?id=${user.id}`)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Sửa"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              disabled={deletingUserId === user.id}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Xóa"
                            >
                              {deletingUserId === user.id ? (
                                <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-red-600" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-[#c3c4c7] flex items-center justify-between bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)} trong tổng số{' '}
                    {filteredUsers.length} người dùng
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-[#8c8f94] rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Trước
                    </button>

                    {/* Page numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 border rounded text-sm transition-colors ${
                              currentPage === pageNum
                                ? 'bg-[#2271b1] text-white border-[#2271b1]'
                                : 'border-[#8c8f94] hover:bg-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-[#8c8f94] rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
            onClick={(e) => e.target === e.currentTarget && setSelectedUser(null)}>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2271b1] to-[#135e96] rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedUser.name}</h2>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-widest border ${
                        selectedUser.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' :
                        selectedUser.role === 'staff' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {getRoleLabel(selectedUser.role)}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">ID: {selectedUser.id}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-2.5 hover:bg-gray-200 rounded-2xl transition-colors bg-white border border-gray-100 shadow-sm">
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Địa chỉ Email</label>
                    <p className="text-base font-bold text-gray-900 flex items-center gap-3"><Mail className="h-4.5 w-4.5 text-[#2271b1]" /> {selectedUser.email}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Số điện thoại</label>
                    <p className="text-base font-bold text-gray-900 flex items-center gap-3"><Phone className="h-4.5 w-4.5 text-[#2271b1]" /> {selectedUser.phone || 'Chưa cung cấp'}</p>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Địa chỉ nhận hàng mặc định</label>
                    <p className="text-base font-bold text-gray-900 flex items-center gap-3"><MapPin className="h-4.5 w-4.5 text-[#2271b1]" /> {selectedUser.address || 'Chưa cập nhật địa chỉ'}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Lịch sử đơn hàng gần đây</label>
                    <span className="text-[10px] font-black text-[#2271b1] px-2 py-0.5 bg-blue-50 rounded-full">
                      Tổng: {orders.filter(o => o.customerId === selectedUser.id || o.customerEmail === selectedUser.email).length} đơn
                    </span>
                  </div>
                  <div className="space-y-3">
                    {orders.filter(o => o.customerId === selectedUser.id || o.customerEmail === selectedUser.email).length === 0 ? (
                      <div className="p-6 bg-gray-50 rounded-2xl text-center text-sm text-gray-400 font-bold border border-gray-100 border-dashed">Người dùng này chưa có đơn hàng nào</div>
                    ) : (
                      orders.filter(o => o.customerId === selectedUser.id || o.customerEmail === selectedUser.email).slice(0, 3).map(o => (
                        <div key={o.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all cursor-pointer group"
                          onClick={() => { setSelectedUser(null); navigate(`/admin/orders?search=${o.id}`); }}>
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:bg-blue-50 transition-colors">
                              <Calendar className="h-4 w-4 text-gray-400 group-hover:text-[#2271b1]" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-[#2271b1]">{o.id}</p>
                              <p className="text-[10px] text-gray-400 font-bold mt-0.5">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-gray-900">{o.totalAmount.toLocaleString('vi-VN')}₫</p>
                            <p className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${
                              o.status === 'completed' ? 'text-green-600' :
                              o.status === 'cancelled' ? 'text-red-600' : 'text-[#2271b1]'
                            }`}>{o.status}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {orders.filter(o => o.customerId === selectedUser.id || o.customerEmail === selectedUser.email).length > 3 && (
                    <button onClick={() => { setSelectedUser(null); navigate(`/admin/orders?search=${selectedUser.email}`); }}
                      className="w-full text-center mt-4 py-2 text-xs text-[#2271b1] hover:underline font-black uppercase tracking-[0.1em]">Xem tất cả lịch sử mua hàng</button>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => { setSelectedUser(null); navigate(`/admin/users/edit?id=${selectedUser.id}`); }}
                    className="flex-1 bg-[#2271b1] text-white py-4 rounded-2xl font-black text-sm hover:bg-[#135e96] transition-all shadow-lg hover:shadow-xl translate-y-0 active:translate-y-1">CHỈNH SỬA TÀI KHOẢN</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
