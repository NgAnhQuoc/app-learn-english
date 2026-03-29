"use client";

import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import AppSidebar from "../../components/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Layout className="app-layout">
      {isMobile && !collapsed && (
        <div className="sidebar-backdrop" onClick={() => setCollapsed(true)} />
      )}

      <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <Layout.Content className="app-content">
        {children}
      </Layout.Content>


    </Layout>
  );
}
