import { useNavigate, useLocation } from 'react-router-dom';
import ProLayout from '@ant-design/pro-layout';
import { LogoutOutlined, DashboardOutlined, UserOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/post');
  };

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> },
    { path: '/user', name: 'User', icon: <UserOutlined /> },
    { path: '/request', name: 'Post Requests', icon: <FileTextOutlined /> },
    { path: '/reports', name: 'Post Reports', icon: <ExclamationCircleOutlined /> },
    { path: '/logout', name: 'Sign out', icon: <LogoutOutlined />, action: handleSignOut },
  ];

  return (
    <ProLayout
      logo="https://fibo.edu.mn/assets/images/fibo-edu-logo.png"
      title="Admin Panel"
      route={{
        routes: menuItems.map(item => ({
          path: item.path,
          name: item.name,
          icon: item.icon,
        })),
      }}
      location={{ pathname: location.pathname }}
      menuItemRender={(item, dom) => (
        <a onClick={item.path === '/logout' ? handleSignOut : () => navigate(item.path)}>
          {dom}
        </a>
      )}
    />
  );
};

export default Sidebar;