import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, Grid } from 'antd';
import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { LogoutOutlined, DashboardOutlined, UserOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const { useBreakpoint } = Grid;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  
  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/post');
  };

  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    pieChartData: [],
    barChartData: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Unauthorized access. Please log in.');
          navigate('/');
          return;
        }
        
        const decodedToken = jwtDecode(token);
        if (!decodedToken.role || decodedToken.role !== 'admin') {
          alert('You are not authorized to access this page.');
          navigate('/');
          return;
        }

        const usersResponse = await axios.get('https://platform-backend-zxgy.onrender.com/api/backoffice/authors', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const postsResponse = await axios.get('https://platform-backend-zxgy.onrender.com/api/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const totalUsers = usersResponse.data.length;
        const totalPosts = postsResponse.data.length;
        const totalLikes = postsResponse.data.reduce((acc, post) => acc + post.likes.length, 0);
        const totalComments = postsResponse.data.reduce((acc, post) => acc + post.comments.length, 0);

        const categoryCount = postsResponse.data.reduce((acc, post) => {
          acc[post.category] = (acc[post.category] || 0) + 1;
          return acc;
        }, {});

        const pieChartData = Object.keys(categoryCount).map((category) => ({
          name: category,
          value: categoryCount[category],
        }));

        const barChartData = Array(12).fill(0).map((_, i) => ({
          name: new Date(0, i).toLocaleString('default', { month: 'short' }),
          Posts: postsResponse.data.filter(post => new Date(post.createdAt).getMonth() === i).length,
        }));

        setDashboardData({
          totalUsers,
          totalPosts,
          totalLikes,
          totalComments,
          pieChartData,
          barChartData,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        alert('Failed to fetch dashboard data. Please try again later.');
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <ProLayout
      title="Skill Sharing Platform"
      logo="https://fibo.edu.mn/assets/images/fibo-edu-logo.png"
      menuItemRender={(item, dom) => (
        <a onClick={item.action ? item.action : () => navigate(item.path)}>{dom}</a>
      )}
      menuDataRender={() => [
        { path: '/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> },
        { path: '/user', name: 'User', icon: <UserOutlined /> },
        { path: '/request', name: 'Post Requests', icon: <FileTextOutlined /> },
        { path: '/reports', name: 'Post Reports', icon: <ExclamationCircleOutlined /> },
        { path: '/logout', name: 'Sign out', icon: <LogoutOutlined />, action: handleSignOut },
      ]}
      location={{ pathname: window.location.pathname }}
    >
      <PageContainer>
        <Typography.Title level={4}>Тавтай морил {localStorage.getItem('username')} 👋</Typography.Title>
        <Row gutter={[16, 16]}>
          {[['Нийт хэрэглэгч', dashboardData.totalUsers], ['Нийт пост', dashboardData.totalPosts],
            ['Нийт like', dashboardData.totalLikes], ['Нийт Comments', dashboardData.totalComments]].map(([title, value], index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card><Statistic title={title} value={value} /></Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <Card title="ПОСТ АНГИЛАЛУУД">
              <ResponsiveContainer width="100%" height={screens.xs ? 250 : 300}>
                <PieChart>
                  <Pie data={dashboardData.pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {dashboardData.pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Постуудын статус">
              <ResponsiveContainer width="100%" height={screens.xs ? 250 : 300}>
                <BarChart data={dashboardData.barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Posts" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </ProLayout>
  );
};

export default Dashboard;
