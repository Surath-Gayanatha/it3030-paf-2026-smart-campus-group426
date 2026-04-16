import { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import UserManagement from '../components/UserManagement';
import ResourceManagement from '../components/Admin/ResourceManagement';
import AdminAnalytics from '../components/Admin/AdminAnalytics';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
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
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleEditRole = (targetUser) => {
    setEditingUserId(targetUser.id);
    setSelectedRole(targetUser.role);
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
          <h1 className="admin-title">Admin Control Center</h1>
          <p className="admin-subtitle">Manage workspace resources, users, and track campus operations.</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} 
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`admin-tab ${activeTab === 'resources' ? 'active' : ''}`} 
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
          <button 
            className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`} 
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        {toast.message && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}

        <div className="admin-content">
          {activeTab === 'users' && (
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
          )}
          {activeTab === 'resources' && <ResourceManagement />}
          {activeTab === 'analytics' && <AdminAnalytics />}
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;
