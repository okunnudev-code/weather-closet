import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { weather, items, excludeIds = [] } = await req.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ recommendedIds: [], explanation: 'No clothes in your closet yet.' });
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { thinkingConfig: { thinkingBudget: 0 } } as any,
  });

  // Filter out excluded items entirely so they're invisible to the model
  const availableItems = items.filter((item: { id: string; name: string }) => !excludeIds.includes(item.id));

  if (availableItems.length === 0) {
    return NextResponse.json({ recommendedIds: [], explanation: 'No available items to recommend.' });
  }

  const itemList = availableItems
    .map((item: { id: string; name: string }) => `- ID:${item.id} | ${item.name}`)
    .join('\n');

  const prompt = `You are a fashion assistant building a complete, weather-appropriate outfit from a real wardrobe.

Weather: ${weather.temp}°C, ${weather.condition}, wind ${weather.windSpeed} km/h.

Available wardrobe items:
${itemList}

RULES — follow all of them:
1. You MUST select between 3 and 4 items. Never fewer than 3.
2. Build a COMPLETE outfit: always include a top, a bottom (or dress), and at least one other layer or accessory if available.
3. All selected items must work together stylistically and be appropriate for the weather conditions.
4. Use the exact item IDs from the list above. Do not invent IDs.

Respond ONLY with valid JSON — no markdown, no code fences, no extra text:
{
  "recommendedIds": ["id1", "id2", "id3"],
  "explanation": "One sentence explaining why this outfit suits the weather."
}`;

  let result;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      result = await model.generateContent(prompt);
      break;
    } catch (err: any) {
      const delay = err?.errorDetails?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay;
      const ms = delay ? Math.min(parseInt(delay) * 1000 + 500, 15000) : (attempt + 1) * 5000;
      if (attempt < 2) await new Promise(r => setTimeout(r, ms));
      else throw err;
    }
  }
  const text = result!.response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ recommendedIds: [], explanation: 'Could not generate recommendation.' });
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return NextResponse.json(parsed);
}
