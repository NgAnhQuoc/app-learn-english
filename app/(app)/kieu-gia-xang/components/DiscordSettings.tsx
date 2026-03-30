"use client";

import React, { useState, useEffect } from "react";
import { Button, Modal, Switch, Input, Space, Popconfirm, Typography, Tooltip, Badge, App } from "antd";
import { PlusOutlined, DeleteOutlined, SendOutlined, DiscordOutlined, SettingOutlined, LinkOutlined, NotificationOutlined, RobotOutlined } from "@ant-design/icons";
import { supabase } from "@/utils/supabase/client";

interface DiscordWebhook {
  id: string;
  name: string;
  webhook_url: string;
  is_active: boolean;
  auto_notify: boolean;
}

export default function DiscordSettings() {
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [webhooks, setWebhooks] = useState<DiscordWebhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const fetchWebhooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("discord_settings")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      if (error.code !== "42P01") { // Relation does not exist (we haven't created the table yet)
         message.error("Lỗi tải danh sách Discord Webhook");
      }
    } else {
      setWebhooks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchWebhooks();
  }, [open]);

  const handleToggle = async (id: string, field: "is_active" | "auto_notify", value: boolean) => {
    const { error } = await supabase
      .from("discord_settings")
      .update({ [field]: value })
      .eq("id", id);
    if (!error) {
      message.success("Cập nhật thành công!");
      fetchWebhooks();
    } else {
      message.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("discord_settings").delete().eq("id", id);
    if (!error) {
      message.success("Đã xoá!");
      fetchWebhooks();
    }
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newUrl.trim()) {
      message.error("Vui lòng nhập đủ tên và URL");
      return;
    }

    const { error } = await supabase
      .from("discord_settings")
      .insert({ name: newName, webhook_url: newUrl, is_active: true, auto_notify: true });
    
    if (error) {
      message.error(error.message);
    } else {
      message.success("Đã thêm thành công!");
      setNewName("");
      setNewUrl("");
      setIsAdding(false);
      fetchWebhooks();
    }
  };

  const handleTest = async (id: string, url: string) => {
    setTestingId(id);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Cô Minh Check Nhẹ",
          avatar_url: "https://i.ibb.co/C0W2wF1/cominh.webp",
          content: "Hello 😎! Cô Minh thử loa nhé. Cả lớp tự động kiểm tra xem xăng nay lên chưa nghen?!",
        }),
      });
      if (res.ok) {
        message.success("Gửi test thành công! Xem kênh nhé.");
      } else {
        message.error("Lỗi dồi, webhook URL không cho gửi!");
      }
    } catch {
      message.error("URL không hợp lệ hoặc lỗi mạng");
    } finally {
      setTestingId(null);
    }
  };

  return (
    <>
      <Button 
        type="default" 
        icon={<SettingOutlined />} 
        onClick={() => setOpen(true)}
        className="w-full !rounded-xl !h-12 border-dashed border-[var(--border)] hover:!border-[#5865F2] hover:!text-[#5865F2] transition-colors font-medium dark:bg-[#141414]"
      >
        Cấu hình Kênh Discord
      </Button>
      <Modal 
        title={
          <div className="flex items-center gap-2 text-lg pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <DiscordOutlined className="text-[#5865F2] text-2xl" />
            <span className="font-bold">Quản lý Webhook Báo Giá</span>
          </div>
        }
        open={open} 
        onCancel={() => setOpen(false)}
        footer={null}
        width={700}
        classNames={{
           header: "!mb-0",
           body: "pt-4"
        }}
      >
        {/* Add Form Area */}
        <div className="mb-6">
          {isAdding ? (
            <div className="p-5 rounded-xl border bg-slate-50 dark:bg-[#141414] shadow-sm transition-all" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-4">
                <PlusOutlined className="text-[#5865F2]" />
                <Typography.Text strong>Thêm Webhook Mới</Typography.Text>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <Typography.Text type="secondary" className="block mb-1 text-xs">Tên hiển thị nội bộ</Typography.Text>
                  <Input 
                    prefix={<NotificationOutlined className="text-gray-400" />}
                    placeholder="Tên channel" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    size="large"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Typography.Text type="secondary" className="block mb-1 text-xs">Discord Webhook URL</Typography.Text>
                  <Input 
                    prefix={<LinkOutlined className="text-gray-400" />}
                    placeholder="https://discord.com/api/webhooks/..." 
                    value={newUrl} 
                    onChange={e => setNewUrl(e.target.value)} 
                    size="large"
                    className="rounded-lg font-mono text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button onClick={() => setIsAdding(false)} size="middle" className="rounded-lg">Huỷ</Button>
                  <Button type="primary" onClick={handleAdd} size="middle" className="rounded-lg shadow-md bg-[#5865F2] hover:!bg-[#4752C4] border-none">
                    Lưu Webhook
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              type="dashed" 
              icon={<PlusOutlined />} 
              onClick={() => setIsAdding(true)} 
              className="!w-full !h-12 !rounded-xl !border-gray-300 dark:!border-gray-700 hover:!border-[#5865F2] hover:!text-[#5865F2] transition-colors"
            >
              Thêm Kênh Discord mới
            </Button>
          )}
        </div>

        {/* Webhooks List */}
        <Typography.Text type="secondary" className="block mb-3 text-xs uppercase font-semibold">Danh sách kênh đã lưu</Typography.Text>
        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Đang tải danh sách...</div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-[#141414] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <DiscordOutlined className="text-4xl text-gray-300 dark:text-gray-600 mb-2" />
              <Typography.Text type="secondary" className="block">Chưa có kênh Discord nào được cấu hình</Typography.Text>
            </div>
          ) : (
             webhooks.map(hook => (
                <div 
                  key={hook.id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border bg-white dark:bg-[#1f1f1f] hover:border-[#5865F2] transition-colors gap-4 shadow-sm group"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Typography.Text strong className="text-base truncate">{hook.name}</Typography.Text>
                      {hook.is_active && <Badge color="#5865F2" text={<span className="text-xs text-[#5865F2] font-semibold">Ready</span>} />}
                    </div>
                    <Typography.Text type="secondary" className="text-xs truncate block font-mono" style={{ opacity: 0.6 }}>
                      {hook.webhook_url.replace(/(https:\/\/discord\.com\/api\/webhooks\/[^/]+\/).*/, '$1******************')}
                    </Typography.Text>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3 min-w-[120px]">
                        <Tooltip title="Cho phép AI Cô Minh lấy kênh này xài lúc chat">
                          <span className="text-xs text-gray-500 cursor-help flex items-center gap-1"><RobotOutlined /> AI Dùng</span>
                        </Tooltip>
                        <Switch size="small" checked={hook.is_active} onChange={(c) => handleToggle(hook.id, "is_active", c)} />
                      </div>
                      <div className="flex items-center justify-between gap-3 min-w-[120px]">
                        <Tooltip title="Tự động báo giá xăng lên kênh mỗi khi có lệnh chạy ngầm (Cronjob)">
                          <span className="text-xs text-gray-500 cursor-help flex items-center gap-1"><NotificationOutlined /> Tự Báo</span>
                        </Tooltip>
                        <Switch size="small" checked={hook.auto_notify} onChange={(c) => handleToggle(hook.id, "auto_notify", c)} />
                      </div>
                    </div>

                    <div className="w-[1px] h-10 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

                    <Space>
                      <Tooltip title="Gửi một tin nhắn test">
                        <Button 
                          type="text" 
                          icon={testingId === hook.id ? null : <SendOutlined className="text-[#5865F2]" />} 
                          loading={testingId === hook.id}
                          onClick={() => handleTest(hook.id, hook.webhook_url)}
                          className="hover:bg-[#5865F2]/10"
                        />
                      </Tooltip>
                      <Popconfirm 
                        title="Xoá kênh này?" 
                        description="Hành động này không thể hoàn tác" 
                        onConfirm={() => handleDelete(hook.id)}
                        okButtonProps={{ danger: true }}
                      >
                        <Tooltip title="Xoá webhook">
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            className="hover:bg-red-50 dark:hover:bg-red-900/10 opacity-60 group-hover:opacity-100 transition-opacity"
                          />
                        </Tooltip>
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
             ))
          )}
        </div>
      </Modal>
    </>
  );
}
