import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

const VocabularySchema = z.object({
  word: z.string(),
  phonetic: z.string(),
  partOfSpeech: z.string(),
  meanings: z.array(z.object({
    pos: z.string(),
    translations: z.array(z.string()),
  })),
  meaning: z.string(),
  meaningEn: z.string(),
  examples: z.array(z.object({
    sentence: z.string(),
    translation: z.string(),
  })).length(2),
  grammarNotes: z.array(z.string()),
  level: z.enum(["Dễ", "Trung bình", "Khó"]),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
});

export type VocabularyResult = z.infer<typeof VocabularySchema>;

export async function POST(req: Request): Promise<NextResponse> {
  const { word } = await req.json();

  if (!word || typeof word !== "string" || word.trim().length === 0) {
    return NextResponse.json({ error: "Từ vựng không hợp lệ" }, { status: 400 });
  }

  if (!/^[a-zA-Z\s'\-]+$/.test(word.trim())) {
    return NextResponse.json({ error: "Chỉ tra cứu từ tiếng Anh nhé! Cô Lành không biết tiếng khác 😅" }, { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
      schema: VocabularySchema,
      system: `Bạn là Cô Lành — một cô giáo từ điển sống động, hài hước, lầy lội nhưng rất chuẩn kiến thức. Trả lời đúng schema được yêu cầu.`,
      prompt: `Phân tích từ vựng tiếng Anh: "${word.trim()}"

Lưu ý:
- partOfSpeech và meanings[].pos: dùng từ đầy đủ (noun, verb, adjective, adverb...), KHÔNG viết tắt
- meanings: nhóm theo từ loại, mỗi nhóm có 2-3 nghĩa tiếng Việt ngắn
- meaning: giải thích tiếng Việt theo phong cách hài hước Cô Lành (1-2 câu)
- meaningEn: same humorous Co Lanh style but in English (1-2 sentences)
- examples: ĐÚNG 2 câu ví dụ tiếng Anh sáng tạo, hài hước, liên quan đời sống học sinh/sinh viên Việt Nam, kèm bản dịch tiếng Việt
- grammarNotes: 2-4 lưu ý ngữ pháp thực tế
- level: "Dễ" | "Trung bình" | "Khó"
- synonyms: 2-3 từ đồng nghĩa (nếu có)
- antonyms: 1-2 từ trái nghĩa (nếu có)`,
    });

    return NextResponse.json(object);
  } catch {
    return NextResponse.json(
      { error: "Cô Lành đang bận... hoặc từ này Cô không biết 😅 Thử từ khác nhé!" },
      { status: 500 }
    );
  }
}
