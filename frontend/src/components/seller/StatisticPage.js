import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { Container, Row, Col, Card as RBCard, Spinner, ListGroup } from 'react-bootstrap';

function StatisticPage({ shopId }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await axios.get(`http://localhost:5000/seller/statistic?shopId=${shopId}`);
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching statistics:", err);
            }
        }

        if (shopId) fetchStats();
    }, [shopId]);

    if (!stats) return <div className="p-4"><Spinner animation="border" /> Loading statistics...</div>;

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const revenueData = stats.monthlyRevenue.map((rev, index) => ({
        name: months[index],
        Revenue: rev,
    }));

    return (
        <Container className="my-4">
            <h1 className="text-2xl fw-bold mb-4"> Shop Statistics</h1>
            <Row className="mb-4">
                <Col md={3}><StatCard title="Total Orders" value={stats.totalOrders} variant="primary" /></Col>
                <Col md={3}><StatCard title="Total Revenue" value={stats.totalRevenue.toLocaleString() + " đ"} variant="success" /></Col>
                <Col md={3}><StatCard title="Delivered" value={stats.statusCount.Delivered} variant="info" /></Col>
                <Col md={3}><StatCard title="Cancelled Orders" value={stats.statusCount.Cancelled} variant="danger" /></Col>
            </Row>

            <RBCard className="mb-4">
                <RBCard.Body>
                    <RBCard.Title> Monthly Revenue</RBCard.Title>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="Revenue" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </RBCard.Body>
            </RBCard>

            <RBCard>
                <RBCard.Body>
                    <RBCard.Title> Top 5 Best-selling Products</RBCard.Title>
                    <ListGroup variant="flush">
                        {stats.topProducts.map((p, i) => (
                            <ListGroup.Item key={i}>
                                {p.name} - <strong>{p.quantity} sold</strong>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </RBCard.Body>
            </RBCard>
        </Container>
    );
}

function StatCard({ title, value, variant }) {
    return (
        <RBCard bg={variant} text="white" className="text-center">
            <RBCard.Body>
                <RBCard.Subtitle className="mb-2">{title}</RBCard.Subtitle>
                <RBCard.Title>{value}</RBCard.Title>
            </RBCard.Body>
        </RBCard>
    );
}

export default StatisticPage;