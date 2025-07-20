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

  if (!stats) return <div className="p-4"><Spinner animation="border" /> Đang tải thống kê...</div>;

  const months = [
    "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
    "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"
  ];

  const revenueData = stats.monthlyRevenue.map((rev, index) => ({
    name: months[index],
    DoanhThu: rev,
  }));

  return (
    <Container className="my-4">
      <h1 className="text-2xl fw-bold mb-4"> Thống kê cửa hàng</h1>
      <Row className="mb-4">
        <Col md={3}><StatCard title="Tổng đơn" value={stats.totalOrders} variant="primary" /></Col>
        <Col md={3}><StatCard title="Doanh thu" value={stats.totalRevenue.toLocaleString() + " đ"} variant="success" /></Col>
        <Col md={3}><StatCard title="Hoàn thành" value={stats.statusCount.Delivered} variant="info" /></Col>
        <Col md={3}><StatCard title="Đơn huỷ" value={stats.statusCount.Cancelled} variant="danger" /></Col>
      </Row>

      <RBCard className="mb-4">
        <RBCard.Body>
          <RBCard.Title> Doanh thu theo tháng</RBCard.Title>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="DoanhThu" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </RBCard.Body>
      </RBCard>

      <RBCard>
        <RBCard.Body>
          <RBCard.Title> Top 5 sản phẩm bán chạy</RBCard.Title>
          <ListGroup variant="flush">
            {stats.topProducts.map((p, i) => (
              <ListGroup.Item key={i}>
                {p.name} - <strong>{p.quantity} lượt mua</strong>
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