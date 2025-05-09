import React, { useEffect, useState } from 'react';
import axios from './axiosConfig';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaHotel, FaPlane, FaMapMarkedAlt } from 'react-icons/fa';
import { useAuth } from './contexts/AuthContext';

const ACCENT = '#ffc107';
const iconFor = (t) =>
  t === 'Hotel' ? <FaHotel style={{ marginRight: 6 }} /> :
  t === 'Flight' ? <FaPlane style={{ marginRight: 6 }} /> :
  t === 'TourPackage' ? <FaMapMarkedAlt style={{ marginRight: 6 }} /> :
  null;

export default function MyHistory() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/reviews/my-reviews', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setReviews(data);
      } catch (e) {
        setErr(e.response?.data?.message || 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user.token]);

  /* ---------- loading / error / empty states ---------- */
  if (loading)
    return (
      <Container className="py-5 d-flex justify-content-center">
        <Spinner animation="border" variant="warning" />
      </Container>
    );

  if (err)
    return (
      <Container className="py-5">
        <Alert variant="danger">{err}</Alert>
      </Container>
    );

  if (!reviews.length)
    return (
      <Container className="py-5">
        <Alert variant="info">
          You haven’t written any reviews yet.
        </Alert>
      </Container>
    );

  /* -------------------- card list --------------------- */
  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">My Reviews</h2>

      {reviews.map((r) => (
        <div
          key={r._id}
          style={{
            padding: 15,
            border: '1px solid #ddd',
            borderRadius: 8,
            marginBottom: 15,
            background: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,.08)',
          }}
        >
          {/* header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            {iconFor(r.item_type)}
            <span style={{ fontWeight: 700, fontSize: 18 }}>
              {r.itemName}
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 13,
                color: '#666',
              }}
            >
              {r.item_type}
            </span>
          </div>

          {/* stars */}
          <div style={{ marginBottom: 6 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <FaStar
                key={s}
                style={{
                  color: s <= r.rating ? ACCENT : '#e4e5e9',
                  marginRight: 2,
                }}
              />
            ))}
          </div>

          {/* review title / text */}
          <div
            style={{
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 4,
            }}
          >
            {r.title}
          </div>
          <div style={{ fontSize: 15, color: '#444' }}>{r.comment}</div>

          {/* date */}
          <div
            style={{
              fontSize: 13,
              color: '#888',
              marginTop: 8,
            }}
          >
            {new Date(r.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </Container>
  );
}
