import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from './axiosConfig';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import { useAuth } from './contexts/AuthContext';

const accentColor = '#ffc107'; // yellow accent for stars and submit
const cardShadow = '0 4px 24px rgba(0,0,0,0.08)';
const borderRadius = '18px';

const WriteReview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const searchParams = new URLSearchParams(location.search);
    const bookingId = searchParams.get('bookingId');
    const { item } = location.state || {};

    const [booking, setBooking] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        rating: 0,
        comment: ''
    });
    const [hoveredRating, setHoveredRating] = useState(0);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectableItems, setSelectableItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) {
                setError('No booking ID provided');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`/bookings/${bookingId}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setBooking(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching booking:', err);
                setError(err.response?.data?.message || 'Failed to load booking details');
                setLoading(false);
            }
        };
        if (bookingId) {
            fetchBooking();
        } else {
            setLoading(false);
        }
    }, [bookingId, user]);

    useEffect(() => {
        if (booking) {
            const items = [];
            // Tour Package
            if (booking.tour_package) {
                items.push({
                    type: 'TourPackage',
                    id: booking.tour_package._id,
                    name: booking.tour_package.package_title || booking.tour_package.name || 'Tour Package'
                });
            }
            // Flights
            if (booking.flights && booking.flights.length > 0) {
                booking.flights.forEach(f => {
                    items.push({
                        type: 'Flight',
                        id: f._id,
                        name: (f.airline_name ? f.airline_name : 'Flight') +
                              (f.from && f.to ? ` (${f.from} → ${f.to})` : '')
                    });
                });
            }
            // Hotels
            if (booking.hotels && booking.hotels.length > 0) {
                booking.hotels.forEach(h => {
                    items.push({
                        type: 'Hotel',
                        id: h._id,
                        name: (h.hotel_name ? h.hotel_name : 'Hotel') + (h.location ? ` in ${h.location}` : '')
                    });
                });
            }
            // Custom Package
            if (booking.custom_package) {
                if (booking.custom_package.flights) {
                    booking.custom_package.flights.forEach(f => {
                        items.push({
                            type: 'Flight',
                            id: f._id,
                            name: (f.airline_name ? f.airline_name : 'Flight') +
                                  (f.from && f.to ? ` (${f.from} → ${f.to})` : '')
                        });
                    });
                }
                if (booking.custom_package.hotels) {
                    booking.custom_package.hotels.forEach(h => {
                        items.push({
                            type: 'Hotel',
                            id: h._id,
                            name: (h.hotel_name ? h.hotel_name : 'Hotel') + (h.location ? ` in ${h.location}` : '')
                        });
                    });
                }
            }
            if (items.length === 0) {
                console.warn('No items found in booking for review:', booking);
            }
            setSelectableItems(items);
            setSelectedItem(items[0] || null);
        }
    }, [booking]);

    if (loading) {
        return (
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading booking details...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
                <div className="text-center">
                    <Alert variant="danger" className="shadow" style={{ fontSize: 18, borderRadius }}>
                        {error}
                    </Alert>
                    <Button variant="dark" onClick={() => navigate('/confirmedBookings')} className="mt-3">
                        Go Back to Bookings
                    </Button>
                </div>
            </Container>
        );
    }

    if (!booking) {
        return (
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
                <div className="text-center">
                    <Alert variant="warning" className="shadow" style={{ fontSize: 18, borderRadius }}>
                        No booking found. Please go back to your confirmed bookings page.
                    </Alert>
                    <Button variant="dark" onClick={() => navigate('/confirmedBookings')} className="mt-3">
                        Go Back to Bookings
                    </Button>
                </div>
            </Container>
        );
    }

    if (!selectableItems.length) {
        return (
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
                <div className="text-center">
                    <Alert variant="warning" className="shadow" style={{ fontSize: 18, borderRadius }}>
                        No items found in this booking to review.
                    </Alert>
                    <Button variant="dark" onClick={() => navigate('/confirmedBookings')} className="mt-3">
                        Go Back to Bookings
                    </Button>
                </div>
            </Container>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        
        // Validation
        if (!formData.rating) {
            alert('Please select a rating.');
            setSubmitting(false);
            return;
        }
        if (formData.title.length < 5 || formData.title.length > 100) {
            alert('Review title must be between 5 and 100 characters.');
            setSubmitting(false);
            return;
        }
        if (formData.comment.length < 10 || formData.comment.length > 500) {
            alert('Review must be between 10 and 500 characters.');
            setSubmitting(false);
            return;
        }
        
        try {
            const reviewData = {
                booking_id: bookingId || item.booking,
                item_id: selectedItem.id,
                item_type: selectedItem.type,
                itemName: selectedItem.name,
                ...formData
            };
            
            const response = await axios.post('/reviews/submit', reviewData);
            setSuccess('Thank you for your review!');
            setTimeout(() => navigate('/my-history'), 1500);
        } catch (err) {
            window.alert('Review not allowed: ' + (err.response?.data?.message || err.message));
            // Do not setError or redirect
        } finally {
            setSubmitting(false);
        }
    };

    const handleRatingChange = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    return (
        <Container fluid style={{ minHeight: '100vh', background: '#f7f7f9', paddingTop: 40 }}>
            <Row className="justify-content-center">
                <Col xs={12} md={8} lg={6} xl={5} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Card style={{ borderRadius, boxShadow: cardShadow, width: '100%', maxWidth: 520, margin: '48px 0', padding: 0 }}>
                        <Card.Body style={{ padding: '3.2rem 2.5rem 2.5rem 2.5rem' }}>
                            <h2 style={{ fontWeight: 700, textAlign: 'center', marginBottom: 36, letterSpacing: 0.5 }}>Write a Review</h2>
                            {selectableItems.length > 1 && (
                                <Form.Group className="mb-5">
                                    <Form.Label style={{ fontWeight: 500, marginBottom: 10 }}>Select Item to Review</Form.Label>
                                    <Form.Select
                                        value={selectedItem?.id + '-' + selectedItem?.type}
                                        onChange={e => {
                                            const [id, type] = e.target.value.split('-');
                                            setSelectedItem(selectableItems.find(i => i.id === id && i.type === type));
                                        }}
                                        style={{ borderRadius: 12, fontSize: 16, padding: '12px', marginBottom: 0 }}
                                    >
                                        {selectableItems.map(i => (
                                            <option key={i.id + '-' + i.type} value={i.id + '-' + i.type}>
                                                {i.type}: {i.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            )}
                            {selectedItem && (
                                <div style={{ marginBottom: 36, textAlign: 'center' }}>
                                    <span style={{ color: '#888', fontSize: 16 }}>Reviewing:</span>
                                    <div style={{ fontWeight: 600, fontSize: 18, marginTop: 4 }}>{selectedItem.type}: {selectedItem.name}</div>
                                </div>
                            )}
                            {error && (
                                <Alert variant="danger" className="mb-4" style={{ borderRadius: 10, fontSize: 15 }}>
                                    {error}
                                </Alert>
                            )}
                            {success && (
                                <Alert variant="success" className="mb-4" style={{ borderRadius: 10, fontSize: 15 }}>
                                    {success}
                                </Alert>
                            )}
                            <Form onSubmit={handleSubmit} autoComplete="off">
                                <Form.Group className="mb-5">
                                    <Form.Label style={{ fontWeight: 500, marginBottom: 10 }}>Rating</Form.Label>
                                    <div className="d-flex align-items-center justify-content-center" style={{ gap: 14, padding: '8px 0 0 0' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className="me-1"
                                                style={{
                                                    cursor: 'pointer',
                                                    fontSize: '2.2rem',
                                                    color: star <= (hoveredRating || formData.rating) ? accentColor : '#e4e5e9',
                                                    transition: 'color 0.2s'
                                                }}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                onClick={() => handleRatingChange(star)}
                                            />
                                        ))}
                                        <span style={{ marginLeft: 16, fontSize: 16, color: '#555' }}>
                                            {formData.rating ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'Select rating'}
                                        </span>
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-5">
                                    <Form.Label style={{ fontWeight: 500, marginBottom: 10 }}>Review Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Give your review a title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                        minLength={5}
                                        maxLength={100}
                                        style={{ borderRadius: 12, fontSize: 16, padding: '16px', marginBottom: 0, border: '1.5px solid #e4e5e9' }}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-5" style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Form.Label style={{ fontWeight: 500, minWidth: 120, marginBottom: 0, textAlign: 'right', paddingTop: 8 }}>Your Review</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        placeholder="Share your experience..."
                                        value={formData.comment}
                                        onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                                        required
                                        minLength={10}
                                        maxLength={500}
                                        style={{ borderRadius: 12, fontSize: 16, padding: '16px', marginLeft: 24, flex: 1, border: '1.5px solid #e4e5e9' }}
                                    />
                                </Form.Group>
                                <div className="d-flex gap-4 justify-content-center mt-5 mb-2">
                                    <Button
                                        variant="outline-dark"
                                        onClick={() => navigate('/confirmedBookings')}
                                        disabled={submitting}
                                        style={{ minWidth: 170, minHeight: 54, fontWeight: 700, borderRadius: 12, fontSize: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        style={{ background: accentColor, color: '#222', border: 'none', minWidth: 200, minHeight: 54, fontWeight: 800, borderRadius: 12, fontSize: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
                                        disabled={submitting || !formData.rating || !selectedItem}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Review'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default WriteReview; 