function buildEnhancedPrompt(userPrompt) {
  return `Create a bright, visually appealing, high-quality illustration.

Layout requirements:
- Landscape orientation
- Wide horizontal composition
- Similar to a presentation slide
- Suitable for display on a Magic Canvas
- Keep important content centered
- Leave safe margins around the edges
- Avoid cropping important objects
- Avoid excessive empty space

Image quality requirements:
- High resolution
- Polished and professional
- Visually impressive
- Easy to understand at a glance

User request:
${userPrompt}`;
}

export async function generateImage(userPrompt) {
  const prompt = buildEnhancedPrompt(userPrompt);

  // In Electron: IPC call — API keys stay in the main process, never in renderer
  if (typeof window !== 'undefined' && window.electronAPI) {
    const result = await window.electronAPI.generateImage(prompt);
    if (result.error) throw new Error(result.error);
    return result.dataUrl;
  }

  // Browser dev mode: Vite dev-server proxy handles CORS
  const apiKey     = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_API_VERSION;

  if (!apiKey || !deployment || !apiVersion) {
    throw new Error("Azure OpenAI environment variables are not configured.");
  }

  const url = `/api/azure/openai/deployments/${deployment}/images/generations?api-version=${apiVersion}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      size: "1792x1024",
      quality: "low",
      output_format: "png",
      n: 1,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const item = data.data?.[0];
  if (!item) throw new Error("No image data in response");

  if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (item.url) return item.url;
  throw new Error("No image URL in response");
}
