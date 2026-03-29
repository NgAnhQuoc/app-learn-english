"use client";

import React, { useState, useEffect } from "react";
import ChatWindow from "../../../components/ChatWindow";
import ChatHistorySidebar from "../../../components/ChatHistorySidebar";
import SettingsWidget from "../../../components/SettingsWidget";
import { createChatSession } from "../../../utils/supabase/chat";
import { Drawer } from "antd";

export default function CoMinhEnglishPage(): React.ReactElement {
  const [level, setLevel] = useState(() => 
    typeof window !== "undefined" ? (localStorage.getItem("co_minh_level") ?? "A2 (Pre-Intermediate)") : "A2 (Pre-Intermediate)"
  );
  const [weakness, setWeakness] = useState(() => 
    typeof window !== "undefined" ? (localStorage.getItem("co_minh_weakness") ?? "") : ""
  );

  const handleLevelChange = (val: string) => {
    setLevel(val);
    localStorage.setItem("co_minh_level", val);
  };

  const handleWeaknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWeakness(val);
    localStorage.setItem("co_minh_weakness", val);
  };
  
  // Chat History States
  const [currentChatId, setCurrentChatId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("co_minh_chat_id") : null
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);



  // Keep in sync when sidebar changes (via storage event)
  useEffect(() => {
    const onStorage = () => {
      const l = localStorage.getItem("co_minh_level");
      const w = localStorage.getItem("co_minh_weakness");
      if (l) setLevel(l);
      if (w !== null) setWeakness(w);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleSelectChat = (id: string) => {
    const newId = id || null; // Use empty string to signal "new chat"
    setCurrentChatId(newId);
    if (newId) {
      localStorage.setItem("co_minh_chat_id", newId);
      // Only show loading if switching to a different chat
      if (newId !== currentChatId) {
        setLoadingChatId(newId);
      }
    } else {
      localStorage.removeItem("co_minh_chat_id");
      setLoadingChatId(null);
    }
    setMobileDrawerOpen(false);
  };

  const handleNewChat = async () => {
    setIsCreatingChat(true);
    // Ensure the loading spinner is visible for at least 500ms so the user can see it
    const [newId] = await Promise.all([
      createChatSession(),
      new Promise(resolve => setTimeout(resolve, 500))
    ]);
    
    if (newId) {
      handleSelectChat(newId);
      setRefreshTrigger(prev => prev + 1);
    } else {
      handleSelectChat("");
      setRefreshTrigger(prev => prev + 1);
    }
    setMobileDrawerOpen(false);
    setIsCreatingChat(false);
  };

  const handleClearChat = () => {
    handleSelectChat("");
    setMobileDrawerOpen(false);
  };

  const handleTitleUpdated = () => {
    // Slight delay to ensure Supabase finishes the update before we fetch
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 500);
  };


  return (
    <div className="vocab-split-page">
      <div style={{ display: "flex", height: "100%", width: "100%", maxWidth: "1400px", overflow: "hidden", margin: "0 auto" }}>
        
        {/* Desktop Sidebar */}
        <div className="chat-sidebar-desktop">
          <ChatHistorySidebar 
            currentChatId={currentChatId} 
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onClearChat={handleClearChat}
            refreshTrigger={refreshTrigger}
            isCreatingChat={isCreatingChat}
            loadingChatId={loadingChatId}
          />
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title="Lịch sử trò chuyện"
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          className="chat-history-drawer"
          width={280}
          styles={{ body: { padding: 0 } }}
        >
          <ChatHistorySidebar 
            currentChatId={currentChatId} 
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onClearChat={handleClearChat}
            refreshTrigger={refreshTrigger}
            isCreatingChat={isCreatingChat}
            loadingChatId={loadingChatId}
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
          />
        </div>
      </div>

      {/* Settings widget — chỉ hiển thị ở trang Cô Minh English */}
      <SettingsWidget
        level={level}
        weakness={weakness}
        onLevelChange={handleLevelChange}
        onWeaknessChange={handleWeaknessChange}
      />
    </div>
  );
}
