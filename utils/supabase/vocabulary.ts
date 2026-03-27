import { supabase } from "./client";

export interface VocabularyHistoryEntry {
  id: string;
  word: string;
  updated_at: string;
}

export async function fetchVocabularyHistory(): Promise<string[]> {
  const { data, error } = await supabase
    .from("vocabulary_history")
    .select("word")
    .order("updated_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Error fetching vocabulary history:", error);
    return [];
  }
  
  return data.map(item => item.word);
}

export async function upsertVocabularyHistory(word: string): Promise<void> {
  const { error } = await supabase
    .from("vocabulary_history")
    .upsert(
      { word, updated_at: new Date().toISOString() },
      { onConflict: 'word' }
    );

  if (error) {
    console.error("Error upserting vocabulary history:", error);
    return;
  }

  // Giữ tối đa 8 từ mới nhất, xóa các từ cũ hơn
  const { data: top8 } = await supabase
    .from("vocabulary_history")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(8);

  if (top8 && top8.length === 8) {
    const cutoffDate = top8[7].updated_at;
    const { error: deleteError } = await supabase
      .from("vocabulary_history")
      .delete()
      .lt("updated_at", cutoffDate);
      
    if (deleteError) {
      console.error("Error pruning old vocabulary history:", deleteError);
    }
  }
}
