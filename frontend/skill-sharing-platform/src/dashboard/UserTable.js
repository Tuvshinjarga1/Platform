import React, { useEffect, useState } from 'react';
import { Table, Input, Pagination, Typography } from 'antd';
import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { LogoutOutlined, DashboardOutlined, UserOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Search } = Input;

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/post');
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          alert('Unauthorized access. Please log in.');
          navigate('/');
          return;
        }

        const decodedToken = jwtDecode(token);

        if (decodedToken.role !== 'admin') {
          alert('You are not authorized to access this page.');
          navigate('/');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/backoffice/authors', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const adminUsers = response.data.filter(user => user.role === 'user');
        setUsers(adminUsers);

      } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
        alert('Failed to fetch users. Please try again later.');
      }
    };
    fetchUsers();
  }, [navigate]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Reputation',
      dataIndex: 'reputation',
      key: 'reputation',
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (text) => `${text}₮`,
    },
  ];

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
        <Typography.Title level={4}>Хэрэглэгчид</Typography.Title>
        <Search
          placeholder="Search user by username or email..."
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Table
          columns={columns}
          dataSource={currentUsers}
          pagination={false}
          rowKey="_id"
        />
        <Pagination
          current={currentPage}
          pageSize={itemsPerPage}
          total={filteredUsers.length}
          onChange={handlePageChange}
          style={{ marginTop: 16, textAlign: 'center' }}
        />
      </PageContainer>
    </ProLayout>
  );
};

export default UserTable;