import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType } = await req.json();

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { thinkingConfig: { thinkingBudget: 0 } } as any,
  });

  let result;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      result = await model.generateContent([
        { inlineData: { data: imageBase64, mimeType: mimeType ?? 'image/jpeg' } },
        `You are a fashion assistant. Look at this clothing item and write a short but detailed description.
Include: type of clothing, colour, style, material if visible, fit, and any notable features.
This description will be used by an AI to recommend weather-appropriate outfits, so be specific.
Examples: "Thick cream cable-knit wool jumper, relaxed fit" or "Light blue slim-fit denim jeans, mid-rise".
Reply with ONLY the description, no extra text, max 120 characters.`,
      ]);
      break;
    } catch (err: any) {
      const delay = err?.errorDetails?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay;
      const ms = delay ? parseInt(delay) * 1000 + 500 : (attempt + 1) * 8000;
      if (attempt < 2) await new Promise(r => setTimeout(r, ms));
      else throw err;
    }
  }

  const name = result!.response.text().trim();
  return NextResponse.json({ name });
}
