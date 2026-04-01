"use client";

import { Avatar } from "antd";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getToolDisplayName, getToolIcon } from "@/utils/toolNames";

interface ToolInvocation {
  state: "call" | "partial-call" | "result";
  toolName: string;
  toolCallId: string;
  args: Record<string, unknown>;
  result?: unknown;
}

interface MessageItemProps {
  message: {
    id: string;
    role: "user" | "assistant" | "system" | "function" | "data" | "tool";
    content: string;
    toolInvocations?: ToolInvocation[];
  };
  avatarSrc?: string;
}

function ToolStep({ tool }: { tool: ToolInvocation }) {
  const isDone = tool.state === "result";

  return (
    <details className="group tool-step-anim">
      <summary className="list-none cursor-pointer select-none outline-none flex items-center gap-2 py-0.5 hover:opacity-80 transition-opacity">
        {/* Arrow */}
        <svg className="w-2.5 h-2.5 text-gray-600 transform transition-transform group-open:rotate-90 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {/* Status dot */}
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDone ? "bg-emerald-500" : "bg-yellow-400 animate-pulse"}`} />
        {/* Label */}
        <span className="text-[13px] text-gray-400">
          {isDone ? "Completed" : "Calling"}{" "}
          <span className="text-(--accent) font-medium">
            {getToolIcon(tool.toolName)} {getToolDisplayName(tool.toolName)}
          </span>
        </span>
        {!isDone && (
          <span className="text-[10px] text-yellow-400/60 animate-pulse ml-0.5">●●●</span>
        )}
      </summary>

      {/* Expanded detail */}
      <div className="ml-[22px] mt-1.5 mb-2 border-l border-white/10 pl-3 flex flex-col gap-1.5 text-[11px]">
        <div className="text-gray-500 font-mono">
          <span className="text-gray-600 uppercase tracking-wider text-[10px]">args </span>
          <span className="text-gray-300 bg-white/5 px-1.5 py-0.5 rounded ml-1 break-all">{JSON.stringify(tool.args)}</span>
        </div>
        {isDone && (
          <div>
            <span className="text-gray-600 uppercase tracking-wider text-[10px]">result</span>
            <div className="mt-1 bg-[#080808] border border-white/8 rounded p-2 overflow-x-auto">
              <pre className="m-0 font-mono text-green-400/80 text-[10px] leading-relaxed max-h-[180px] overflow-y-auto whitespace-pre-wrap">
                {JSON.stringify(tool.result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}

function MessageItem({ message, avatarSrc }: MessageItemProps) {
  const isUser = message.role === "user";
  const hasContent = message.content && message.content.trim() !== "";
  const hasTools = message.toolInvocations && message.toolInvocations.length > 0;

  if (!hasContent && !hasTools) return null;

  const renderAvatar = () =>
    avatarSrc ? (
      <Image src={avatarSrc} alt="AI" width={36} height={36}
        className="message-avatar message-avatar--ai"
        style={{ borderRadius: "50%", objectFit: "cover" }} />
    ) : (
      <Avatar className="message-avatar message-avatar--ai" size={36}>👩‍🏫</Avatar>
    );

  return (
    <div className={`message-row ${isUser ? "message-row--user" : "message-row--ai"}`}>
      {!isUser && renderAvatar()}

      {!isUser && hasTools ? (
        <div className="flex flex-col gap-1.5 min-w-0" style={{ maxWidth: "calc(100% - 46px)" }}>
          {/* Compact tool steps */}
          <div className="flex flex-col gap-0.5">
            {message.toolInvocations!.map(tool => (
              <ToolStep key={tool.toolCallId} tool={tool} />
            ))}
          </div>
          {/* AI response bubble */}
          {hasContent && (
            <div className="message-bubble message-bubble--ai">
              <div className="message-text px-2 markdown-message">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ) : (
        hasContent && (
          <div className={`message-bubble ${isUser ? "message-bubble--user" : "message-bubble--ai"}`}>
            <div className="message-text px-2 markdown-message">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          </div>
        )
      )}

      {isUser && (
        <Avatar className="message-avatar message-avatar--user" size={36}>🙋</Avatar>
      )}
    </div>
  );
}

export default MessageItem;
