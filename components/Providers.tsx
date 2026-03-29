"use client";

import "@ant-design/v5-patch-for-react-19";
import React from "react";
import { StyleProvider } from "@ant-design/cssinjs";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App, theme } from "antd";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StyleProvider layer>
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
    </StyleProvider>
  );
}

export default Providers;

