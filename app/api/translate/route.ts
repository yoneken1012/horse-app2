import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Detect language by character types
// Returns 'ja' if contains hiragana, katakana, or kanji; otherwise 'fr'
function detectLanguage(text: string): "ja" | "fr" {
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
  return hasJapanese ? "ja" : "fr";
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set");
      return NextResponse.json(
        { error: "Translation service not configured" },
        { status: 500 }
      );
    }

    const sourceLang = detectLanguage(text);
    const targetLang = sourceLang === "ja" ? "fr" : "ja";

    const sourceLangName = sourceLang === "ja" ? "Japanese" : "French";
    const targetLangName = targetLang === "ja" ? "Japanese" : "French";

    const systemPrompt = `You are a professional translator specializing in horse racing communication between Japanese horse owners and French stable staff. Translate the message naturally, preserving the emotional tone and warmth. Output ONLY the translated text, nothing else. No quotes, no explanations.`;

    const userPrompt = `Translate this ${sourceLangName} message to ${targetLangName}:

${text}`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    // Extract text from response
    const translatedText = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    if (!translatedText) {
      return NextResponse.json(
        { error: "Translation failed: empty response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      translatedText,
      originalLanguage: sourceLang,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
