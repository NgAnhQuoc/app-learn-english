import { supabase } from "./client";
import { v4 as uuidv4 } from "uuid";
import { Message } from "ai";

export interface ChatSession {
  id: string;
  created_at: string;
  title: string | null;
}

export type ChatNamespace = "cominh" | "kieu";

const getTables = (namespace: ChatNamespace = "cominh") => {
  if (namespace === "kieu") {
    return { chatsTable: "kieu_chats", messagesTable: "kieu_messages" };
  }
  return { chatsTable: "chats", messagesTable: "messages" };
};

export async function createChatSession(ns: ChatNamespace = "cominh"): Promise<string | null> {
  const newId = uuidv4();
  const { chatsTable } = getTables(ns);
  const { error } = await supabase.from(chatsTable).insert([{ id: newId, title: "Đoạn chat mới" }]);
  if (error) {
    console.error("Error creating chat session:", error);
    return null;
  }
  return newId;
}

export async function fetchChatSessions(ns: ChatNamespace = "cominh"): Promise<ChatSession[]> {
  const { chatsTable } = getTables(ns);
  const { data, error } = await supabase
    .from(chatsTable)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
  return data || [];
}

const TOOL_TAG = "|||TOOL_DATA|||";

export async function fetchChatMessages(chatId: string, ns: ChatNamespace = "cominh"): Promise<Message[]> {
  const { messagesTable } = getTables(ns);
  const { data, error } = await supabase
    .from(messagesTable)
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data.map((msg) => {
    let content = msg.content || "";
    let toolInvocations = undefined;
    
    // Check if the content has serialized tool invocations
    if (content.includes(TOOL_TAG)) {
      const parts = content.split(TOOL_TAG);
      content = parts[0];
      try {
        toolInvocations = JSON.parse(parts[1]);
      } catch (e) {
        console.error("Failed to parse tool data from history", e);
      }
    }

    return {
      id: msg.id,
      role: msg.role as "user" | "assistant" | "system",
      content,
      ...(toolInvocations ? { toolInvocations } : {})
    };
  });
}

export async function saveMessage(chatId: string, message: Message, ns: ChatNamespace = "cominh") {
  const { messagesTable } = getTables(ns);
  
  // Serialize tool invocations to be saved safely into the single "content" column mapping.
  let contentToSave = message.content || "";
  if (message.toolInvocations && message.toolInvocations.length > 0) {
    contentToSave += TOOL_TAG + JSON.stringify(message.toolInvocations);
  }

  const { error } = await supabase.from(messagesTable).insert([
    {
      id: uuidv4(), // Explicitly send a new UUID to fix Turbopack cache issues
      chat_id: chatId,
      role: message.role,
      content: contentToSave,
    },
  ]);
  if (error) {
    console.error("Error saving message:", error);
  }
}

export async function updateChatTitle(chatId: string, title: string, ns: ChatNamespace = "cominh") {
  const { chatsTable } = getTables(ns);
  const { error } = await supabase
    .from(chatsTable)
    .update({ title })
    .eq("id", chatId);
  if (error) {
    console.error("Error updating chat title Details:", error.message, error.details, error.hint);
  }
}

export async function deleteChatSession(chatId: string, ns: ChatNamespace = "cominh") {
  const { chatsTable } = getTables(ns);
  const { error } = await supabase.from(chatsTable).delete().eq("id", chatId);
  if (error) {
    console.error("Error deleting chat:", error);
    return false;
  }
  return true;
}

export async function deleteAllChatSessions(ns: ChatNamespace = "cominh") {
  const { chatsTable } = getTables(ns);
  // Supabase delete requires at least one filter. 
  // We use .neq to match all valid UUIDs.
  const { error } = await supabase.from(chatsTable).delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    console.error("Error deleting all chats:", error);
    return false;
  }
  return true;
}
