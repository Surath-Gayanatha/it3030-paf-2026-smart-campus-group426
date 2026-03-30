import { useEffect, useState } from "react";
import API from "./api/api";

function App() {
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
    <div style={{ padding: "20px" }}>
      <h1>🏫 Smart Campus Resources</h1>

      <button onClick={addResource}>Add Sample Resource</button>

      {resources.length === 0 ? (
        <p>No resources found</p>
      ) : (
        resources.map((item) => (
          <div key={item.id}>
            <p>{item.name}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;