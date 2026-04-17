import { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import UserManagement from '../components/UserManagement';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('USER');
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: '', message: '' });
    }, 2500);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      setUsers(response.data || []);
    } catch (error) {
      showToast('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditRole = (targetUser) => {
    setEditingUserId(targetUser.id);
    setSelectedRole(targetUser.roleRequestStatus === 'PENDING' ? targetUser.requestedRole : targetUser.role);
  };

  const handleCancel = () => {
    setEditingUserId('');
    setSelectedRole('USER');
  };

  const handleConfirmRoleChange = async (targetUser) => {
    if (selectedRole === targetUser.role) {
      handleCancel();
      return;
    }

    const confirmation = window.confirm(
      `Change role for ${targetUser.name || targetUser.email} from ${targetUser.role} to ${selectedRole}?`
    );

    if (!confirmation) {
      return;
    }

    try {
      const response = await api.put(`/auth/users/${targetUser.id}/role`, null, {
        params: { role: selectedRole },
      });

      setUsers((prev) => prev.map((item) => (item.id === targetUser.id ? response.data : item)));
      showToast('success', 'User role updated successfully');
      handleCancel();
    } catch (error) {
      showToast('error', 'Failed to update role');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="admin__state">You do not have access to this page.</div>;
  }

  return (
    <section className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">Manage user access roles for Smart Campus Operations Hub.</p>
        </div>

        {toast.message && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}

        <UserManagement
          users={users}
          loading={loading}
          editingUserId={editingUserId}
          selectedRole={selectedRole}
          onEditRole={handleEditRole}
          onRoleChange={setSelectedRole}
          onCancel={handleCancel}
          onConfirm={handleConfirmRoleChange}
        />
      </div>
    </section>
  );
};

export default AdminPanel;
