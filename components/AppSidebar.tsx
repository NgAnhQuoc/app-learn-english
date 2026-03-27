"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu, Typography, Button } from "antd";
import { MessageOutlined, BookOutlined, EditOutlined, LogoutOutlined } from "@ant-design/icons";
import { logout } from "../app/login/actions";

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
}

const menuItems = [
  { key: "/co-minh-english", icon: <MessageOutlined />, label: "Cô Minh English" },
  { key: "/co-lanh-vocabulary", icon: <BookOutlined />, label: "Từ điển Cô Lành" },
  // { key: "/writing", icon: <EditOutlined />, label: "Bài tập Viết (Sắp ra mắt)", disabled: true },
];

export default function AppSidebar({ collapsed, onCollapse }: AppSidebarProps): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const selectedKey = menuItems.find((item) => pathname.endsWith(item.key))?.key ?? "/co-minh-english";

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    window.location.href = "/login";
  };

  return (
    <Layout.Sider
      width={280}
      theme="light"
      className="app-sidebar"
      breakpoint="md"
      collapsedWidth={0}
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography.Title level={4} style={{ margin: 0, color: "var(--accent)" }}>
          📚 English App
        </Typography.Title>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{ borderRight: 0, padding: "8px 0" }}
          items={menuItems}
        />
        
        <div style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
          <Button 
            type="text" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            loading={loggingOut}
            style={{ width: "100%", textAlign: "left", justifyContent: "flex-start" }}
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </Layout.Sider>
  );
}
