import { supabase } from "./client";
import { v4 as uuidv4 } from "uuid";
import { Message } from "ai";

export interface ChatSession {
  id: string;
  created_at: string;
  title: string | null;
}

export async function createChatSession(): Promise<string | null> {
  const newId = uuidv4();
  const { error } = await supabase.from("chats").insert([{ id: newId, title: "Đoạn chat mới" }]);
  if (error) {
    console.error("Error creating chat session:", error);
    return null;
  }
  return newId;
}

export async function fetchChatSessions(): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
  return data || [];
}

export async function fetchChatMessages(chatId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant" | "system",
    content: msg.content,
  }));
}

export async function saveMessage(chatId: string, message: Message) {
  const { error } = await supabase.from("messages").insert([
    {
      id: uuidv4(), // Explicitly send a new UUID to fix Turbopack cache issues
      chat_id: chatId,
      role: message.role,
      content: message.content,
    },
  ]);
  if (error) {
    console.error("Error saving message:", error);
  }
}

export async function updateChatTitle(chatId: string, title: string) {
  const { error } = await supabase
    .from("chats")
    .update({ title })
    .eq("id", chatId);
  if (error) {
    console.error("Error updating chat title Details:", error.message, error.details, error.hint);
  }
}

export async function deleteChatSession(chatId: string) {
  const { error } = await supabase.from("chats").delete().eq("id", chatId);
  if (error) {
    console.error("Error deleting chat:", error);
    return false;
  }
  return true;
}

export async function deleteAllChatSessions() {
  // Supabase delete requires at least one filter. 
  // We use .neq to match all valid UUIDs.
  const { error } = await supabase.from("chats").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    console.error("Error deleting all chats:", error);
    return false;
  }
  return true;
}
