"use client";

import { Avatar } from "antd";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageItemProps {
  message: {
    id: string;
    role: "user" | "assistant" | "system" | "function" | "data" | "tool";
    content: string;
  };
  avatarSrc?: string;
}

function MessageItem({ message, avatarSrc }: MessageItemProps) {
  const isUser = message.role === "user";

  // Không render bong bóng chat nếu nội dung rỗng (như khi AI gọi tool ngầm)
  if (!message.content || message.content.trim() === "") {
    // Có thể check toolInvocations nếu muốn báo "Đang cào dữ liệu..." nhưng hiện tại ẩn luôn cho đẹp
    return null;
  }

  return (
    <div className={`message-row ${isUser ? "message-row--user" : "message-row--ai"}`}>
      {!isUser && (
        avatarSrc ? (
          <Image src={avatarSrc} alt="AI" width={36} height={36} className="message-avatar message-avatar--ai" style={{ borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <Avatar className="message-avatar message-avatar--ai" size={36}>
            👩‍🏫
          </Avatar>
        )
      )}
      <div className={`message-bubble ${isUser ? "message-bubble--user" : "message-bubble--ai"}`}>
        <div className="message-text px-2 markdown-message">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
      </div>
      {isUser && (
        <Avatar className="message-avatar message-avatar--user" size={36}>
          🙋
        </Avatar>
      )}
    </div>
  );
}

export default MessageItem;
