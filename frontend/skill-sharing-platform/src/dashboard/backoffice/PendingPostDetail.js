import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import DOMPurify from 'dompurify';
import { Card, Button, Alert, Typography } from 'antd';
import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { LogoutOutlined, DashboardOutlined, UserOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const PendingPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/post');
  };

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Unauthorized access. Please log in.');
          navigate('/');
          return;
        }

        const decodedToken = jwtDecode(token);
        if (!decodedToken.role || decodedToken.role !== 'admin') {
          alert('You are not authorized.');
          navigate('/');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/request/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post details:', error.message);
        alert('Failed to load post details.');
      }
    };

    fetchPostDetails();
  }, [id, navigate]);

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/backoffice/posts/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Post approved successfully!');
      navigate('/request');
    } catch (error) {
      console.error('Error approving post:', error.message);
      alert(error.response?.data?.message || 'Failed to approve post');
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/backoffice/posts/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Post rejected successfully!');
      navigate('/request');
    } catch (error) {
      console.error('Error rejecting post:', error.message);
      alert(error.response?.data?.message || 'Failed to reject post');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Post deleted successfully!');
      navigate('/request');
    } catch (error) {
      console.error('Error deleting post:', error.message);
      alert('Failed to delete post.');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!post) {
    return <Alert message="Loading..." type="info" showIcon style={{ textAlign: 'center', marginTop: 20 }} />;
  }

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
        <Button type="primary" onClick={handleBack} style={{ marginBottom: 16 }}>
          Back
        </Button>
        <Card
          hoverable
          cover={post.image && <img alt={post.title} src={post.image} style={{ height: 300, objectFit: 'cover' }} />}
        >
        <Card.Meta
          title={post.title}
          description={
            <div>
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.description) }} />
              <Typography.Text type="secondary">
                Created by: {post.createdBy?.username || 'Unknown'}
              </Typography.Text>
            </div>
          }
        />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            {post.status === 'pending' && (
              <>
                <Button type="primary" onClick={handleApprove}>Approve</Button>
                <Button type="danger" onClick={handleReject}>Reject</Button>
              </>
            )}
            {post.status === 'rejected' && (
              <Button type="danger" onClick={handleDelete}>Delete</Button>
            )}
          </div>
        </Card>
      </PageContainer>
    </ProLayout>
  );
};

export default PendingPostDetail;