import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Card, Col, Row, Button, Alert, Typography, Tabs, Tag } from 'antd';
import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { LogoutOutlined, DashboardOutlined, UserOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const BackofficePosts = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('pending');
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/post');
  };

  useEffect(() => {
    const fetchPosts = async () => {
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

        const response = await axios.get('https://platform-backend-zxgy.onrender.com/api/backoffice/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error.message);
        alert('Failed to fetch posts.');
      }
    };

    fetchPosts();
  }, [navigate]);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://platform-backend-zxgy.onrender.com/api/backoffice/posts/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Post approved successfully!');
      setPosts((prevPosts) => prevPosts.map((post) => post._id === id ? { ...post, status: 'approved' } : post));
    } catch (error) {
      console.error('Error approving post:', error.message);
      alert('Failed to approve post.');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://platform-backend-zxgy.onrender.com/api/backoffice/posts/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Post rejected successfully!');
      setPosts((prevPosts) => prevPosts.map((post) => post._id === id ? { ...post, status: 'rejected' } : post));
    } catch (error) {
      console.error('Error rejecting post:', error.message);
      alert('Failed to reject post.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://platform-backend-zxgy.onrender.com/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Post deleted successfully!');
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
    } catch (error) {
      console.error('Error deleting post:', error.message);
      alert('Failed to delete post.');
    }
  };

  const filteredPosts = posts.filter(post => post.status === filter);

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
          Posts
        </Typography.Title>

        <Tabs activeKey={filter} onChange={setFilter} centered>
          <TabPane tab="Pending" key="pending" />
          <TabPane tab="Rejected" key="rejected" />
        </Tabs>

        {filteredPosts.length === 0 ? (
          <Alert message={`No ${filter} posts to display.`} type="info" showIcon className="text-center text-lg font-bold" />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredPosts.map((post) => (
              <Col xs={24} sm={12} md={8} lg={6} key={post._id}>
                <Card
                  hoverable
                  cover={post.image && <img alt={post.title} src={post.image} className="h-48 object-cover" />}
                  onClick={() => navigate(`/request/${post._id}`)}
                >
                  <Card.Meta
                    title={post.title}
                    description={
                      <div>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.description) }} className="h-16 overflow-hidden text-ellipsis" />
                        <Typography.Text type="secondary">Created by: {post.createdBy?.username || 'Unknown'}</Typography.Text>
                      </div>
                    }
                  />
                  <Tag color={post.status === 'pending' ? 'orange' : 'red'} className="mt-4">
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </Tag>
                  {filter === 'pending' && (
                    <div className="flex justify-between mt-4">
                      <Button type="primary" onClick={(e) => { e.stopPropagation(); handleApprove(post._id); }}>Approve</Button>
                      <Button type="primary" onClick={(e) => { e.stopPropagation(); handleReject(post._id); }} className="bg-red-500 text-white">Reject</Button>
                    </div>
                  )}
                  {filter === 'rejected' && (
                    <div className="flex justify-center mt-4">
                      <Button type="primary" onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }} className="bg-red-500 text-white">Delete</Button>
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </PageContainer>
    </ProLayout>
  );
};

export default BackofficePosts;
