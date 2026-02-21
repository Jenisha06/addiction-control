import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini API error:", data);
      return NextResponse.json(
        { text: "AI service error. Please try again." },
        { status: 500 }
      );
    }

    const aiText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    return NextResponse.json({ text: aiText });
  } catch (err) {
    console.error("Server crash:", err);
    return NextResponse.json(
      { text: "Server error. Please try again." },
      { status: 500 }
    );
  }
}