import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_TEMPLATE } from "../constants";
import { StoryboardResponse, GridSize, Language } from "../types";

export const generateStoryboard = async (
  script: string,
  imageBase64: string,
  gridSize: GridSize,
  language: Language
): Promise<StoryboardResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("环境变量中未定义 API_KEY。");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare variables
  const shotCount = gridSize * gridSize;
  const gridLayout = `${gridSize}x${gridSize}`;
  const languageName = language === 'zh' ? 'Chinese (Simplified)' : 'English';

  // Interpolate prompt
  let systemInstruction = SYSTEM_PROMPT_TEMPLATE
    .replace("{{LANGUAGE}}", languageName)
    .replace("{{COUNT}}", shotCount.toString())
    .replace("{{LAYOUT}}", gridLayout)
    .replace("{{SCRIPT}}", script);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Updated to Gemini 3 Pro Preview
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg/png, standardizing header
              data: imageBase64
            }
          },
          {
            text: systemInstruction
          }
        ]
      },
      config: {
        responseMimeType: 'application/json', // Enabled JSON mode for better stability with Pro model
        temperature: 0.4, 
      }
    });

    const text = response.text || "{}";
    
    // Clean up if the model includes markdown formatting (even in JSON mode it sometimes adds blocks)
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(cleanJson) as StoryboardResponse;

    // Validate structure roughly
    if (!data.shots || !Array.isArray(data.shots)) {
      throw new Error("Gemini 返回的 JSON 结构无效");
    }

    // Ensure we have the requested number of shots (fallback if model generates too few)
    if (data.shots.length < shotCount) {
        const diff = shotCount - data.shots.length;
        for(let i=0; i<diff; i++) {
            data.shots.push({
                shot_number: `Shot ${data.shots.length + 1}`,
                prompt_text: "Scene continuation, consistent style, no timecode, no subtitles."
            });
        }
    }
    
    // Trim if too many
    if (data.shots.length > shotCount) {
        data.shots = data.shots.slice(0, shotCount);
    }

    return data;

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    // Forward the actual error message if possible for debugging
    throw new Error(error.message || "生成分镜时发生错误，请重试。");
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result?.toString().replace(/^data:(.*,)?/, "");
      if (encoded && (encoded.length % 4) > 0) {
        encoded += "=".repeat(4 - (encoded.length % 4));
      }
      resolve(encoded || "");
    };
    reader.onerror = (error) => reject(error);
  });
};