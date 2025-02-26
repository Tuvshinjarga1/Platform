import React from 'react';
import { Layout, Badge, Button, Grid } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { useBreakpoint } = Grid;

const TopBar = () => {
  const screens = useBreakpoint();

  return (
    <Header
      style={{
        height: '60px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: screens.xs ? '0 10px' : '0 20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ flex: 1, display: screens.xs ? 'none' : 'block' }}>
        <Button type="text" icon={<SearchOutlined />} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: screens.xs ? '5px' : '10px' }}>
        <Badge count={5}>
          <Button type="text" icon={<BellOutlined />} />
        </Badge>
        <Button type="text" icon={<UserOutlined />} />
      </div>
    </Header>
  );
};

export default TopBar;
