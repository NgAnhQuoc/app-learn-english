"use client";

import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import AppSidebar from "../../components/AppSidebar";
import SettingsWidget from "../../components/SettingsWidget";

export default function AppLayout({ children }: { children: React.ReactNode }): React.ReactElement {
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
        <div className="sidebar-backdrop" onClick={() => setCollapsed(true)} />
      )}

      <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <Layout.Content className="app-content">
        {children}
      </Layout.Content>

      {/* Floating settings widget — bottom right */}
      <SettingsWidget
        level={level}
        weakness={weakness}
        onLevelChange={handleLevelChange}
        onWeaknessChange={handleWeaknessChange}
      />
    </Layout>
  );
}
