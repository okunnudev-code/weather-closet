import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { items } = await req.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ totalCost: 0, currency: 'GBP' });
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { thinkingConfig: { thinkingBudget: 0 } } as any,
  });

  const itemList = items
    .map((item: { id: string; name: string }, i: number) => `${i + 1}. ${item.name}`)
    .join('\n');

  const prompt = `You are a fashion pricing expert. Estimate the typical UK retail price in GBP (£) for each clothing item listed below, based on its description. Assume mid-range high street pricing (e.g. Zara, H&M, ASOS level).

Items:
${itemList}

Respond ONLY with valid JSON in this exact format:
{
  "totalCost": 245,
  "currency": "GBP"
}

Where totalCost is the sum of all estimated prices as a whole number.`;

  let result;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      result = await model.generateContent(prompt);
      break;
    } catch (err: any) {
      const delay = err?.errorDetails?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay;
      const ms = delay ? parseInt(delay) * 1000 + 500 : (attempt + 1) * 8000;
      if (attempt < 2) await new Promise(r => setTimeout(r, ms));
      else throw err;
    }
  }
  const text = result!.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ totalCost: 0, currency: 'GBP' });

  const parsed = JSON.parse(jsonMatch[0]);
  return NextResponse.json(parsed);
}
