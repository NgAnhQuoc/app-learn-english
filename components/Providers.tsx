"use client";

import "@ant-design/v5-patch-for-react-19";
import React from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App, theme } from "antd";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: "#facc15",
            colorBgContainer: "#0a0a0a",
            colorBgElevated: "#171717",
            borderRadius: 12,
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}

export default Providers;
