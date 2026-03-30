"use client";

import React, { useState, useEffect } from "react";
import ChatWindow from "../../../components/ChatWindow";
import ChatHistorySidebar from "../../../components/ChatHistorySidebar";
import DiscordSettings from "./components/DiscordSettings";
import { Drawer } from "antd";
import { createChatSession, fetchChatSessions } from "../../../utils/supabase/chat";

export default function KieuGiaXangPage(): React.ReactElement {
  // Use generic empty states for testing without settings widget
  const level = "A2 (Pre-Intermediate)";
  const weakness = "";

  const [currentChatId, setCurrentChatId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("kieu_gia_xang_chat_id") : null
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);

  const handleSelectChat = (id: string) => {
    const newId = id || null;
    setCurrentChatId(newId);
    if (newId) {
      localStorage.setItem("kieu_gia_xang_chat_id", newId);
      if (newId !== currentChatId) setLoadingChatId(newId);
    } else {
      localStorage.removeItem("kieu_gia_xang_chat_id");
      setLoadingChatId(null);
    }
    setMobileDrawerOpen(false);
  };

  const handleNewChat = async () => {
    setIsCreatingChat(true);
    const [newId] = await Promise.all([
      createChatSession("kieu"),
      new Promise(resolve => setTimeout(resolve, 500))
    ]);
    
    if (newId) handleSelectChat(newId);
    else handleSelectChat("");
    
    setRefreshTrigger(prev => prev + 1);
    setIsCreatingChat(false);
  };

  useEffect(() => {
    async function init() {
      if (!currentChatId) {
        const existing = await fetchChatSessions("kieu");
        if (existing && existing.length > 0) {
          handleSelectChat(existing[0].id);
        } else {
          handleNewChat();
        }
      }
    }
    // Only run this logic initially
    if (!currentChatId && !isCreatingChat) {
      init();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearChat = () => {
    handleSelectChat("");
  };

  const handleTitleUpdated = () => {
    setTimeout(() => setRefreshTrigger(prev => prev + 1), 500);
  };

  return (
    <div className="vocab-split-page">
      <div style={{ display: "flex", height: "100%", width: "100%", maxWidth: "1400px", overflow: "hidden", margin: "0 auto" }}>
        
        {/* Desktop Sidebar */}
        <div className="chat-sidebar-desktop relative">
            {/* Header for Settings */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <DiscordSettings />
            </div>
            <ChatHistorySidebar 
                currentChatId={currentChatId} 
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onClearChat={handleClearChat}
                refreshTrigger={refreshTrigger}
                isCreatingChat={isCreatingChat}
                loadingChatId={loadingChatId}
                namespace="kieu"
            />
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title="Lịch sử Kiều Giá Xăng"
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          className="chat-history-drawer"
          width={280}
          styles={{ body: { padding: 0 } }}
        >
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <DiscordSettings />
          </div>
          <ChatHistorySidebar 
            currentChatId={currentChatId} 
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onClearChat={handleClearChat}
            refreshTrigger={refreshTrigger}
            isCreatingChat={isCreatingChat}
            loadingChatId={loadingChatId}
            namespace="kieu"
          />
        </Drawer>
        
        <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
          <ChatWindow 
            level={level} 
            weakness={weakness} 
            externalChatId={currentChatId}
            onChatCreated={handleSelectChat}
            onChatTitleUpdated={handleTitleUpdated}
            onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
            onMessagesLoaded={() => setLoadingChatId(null)}
            apiEndpoint="/api/kieu-chat"
            subtitle="AI has broad knowledge"
            welcomeTitle="Chào mừng đến Cô Minh biết tuốt!"
            welcomeMessage="Mấy đứa mỏ hỗn nay đổ xăng gì, hỏi lẹ cô còn làm sổ sách! ⛽"
            inputPlaceholder="Bạn cần hỏi gì không... (Enter gửi, Shift+Enter xuống dòng)"
            namespace="kieu"
          />
        </div>
      </div>
    </div>
  );
}
