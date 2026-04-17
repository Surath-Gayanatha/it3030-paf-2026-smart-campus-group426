const roleClassName = {
  USER: 'user-role user-role--user',
  ADMIN: 'user-role user-role--admin',
  LECTURER: 'user-role user-role--lecturer',
  TECHNICIAN: 'user-role user-role--technician',
};

const UserManagement = ({ users, loading, editingUserId, selectedRole, selectedTechCategory, onEditRole, onRoleChange, onTechCategoryChange, onCancel, onConfirm }) => {
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
            <th>Request</th>
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
                <span className={roleClassName[user.role] || 'user-role'}>{user.role === 'TECHNICIAN' && user.techCategory && user.techCategory !== 'NONE' ? `TECHNICIAN (${user.techCategory})` : user.role}</span>
              </td>
              <td>
                {user.roleRequestStatus === 'PENDING' && user.requestedRole ? (
                  <span className="user-role user-role--pending">{`PENDING: ${user.requestedRole === 'TECHNICIAN' && user.requestedTechCategory && user.requestedTechCategory !== 'NONE' ? `TECHNICIAN (${user.requestedTechCategory})` : user.requestedRole}`}</span>
                ) : (
                  <span className="user-role">{user.roleRequestStatus || 'NONE'}</span>
                )}
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
                      <option value="LECTURER">LECTURER</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                    </select>

                    {selectedRole === 'TECHNICIAN' && (
                      <select
                        value={selectedTechCategory}
                        onChange={(event) => onTechCategoryChange(event.target.value)}
                        className="admin-select"
                      >
                        <option value="IT_EQUIPMENT">IT Equipment</option>
                        <option value="ELECTRICAL">Electrical</option>
                        <option value="PLUMBING">Plumbing</option>
                        <option value="HVAC">HVAC</option>
                        <option value="FURNITURE">Furniture</option>
                        <option value="NONE">None</option>
                      </select>
                    )}

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
