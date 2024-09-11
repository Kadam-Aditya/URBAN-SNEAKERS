import React, { useEffect, useState } from 'react';
import './CSS/MyOrders.css';
import PackIcon from '../Components/Assets/PackIcon.avif';
import Heart from '../Components/Assets/hh.jpg';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user orders when the component mounts
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
            <div className="love-message">
                <h2>I Love You Harshu</h2>
                <img src={Heart} alt="Heart icon" />
            </div>
            {orders.length === 0 ? (
                <p class= "GP">You have no orders yet.</p>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order._id} className="order-item">
                            <img src = {PackIcon} alt = ""/>
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
