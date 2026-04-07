import React, { useEffect, useState } from "react";
import API from "../api/api";

const Resources = () => {
  const [resources, setResources] = useState([]);

  const fetchResources = () => {
    API.get("/resources")
      .then((res) => setResources(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const addResource = () => {
    API.post("/resources", {
      name: "Lab A",
      type: "Room",
      capacity: 50,
      location: "Building A",
      status: "ACTIVE",
    }).then(() => fetchResources());
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
      <h1 style={{ marginTop: 0, fontSize: '1.85rem', fontWeight: 800, marginBottom: '12px' }}>🏫 Campus Resources</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontWeight: 500 }}>
        Manage all campus facilities and properties from this central module.
      </p>

      <button className="premium-btn" onClick={addResource}>Add Sample Resource</button>

      <div style={{ marginTop: '32px', display: 'grid', gap: '12px' }}>
        {resources.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No resources found in the database.
          </div>
        ) : (
          resources.map((item) => (
            <div key={item.id} className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{item.name}</strong>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {item.location} • {item.type}
                </div>
              </div>
              <span className="status-chip" style={{ background: '#F1F5F9', color: '#475569' }}>{item.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Resources;
