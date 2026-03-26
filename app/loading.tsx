"use client";

import React from "react";
import { Spin } from "antd";

export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100dvh",
        width: "100%",
        background: "#0a0a0a",
      }}
    >
      <Spin size="large" />
    </div>
  );
}

