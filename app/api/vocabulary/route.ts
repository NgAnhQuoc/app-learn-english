import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { NextResponse } from "next/server";

const VocabularySchema = z.object({
  word: z.string().describe("The English word"),
  phonetic: z.string().describe("IPA phonetic transcription, e.g. /lɜːrn/"),
  partOfSpeech: z.string().describe("Primary part of speech — full word: noun, verb, adjective, adverb, preposition, conjunction, etc. NEVER use abbreviations."),
  meanings: z.array(z.object({
    pos: z.string().describe("Part of speech — full word ONLY: 'noun', 'verb', 'adjective', 'adverb', 'preposition'. NEVER use 'adj', 'adv', 'n.', 'v.' etc."),
    translations: z.array(z.string()).describe("2-3 short Vietnamese translations for this part of speech"),
  })).describe("Meanings grouped by part of speech, like a real dictionary (may have 1-3 groups)"),
  meaning: z.string().describe("Vietnamese meaning explained in Cô Lành's humorous style"),
  example: z.string().describe("A funny, witty example sentence in English"),
  exampleTranslation: z.string().describe("Vietnamese translation of the example sentence"),
  grammarNotes: z.array(z.string()).describe("List of grammar notes related to this word"),
  level: z.enum(["Dễ", "Trung bình", "Khó"]).describe("Difficulty level"),
  synonyms: z.array(z.string()).describe("2-3 synonyms").optional(),
  antonyms: z.array(z.string()).describe("1-2 antonyms if applicable").optional(),
});

export type VocabularyResult = z.infer<typeof VocabularySchema>;

export async function POST(req: Request): Promise<NextResponse> {
  const { word } = await req.json();

  if (!word || typeof word !== "string" || word.trim().length === 0) {
    return NextResponse.json({ error: "Từ vựng không hợp lệ" }, { status: 400 });
  }

  // English-only guard
  if (!/^[a-zA-Z\s'\-]+$/.test(word.trim())) {
    return NextResponse.json({ error: "Chỉ tra cứu từ tiếng Anh nhé! Cô Lành không biết tiếng khác 😅" }, { status: 400 });
  }

  try {
    //tạo thêm version dùng sdk của open ai
    const { object } = await generateObject({
      model: openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
      schema: VocabularySchema,
      prompt: `Bạn là Cô Lành — một cô giáo từ điển sống động, hài hước, lầy lội nhưng rất chuẩn kiến thức.
Hãy phân tích từ vựng tiếng Anh: "${word.trim()}"

QUAN TRỌNG: Chỉ phân tích từ tiếng Anh. Nếu nhập vào không phải tiếng Anh, hãy trả về thông báo lỗi.

Yêu cầu:
- meanings: mảng các nhóm nghĩa phân loại theo từ loại (giống từ điển thực sự). Mỗi phần từ loại có field "pos" (ví dụ "noun", "verb", "adj") và "translations" (2-3 nghĩa ngắn bằng tiếng Việt). Ví dụ cho "run": [{pos:"verb",translations:["chạy","vận hành"]},{pos:"noun",translations:["cuộc chạy"]}]
- meaning: giải thích nghĩa bằng tiếng Việt theo phong cách hài hước của Cô Lành (1-2 câu)
- example: câu ví dụ tiếng Anh sáng tạo, thú vị, liên quan đến đời sống học sinh/sinh viên Việt Nam
- exampleTranslation: dịch câu ví dụ sang tiếng Việt tự nhiên
- grammarNotes: 2-4 lưu ý ngữ pháp thực tế khi dùng từ này
- phonetic: phiên âm IPA chuẩn (US pronunciation)
- level: đánh giá độ khó thực tế cho người học TOEIC`,
    });

    return NextResponse.json(object);
  } catch {
    return NextResponse.json(
      { error: "Cô Lành đang bận... hoặc từ này Cô không biết 😅 Thử từ khác nhé!" },
      { status: 500 }
    );
  }
}
