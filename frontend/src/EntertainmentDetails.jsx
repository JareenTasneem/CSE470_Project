import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // <-- Added Link import
import axios from "./axiosConfig";

function EntertainmentDetails() {
  const { id } = useParams();
  const [ent, setEnt] = useState(null);

  useEffect(() => {
    axios.get(`/entertainments/${id}`).then((res) => setEnt(res.data));
  }, [id]);

  if (!ent) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Poppins, sans-serif" }}>
      <h2>{ent.entertainmentName}</h2>
      <img src={ent.images?.[0]} style={{ maxWidth: "300px" }} />
      <p><strong>Location:</strong> {ent.location}</p>
      <p><strong>Description:</strong> {ent.description}</p>
      <p><strong>Price:</strong> ${ent.price}</p>
      <Link to="/customize-package">
        <button style={{ marginBottom: '10px' }}>← Back to Customize</button>
      </Link>
    </div>
  );
}

export default EntertainmentDetails;
