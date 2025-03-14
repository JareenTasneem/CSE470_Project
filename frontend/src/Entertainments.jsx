import React, { useContext, useEffect, useState } from "react";
import { CustomizeContext } from "./CustomizeContext";
import axios from "axios";

function Entertainments() {
  const [entertainments, setEntertainments] = useState([]);
  const { addToCustomizeLog } = useContext(CustomizeContext);

  useEffect(() => {
    // Example: fetch entertainment options
    axios.get("http://localhost:5000/api/entertainments")
      .then((res) => setEntertainments(res.data))
      .catch((err) => console.error("Error fetching entertainments:", err));
  }, []);

  const handleBookEntertainment = (ent) => {
    addToCustomizeLog({ type: "entertainment", data: ent });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Entertainments</h2>
      {entertainments.map((ent) => (
        <div key={ent._id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
          <h4>{ent.title}</h4>
          <p>Location: {ent.location}</p>
          <button onClick={() => handleBookEntertainment(ent)}>Add to Customize Log</button>
        </div>
      ))}
    </div>
  );
}

export default Entertainments;
