import React from 'react';
import { Layout, Badge, Button } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

const { Header } = Layout;

const TopBar = () => {
  return (
    <Header
      style={{
        height: '60px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Button type="text" icon={<SearchOutlined />} />

      <Button type="text" icon={<BellOutlined />} />

      <Button type="text" icon={<UserOutlined />} />
    </Header>
  );
};

export default TopBar;