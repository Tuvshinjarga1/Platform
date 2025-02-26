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
        justifyContent: 'space-between',
        padding: '0 20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ flex: 1 }}>
        <Button type="text" icon={<SearchOutlined />} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button type="text" icon={<BellOutlined />} />
        <Button type="text" icon={<UserOutlined />} />
      </div>
    </Header>
  );
};

export default TopBar;
