import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const { prompt, width = 1024, height = 1024, seed } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Using Pollinations AI with backend proxy to avoid CORS
    // This bypasses the Turnstile token requirement when called from server-side
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&enhance=true`;

    // Fetch the image from Pollinations to verify it works
    const response = await fetch(imageUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VisionMart/1.0)",
      },
    });

    if (!response.ok) {
      console.error("Pollinations API Error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to generate image from Pollinations API" },
        { status: response.status }
      );
    }

    // Return the URL directly since Pollinations generates via URL
    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error generating image:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
