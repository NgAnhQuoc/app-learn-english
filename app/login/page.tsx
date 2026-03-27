"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, App } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { authenticate } from "./actions";

const { Title, Text } = Typography;

export default function LoginPage() {
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await authenticate(values.account, values.password);
      if (res?.success) {
        notification.success({
          message: "Đăng nhập thành công!",
          description: "Chào mừng bạn quay lại lớp học của Cô Minh ✨",
        });
        // We use window.location.href to perform a hard navigation here so middleware executes identically
        // and clears out any Next.js client-side cached layouts.
        window.location.href = "/co-minh-english";
      } else {
        notification.error({
          message: "Lỗi đăng nhập",
          description: res?.error || "Sai tài khoản hoặc mật khẩu!",
        });
      }
    } catch {
      notification.error({ message: "Đã có lỗi xảy ra tĩnh!" });
    }
    setLoading(false);
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      padding: 20
    }}>
      <div style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(16px)",
        borderRadius: 24,
        padding: "48px 32px",
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        textAlign: "center"
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>👩‍🏫</div>
        <Title level={2} style={{ color: "#ffc83c", marginBottom: 8, marginTop: 0, fontWeight: 700 }}>Cô Minh</Title>
        <Text style={{ color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 40, fontSize: 16 }}>
          Vui lòng đăng nhập để vào lớp học
        </Text>

        <Form
          name="login_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="account"
            rules={[{ required: true, message: "Vui lòng nhập tài khoản!" }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: "rgba(255,255,255,0.3)" }} />} 
              placeholder="Tài khoản" 
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            style={{ marginBottom: 32 }}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: "rgba(255,255,255,0.3)" }} />} 
              placeholder="Mật khẩu"
              className="login-input"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              style={{
                background: "linear-gradient(90deg, #ffc83c 0%, #ff9d00 100%)",
                border: "none",
                color: "#1a1a2e",
                fontWeight: 700,
                fontSize: 16,
                height: 50,
                borderRadius: 12
              }}
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
