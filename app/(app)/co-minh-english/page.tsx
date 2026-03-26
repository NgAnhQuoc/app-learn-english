"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, Typography, Select, Input, Space } from "antd";
import { MessageOutlined, ReadOutlined, EditOutlined, TrophyOutlined, WarningOutlined } from "@ant-design/icons";
import ChatWindow from "../../../components/ChatWindow";

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [level, setLevel] = useState("A2 (Pre-Intermediate)");
  const [weakness, setWeakness] = useState("");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const savedLevel = localStorage.getItem("co_minh_level");
    const savedWeakness = localStorage.getItem("co_minh_weakness");
    setTimeout(() => {
      if (savedLevel) setLevel(savedLevel);
      if (savedWeakness) setWeakness(savedWeakness);
    }, 0);
  }, []);

  const handleLevelChange = (val: string) => {
    setLevel(val);
    localStorage.setItem("co_minh_level", val);
  };

  const handleWeaknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWeakness(val);
    localStorage.setItem("co_minh_weakness", val);
  };

  return (
    <Layout className="app-layout">
      {isMobile && !collapsed && (
        <div
          className="sidebar-backdrop"
          onClick={() => setCollapsed(true)}
        />
      )}

      <Layout.Sider
        width={280}
        theme="light"
        className="app-sidebar"
        breakpoint="md"
        collapsedWidth={0}
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)" }}>
          <Typography.Title level={4} style={{ margin: 0, color: "var(--accent)" }}>
            📚 English App
          </Typography.Title>
        </div>
         <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          style={{ height: "auto", borderRight: 0, padding: "8px 0" }}
          items={[
            {
              key: "1",
              icon: <MessageOutlined />,
              label: "Co Minh English",
            },
            {
              key: "2",
              icon: <ReadOutlined />,
              label: "Bai tap Doc (Sap ra mat)",
              disabled: true,
            },
            {
              key: "3",
              icon: <EditOutlined />,
              label: "Bai tap Viet (Sap ra mat)",
              disabled: true,
            },
          ]}
        />
        
        <div style={{ padding: "16px" }}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <Typography.Text type="secondary" style={{ marginBottom: 8, display: "block" }}>
                <TrophyOutlined style={{ marginRight: 4 }} /> Trình độ hiện tại
              </Typography.Text>
              <Select
                value={level}
                onChange={handleLevelChange}
                style={{ width: "100%" }}
                options={[
                  { value: "A1 (Beginner)", label: "A1 (Beginner)" },
                  { value: "A2 (Pre-Intermediate)", label: "A2 (Pre-Intermediate)" },
                  { value: "B1 (Intermediate)", label: "B1 (Intermediate)" },
                  { value: "B2 (Upper-Intermediate)", label: "B2 (Upper-Intermediate)" },
                  { value: "C1 (Advanced)", label: "C1 (Advanced)" },
                ]}
              />
            </div>

            <div>
              <Typography.Text type="secondary" style={{ marginBottom: 8, display: "block" }}>
                <WarningOutlined style={{ marginRight: 4 }} /> Điểm yếu cần khắc phục
              </Typography.Text>
              <Input 
                placeholder="Ví dụ: Phát âm, ngữ pháp..."
                value={weakness}
                onChange={handleWeaknessChange}
              />
            </div>
          </Space>
        </div>

       
      </Layout.Sider>

      <Layout.Content className="app-content">
        <ChatWindow level={level} weakness={weakness} />
      </Layout.Content>
    </Layout>
  );
}
