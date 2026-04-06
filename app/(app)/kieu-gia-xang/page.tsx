"use client";

import React, { useState, useEffect } from "react";
import ChatWindow from "../../../components/ChatWindow";
import ChatHistorySidebar from "../../../components/ChatHistorySidebar";
import DiscordSettings from "./components/DiscordSettings";
import { Drawer, Spin } from "antd";
import { createChatSession, fetchChatSessions } from "../../../utils/supabase/chat";

export default function KieuGiaXangPage(): React.ReactElement {

  const [currentChatId, setCurrentChatId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("kieu_gia_xang_chat_id") : null
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

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
      const existing = await fetchChatSessions("kieu");
      
      if (currentChatId) {
        // Verify if the local cached ID still exists in the database
        if (!existing.find(c => c.id === currentChatId)) {
          if (existing.length > 0) {
            handleSelectChat(existing[0].id);
          } else {
            await handleNewChat();
          }
        }
      } else {
        if (existing && existing.length > 0) {
          handleSelectChat(existing[0].id);
        } else {
          await handleNewChat();
        }
      }
      setIsInitializing(false);
    }
    
    init();
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
      <div className="flex h-full w-full max-w-[1400px] overflow-hidden mx-auto">
        
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
          {isInitializing ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Spin size="large" />
            </div>
          ) : (
            <ChatWindow 
              externalChatId={currentChatId}
              onChatCreated={handleSelectChat}
              onChatTitleUpdated={handleTitleUpdated}
              onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
              onMessagesLoaded={() => setLoadingChatId(null)}
              apiEndpoint="/api/gia-xang"
              subtitle="AI has broad knowledge"
              welcomeTitle="Chào mừng đến với Cô Kiều Petrolimex!"
              welcomeMessage="Em ơi nay đổ xăng gì, hỏi lẹ đi nào! ⛽"
              inputPlaceholder="Bạn cần hỏi gì không... (Enter gửi, Shift+Enter xuống dòng)"
              namespace="kieu"
              headerName="Cô Kiều"
              avatarSrc="/co-kieu-avatar.png"
            />
          )}
        </div>
      </div>
    </div>
  );
}
