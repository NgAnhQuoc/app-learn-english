import React, { useEffect, useState } from "react";
import { Typography, Spin, Popconfirm, Empty, Button } from "antd";
import { MessageOutlined, DeleteOutlined, PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { ChatSession, fetchChatSessions, deleteChatSession, deleteAllChatSessions, ChatNamespace } from "../utils/supabase/chat";

const { Text } = Typography;

interface ChatHistorySidebarProps {
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onClearChat: () => void;
  refreshTrigger: number;
  isCreatingChat: boolean;
  loadingChatId?: string | null;
  namespace?: ChatNamespace;
}

export default function ChatHistorySidebar({ currentChatId, onSelectChat, onNewChat, onClearChat, refreshTrigger, isCreatingChat, loadingChatId, namespace = "cominh" }: ChatHistorySidebarProps) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  const isFirstLoad = React.useRef(true);

  useEffect(() => {
    let isMounted = true;
    async function loadChats() {
      if (isFirstLoad.current) {
        setLoading(true);
      }
      const data = await fetchChatSessions(namespace);
      if (isMounted) {
        setChats(data);
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
    loadChats();
    return () => { isMounted = false; };
  }, [refreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const success = await deleteChatSession(id, namespace);
    if (success) {
      setChats(prev => prev.filter(c => c.id !== id));
      if (currentChatId === id) {
        onClearChat();
      }
    }
  };

  const handleDeleteAll = async () => {
    const success = await deleteAllChatSessions(namespace);
    if (success) {
      setChats([]);
      onClearChat();
    }
  };

  return (
    <div className="chat-history-sidebar">
      <div style={{ padding: "16px 16px 0" }}>
        <Button 
          type="text" 
          icon={isCreatingChat ? <LoadingOutlined style={{ color: "#ffffff" }} spin /> : <PlusOutlined />} 
          onClick={onNewChat}
          disabled={isCreatingChat}
          block
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            justifyContent: "flex-start",
            height: "40px",
            borderRadius: "8px",
            fontWeight: 500
          }}
        >
          Tạo chat mới
        </Button>
      </div>

      <div className="chat-history-header">
        <Text style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>CÁC ĐOẠN CHAT CŨ</Text>
      </div>

      <div className="chat-history-list">
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}><Spin /></div>
        ) : chats.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description={<span style={{color: 'rgba(255,255,255,0.4)'}}>Chưa có lịch sử</span>} 
          />
        ) : (
          chats.map(chat => (
            <div 
              key={chat.id} 
              className={`chat-history-item ${currentChatId === chat.id ? "active" : ""}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="chat-history-content">
                <MessageOutlined className="chat-icon" />
                <Text className="chat-title">
                  {chat.title || "Đoạn chat mới"}
                </Text>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {loadingChatId === chat.id && (
                  <LoadingOutlined style={{ color: 'var(--accent)', fontSize: 13 }} spin />
                )}
                {!loadingChatId && !isCreatingChat && (
                  <Popconfirm
                    title="Xóa đoạn chat này?"
                    description="Bạn chắc chắn muốn xóa?"
                    onConfirm={(e) => handleDelete(e as React.MouseEvent, chat.id)}
                    onCancel={(e) => e?.stopPropagation()}
                    okText="Xóa"
                    cancelText="Hủy"
                    placement="right"
                  >
                    <div className="chat-delete-btn" onClick={(e) => e.stopPropagation()}>
                      <DeleteOutlined />
                    </div>
                  </Popconfirm>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {chats.length > 0 && !loadingChatId && !isCreatingChat && (
        <div style={{ padding: "16px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <Popconfirm
            title="Xóa TẤT CẢ đoạn chat?"
            description="Hành động này không thể hoàn tác. Bạn chắc chắn chứ?"
            onConfirm={handleDeleteAll}
            okText="Xóa tất cả"
            cancelText="Hủy"
            placement="top"
          >
            <Button danger block icon={<DeleteOutlined />} type="text" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
              Xóa tất cả lịch sử
            </Button>
          </Popconfirm>
        </div>
      )}
    </div>
  );
}
