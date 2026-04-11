const roleClassName = {
  USER: 'user-role user-role--user',
  ADMIN: 'user-role user-role--admin',
  TECHNICIAN: 'user-role user-role--technician',
};

const UserManagement = ({ users, loading, editingUserId, selectedRole, onEditRole, onRoleChange, onCancel, onConfirm }) => {
  if (loading) {
    return <div className="admin__state">Loading users...</div>;
  }

  if (!users.length) {
    return <div className="admin__state">No users found.</div>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="admin-user">
                  <img
                    src={user.profilePicture || 'https://via.placeholder.com/40'}
                    alt={user.name || user.email}
                    className="admin-user__avatar"
                  />
                  <span>{user.name || 'No Name'}</span>
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                <span className={roleClassName[user.role] || 'user-role'}>{user.role}</span>
              </td>
              <td>
                {editingUserId === user.id ? (
                  <div className="admin-actions">
                    <select
                      value={selectedRole}
                      onChange={(event) => onRoleChange(event.target.value)}
                      className="admin-select"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                    </select>
                    <button className="admin-btn admin-btn--primary" onClick={() => onConfirm(user)} type="button">
                      Save
                    </button>
                    <button className="admin-btn" onClick={onCancel} type="button">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button className="admin-btn" onClick={() => onEditRole(user)} type="button">
                    Edit Role
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
