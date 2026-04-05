"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { App, Layout, Menu, Typography, Button } from "antd";
import { MessageOutlined, BookOutlined, LogoutOutlined, CarOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { logout } from "../app/login/actions";

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
}

const menuItems = [
  { key: "/co-minh-english", icon: <MessageOutlined />, label: "Chat with AI" },
  { key: "/co-lanh-vocabulary", icon: <BookOutlined />, label: "Vocabulary" },
  { key: "/timeline-youtube", icon: <PlayCircleOutlined />, label: "Real Vocab TV" },
  { key: "/kieu-gia-xang", icon: <CarOutlined />, label: "Price Checker Oil" },
];

export default function AppSidebar({ collapsed, onCollapse }: AppSidebarProps): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const { modal } = App.useApp();

  const selectedKey = menuItems.find((item) => pathname.includes(item.key))?.key ?? "/co-minh-english";

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  const handleLogout = () => {
    modal.confirm({
      title: "Đăng xuất",
      content: "Bạn có chắc muốn đăng xuất không?",
      okText: "Đăng xuất",
      cancelText: "Huỷ",
      okButtonProps: { danger: true },
      onOk: async () => {
        setLoggingOut(true);
        await logout();
        window.location.href = "/login";
      },
    });
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
      <div className="flex items-center justify-between px-4 py-5"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <Typography.Title level={4} style={{ margin: 0, color: "var(--accent)" }}>
          📚 English App
        </Typography.Title>
      </div>

      <div className="flex flex-col flex-1 justify-between">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{ borderRight: 0, padding: "8px 0" }}
          items={menuItems}
        />
        
        <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
          <Button 
            type="text" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            loading={loggingOut}
            className="!w-full !text-left !justify-start"
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </Layout.Sider>
  );
}
