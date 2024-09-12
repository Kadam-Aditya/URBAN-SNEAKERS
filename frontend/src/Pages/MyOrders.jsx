import React, { useEffect, useState } from 'react';
import './CSS/MyOrders.css';
import PackIcon from '../Components/Assets/PackIcon.avif';
import Heart from '../Components/Assets/heh.avif';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiFadeOut, setConfettiFadeOut] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('auth-token'); // Assuming you're storing the auth token in localStorage
                const response = await fetch('https://urban-sneakers-backend.onrender.com/userorders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': token,
                    },
                });

                const data = await response.json();
                if (data.success) {
                    setOrders(data.orders);

                    // Check if the popup should be shown
                    const showPopupFlag = localStorage.getItem('showPopup') === 'true';
                    if (showPopupFlag) {
                        setShowPopup(true);
                        setShowConfetti(true);
                        setTimeout(() => setShowPopup(false), 6000);
                        setTimeout(() => setConfettiFadeOut(true), 6000);
                        setTimeout(() => setShowConfetti(false), 7000);

                        // Clear the flag after showing the popup
                        localStorage.removeItem('showPopup');
                    }
                } else {
                    console.log(data.message || 'Failed to fetch orders');
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <div className="loading-orders">Loading orders...</div>;
    }

    return (
        <div className="my-orders">
            {showConfetti && (
                <div className={`confetti-fade ${confettiFadeOut ? 'confetti-fade-out' : ''}`}>
                    <Confetti width={width} height={height} />
                </div>
            )}
            {showPopup && (
                <>
                    {/* Render the overlay */}
                    <div className="popup-overlay"></div>
                    <div className="popup popup-appear">
                        <p>I Love You Harshu</p>
                        <p>Get well soon</p>
                        <img src={Heart} alt="" className="popup-image" />
                    </div>
                </>
            )}
            <div className="mo">
                <h1>My Orders</h1>
            </div>
            {orders.length === 0 ? (
                <p className="GP">You have no orders yet.</p>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order._id} className="order-item">
                            <img src={PackIcon} alt="" />
                            <h3>Order ID: {order._id}</h3>
                            <p>Status: {order.status}</p>
                            <p>Amount: ₹{order.amount.toLocaleString('en-IN')}</p>
                            <p>Items:</p>
                            <ul>
                                {order.items.map((item, index) => (
                                    <li key={index}>
                                        ID: {item.id} - {item.title} ({item.description}) - Quantity: {item.quantity}
                                    </li>
                                ))}
                            </ul>
                            <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
