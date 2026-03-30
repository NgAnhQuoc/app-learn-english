import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";

const VocabularySchema = z.object({
  found: z.boolean(),
  word: z.string().optional(),
  phonetic: z.string().optional(),
  partOfSpeech: z.string().optional(),
  meanings: z.array(z.object({
    pos: z.string(),
    translations: z.array(z.string()),
  })).optional(),
  meaning: z.string().optional(),
  meaningEn: z.string().optional(),
  examples: z.array(z.object({
    sentence: z.string().describe("Câu ví dụ tiếng Anh"),
    translation: z.string().describe("Bản dịch tiếng Việt của câu ví dụ"),
  })).optional(),
  grammarNotes: z.array(z.string()).optional(),
  level: z.enum(["Dễ", "Trung bình", "Khó"]).optional(),
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
      system: `Bạn là Cô Lành — từ điển tiếng Anh chuẩn. Nhiệm vụ: kiểm tra xem từ có tồn tại trong từ điển tiếng Anh chuẩn (Oxford, Merriam-Webster) không.

QUAN TRỌNG:
- Nếu từ KHÔNG tồn tại trong từ điển tiếng Anh (từ bịa, từ tiếng Việt phiên âm, lỗi chính tả, tên riêng không phải từ vựng...) → trả về found: false, KHÔNG cần điền các field khác.
- Nếu từ CÓ tồn tại → trả về found: true và điền đầy đủ thông tin.
- Ví dụ KHÔNG tồn tại: "meo", "xin", "chao", "phong", "nam", "thanh", tên người, tên địa danh thuần Việt.
- Ví dụ CÓ tồn tại: "cat", "run", "beautiful", "procrastinate", "meow" (tiếng mèo kêu).`,
      prompt: `Tra từ: "${word.trim()}"

Nếu found: true, điền đầy đủ:
- partOfSpeech và meanings[].pos: từ đầy đủ (noun, verb, adjective...), KHÔNG viết tắt
- meanings: nhóm theo từ loại, mỗi nhóm 2-3 nghĩa tiếng Việt
- meaning: giải thích tiếng Việt phong cách hài hước Cô Lành (1-2 câu)
- meaningEn: same humorous style in English
- examples: ĐÚNG 2 câu ví dụ tiếng Anh sáng tạo liên quan đời sống học sinh VN (trường sentence), kèm dịch tiếng Việt (trường translation)
- grammarNotes: 2-4 lưu ý ngữ pháp
- synonyms: 2-3 từ đồng nghĩa (nếu có)
- antonyms: 1-2 từ trái nghĩa (nếu có)
- level: phân loại độ khó của từ ("Dễ", "Trung bình", "Khó")

QUY TẮC BẮT BUỘC:
- examples[].sentence: chỉ được viết tiếng Anh, không chứa chữ cái tiếng Việt có dấu (ă â ê ô ơ ư đ).
- examples[].translation: chỉ viết tiếng Việt.
Nếu vi phạm → tự sửa lại trước khi trả kết quả.

Nếu found: false, chỉ cần trả về found: false là đủ.`,
    });

    return NextResponse.json(object);
  } catch {
    return NextResponse.json(
      { error: "Cô Lành đang bận... Thử lại nhé! 😅" },
      { status: 500 }
    );
  }
}

