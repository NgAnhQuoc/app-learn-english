"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu, Typography } from "antd";
import { MessageOutlined, BookOutlined, EditOutlined } from "@ant-design/icons";

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
}

const menuItems = [
  { key: "/co-minh-english", icon: <MessageOutlined />, label: "Cô Minh English" },
  { key: "/co-lanh-vocabulary", icon: <BookOutlined />, label: "Từ điển Cô Lành" },
  { key: "/writing", icon: <EditOutlined />, label: "Bài tập Viết (Sắp ra mắt)", disabled: true },
];

export default function AppSidebar({ collapsed, onCollapse }: AppSidebarProps): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();

  const selectedKey = menuItems.find((item) => pathname.endsWith(item.key))?.key ?? "/co-minh-english";

  const handleMenuClick = ({ key }: { key: string }) => {
    if (!menuItems.find((i) => i.key === key)?.disabled) {
      router.push(key);
    }
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
    >
      <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)" }}>
        <Typography.Title level={4} style={{ margin: 0, color: "var(--accent)" }}>
          📚 English App
        </Typography.Title>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
        style={{ height: "auto", borderRight: 0, padding: "8px 0" }}
        items={menuItems}
      />
    </Layout.Sider>
  );
}
