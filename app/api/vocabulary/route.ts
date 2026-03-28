import { z } from "zod";
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
  example: z.string(),
  exampleTranslation: z.string(),
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
    const openaiRes = await fetch(`${process.env.OPENAI_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Bạn là Cô Lành — một cô giáo từ điển sống động, hài hước, lầy lội nhưng rất chuẩn kiến thức. Luôn trả về JSON hợp lệ theo đúng schema được yêu cầu.`,
          },
          {
            role: "user",
            content: `Phân tích từ vựng tiếng Anh: "${word.trim()}"

QUAN TRỌNG: Chỉ phân tích từ tiếng Anh. Trả về JSON với đúng các field sau:
- word: từ tiếng Anh
- phonetic: phiên âm IPA chuẩn (US), ví dụ /lɜːrn/
- partOfSpeech: từ loại chính — dùng từ đầy đủ: noun, verb, adjective, adverb... KHÔNG viết tắt
- meanings: mảng nhóm nghĩa theo từ loại, mỗi phần tử có "pos" (noun/verb/adjective... đầy đủ, KHÔNG viết tắt) và "translations" (2-3 nghĩa ngắn tiếng Việt). Ví dụ cho "run": [{"pos":"verb","translations":["chạy","vận hành"]},{"pos":"noun","translations":["cuộc chạy"]}]
- meaning: giải thích nghĩa tiếng Việt theo phong cách hài hước Cô Lành (1-2 câu)
- example: câu ví dụ tiếng Anh sáng tạo, liên quan đời sống học sinh/sinh viên Việt Nam
- exampleTranslation: dịch câu ví dụ sang tiếng Việt tự nhiên
- grammarNotes: mảng 2-4 lưu ý ngữ pháp thực tế
- level: "Dễ" | "Trung bình" | "Khó"
- synonyms: mảng 2-3 từ đồng nghĩa (optional)
- antonyms: mảng 1-2 từ trái nghĩa nếu có (optional)`,
          },
        ],
      }),
    });

    if (!openaiRes.ok) {
      throw new Error(`OpenAI error: ${openaiRes.status}`);
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = VocabularySchema.parse(JSON.parse(content));
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Cô Lành đang bận... hoặc từ này Cô không biết 😅 Thử từ khác nhé!" },
      { status: 500 }
    );
  }
}
