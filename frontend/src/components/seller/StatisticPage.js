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
import { Container, Row, Col, Card as RBCard, Spinner, ListGroup, Form } from "react-bootstrap";

const user = JSON.parse(localStorage.getItem("user"));
let userId = "0";
try {
    userId = user._id;
    console.log("userid", userId);
} catch (error) {
    console.error(error);
}

function StatisticPage({ shopId }) {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/seller/statistic?userId=${userId}&year=${year}`);
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching statistics:", err);
            } finally {
                setLoading(false);
            }
        }

        if (shopId && userId) fetchStats();
    }, [shopId, year]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueData = stats?.monthlyRevenue.map((rev, index) => ({
        name: months[index],
        Revenue: rev,
    })) || [];

    if (loading || !stats) {
        return (
            <div className="p-4">
                <Spinner animation="border" /> Loading statistics...
            </div>
        );
    }

    return (
        <Container className="my-4">
            <h1 className="text-2xl fw-bold mb-4">Shop Statistics</h1>

            {/* Dropdown chọn năm */}
            <Row className="mb-3">
                <Col md={3}>
                    <Form.Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                        {[...Array(5)].map((_, i) => {
                            const y = currentYear - i;
                            return (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            );
                        })}
                    </Form.Select>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={3}><StatCard title="Total Orders" value={stats.totalOrders} variant="primary" /></Col>
                <Col md={3}><StatCard title="Total Revenue" value={ " $" +stats.totalRevenue.toLocaleString() } variant="success" /></Col>
                <Col md={3}><StatCard title="Delivered" value={stats.statusCount.Delivered} variant="info" /></Col>
                <Col md={3}><StatCard title="Cancelled Orders" value={stats.statusCount.Cancelled} variant="danger" /></Col>
            </Row>

            <RBCard className="mb-4">
                <RBCard.Body>
                    <RBCard.Title>Monthly Revenue ({year})</RBCard.Title>
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
                    <RBCard.Title>Top 5 Best-selling Products</RBCard.Title>
                    <ListGroup variant="flush">
                        {stats.topProducts.map((p, i) => (
                            //   <ListGroup.Item key={i}>
                            //     {p.name} - <strong>{p.quantity} sold</strong>
                            //   </ListGroup.Item>
                            <ListGroup.Item key={i} className="d-flex align-items-center">
                                <img
                                    src={p.image}
                                    alt={p.name}
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        marginRight: "12px",
                                    }}
                                />
                                <div>
                                    <div>{p.name}</div>
                                    <strong>{p.quantity} sold</strong>
                                </div>
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
