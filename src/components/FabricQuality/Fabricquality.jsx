import React, { useState, useEffect } from "react";
import axios from "axios";

const Fabricquality = () => {
  const [qualityName, setQualityName] = useState("");
  const [fabrics, setFabrics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://kukadiya-textile.onrender.com";

  const API_URL = `${API_BASE_URL}/api/fabrics`;

  const fetchFabrics = async () => {
    try {
      const response = await axios.get(API_URL);
      setFabrics(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFabrics();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!qualityName) return alert("Please enter a fabric name");

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, {
          fabricName: qualityName,
        });
        alert("Quality updated successfully");
        setEditId(null);
      } else {
        await axios.post(API_URL, {
          fabricName: qualityName,
        });
      }

      setQualityName("");
      fetchFabrics();

    } catch (err) {
      alert(err.response?.data?.message || "Error saving quality");
    }
  };

  const handleEdit = (item) => {
    setQualityName(item.fabric_name);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quality?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchFabrics();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const filteredFabrics = fabrics.filter((item) =>
    item.fabric_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="FabricQuality-section">
      <div className="container">
        <div className="row">

          <form onSubmit={handleSubmit}>
            <div className="input-box">

              <input
                type="text"
                placeholder="Add New Quality"
                value={qualityName}
                onChange={(e) => setQualityName(e.target.value)}
              />

              <button type="submit">
                {editId ? "Update Quality" : "Add Quality"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setQualityName("");
                  }}
                >
                  Cancel
                </button>
              )}

            </div>
          </form>

          <hr />

          <div className="search-box">
            <input
              type="text"
              placeholder="Search qualities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="main-box">
            <table border="1" width="100%" style={{"border": "1px solid"}}>
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Quality Name</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredFabrics.length > 0 ? (
                  filteredFabrics.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>

                      <td>{item.fabric_name}</td>

                      <td>

                        <button
                          onClick={() => handleEdit(item)}
                          style={{
                            backgroundColor: "#16a34a",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginLeft: "10px"
                          }}
                        >
                          Edit
                        </button>


                        <button
                          onClick={() => handleDelete(item._id)}
                          style={{
                            backgroundColor: "#dc2626",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginLeft: "10px"
                          }}
                        >
                          Delete
                        </button>

                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center" }}>
                      No Fabric found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Fabricquality;