import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Card, Col, Row, Button, Alert, Typography, Tag } from 'antd';
import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { LogoutOutlined, DashboardOutlined, UserOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const PostReports = () => {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/post');
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Unauthorized access. Please log in.');
          navigate('/');
          return;
        }

        const decodedToken = jwtDecode(token);
        if (!decodedToken.role || decodedToken.role !== 'admin') {
          alert('Unauthorized access.');
          navigate('/');
          return;
        }

        const response = await axios.get('https://platform-backend-zxgy.onrender.com/api/backoffice/reports', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error.message);
        alert('Failed to fetch reports.');
      }
    };

    fetchReports();
  }, [navigate]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://platform-backend-zxgy.onrender.com/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Post deleted successfully!');
      setReports((prevReports) => prevReports.filter((report) => report.post._id !== id));
    } catch (error) {
      console.error('Error deleting post:', error.message);
      alert('Failed to delete post.');
    }
  };

  return (
    <ProLayout
      title="Skill Sharing Platform"
      logo="https://fibo.edu.mn/assets/images/fibo-edu-logo.png"
      menuItemRender={(item, dom) => (
        <a onClick={item.action ? item.action : () => navigate(item.path)}>
          {dom}
        </a>
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
        <Typography.Title level={4} className="text-center mb-6 text-blue-500 font-bold">
          Reported Posts
        </Typography.Title>

        {reports.length === 0 ? (
          <Alert message="No reported posts to display." type="info" showIcon className="text-center text-lg font-bold" />
        ) : (
          <Row gutter={[16, 16]}>
            {reports.map((report) => (
              <Col xs={24} sm={12} md={8} lg={6} key={report.post._id}>
                <Card
                  hoverable
                  cover={report.post.image && <img alt={report.post.title} src={report.post.image} className="h-48 object-cover" />}
                >
                  <Card.Meta
                    title={report.post.title}
                    description={
                      <div>
                        <div dangerouslySetInnerHTML={{ __html: report.post.description ? report.post.description : '' }} className="h-16 overflow-hidden text-ellipsis" />
                        <Typography.Text type="secondary">Created by: {report.post.createdBy?.username || 'Unknown'}</Typography.Text><br></br>
                        <Typography.Text type="secondary">Reported by: {report.user} - {report.reason}</Typography.Text>
                      </div>
                    }
                  />
                  <Tag color="red" className="mt-4">Reported</Tag>
                  <div className="flex justify-center mt-4">
                    <Button type="danger" onClick={() => handleDelete(report.post._id)} className="bg-red-500 text-white">Delete</Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </PageContainer>
    </ProLayout>
  );
};

export default PostReports;
