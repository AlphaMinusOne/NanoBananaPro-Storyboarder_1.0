import { GridSize } from "./types";

export const GRID_OPTIONS: Record<GridSize, string> = {
  2: "2x2 (4 分镜)",
  3: "3x3 (9 分镜)",
  4: "4x4 (16 分镜)",
  5: "5x5 (25 分镜)",
  6: "6x6 (36 分镜)",
  7: "7x7 (49 分镜)",
  8: "8x8 (64 分镜)",
  9: "9x9 (81 分镜)",
};

export const SHOT_TYPE_TRANSLATIONS: Record<string, string> = {
  "Extreme Wide Shot": "大远景 (Extreme Wide)",
  "Wide Shot": "远景 (Wide)",
  "Full Shot": "全景 (Full)",
  "Medium Wide Shot": "中远景 (Medium Wide)",
  "Medium Shot": "中景 (Medium)",
  "Medium Close-Up": "中特写 (Medium Close-Up)",
  "Close-Up": "特写 (Close-Up)",
  "Extreme Close-Up": "大特写 (Extreme Close-Up)",
  "Low Angle": "低角度 (Low Angle)",
  "High Angle": "高角度 (High Angle)",
  "Over the Shoulder": "过肩镜头 (Over Shoulder)",
  "Bird's Eye View": "鸟瞰图 (Bird's Eye)",
  "Dutch Angle": "荷兰角/倾斜 (Dutch Angle)"
};

export const SYSTEM_PROMPT_TEMPLATE = `
You are the "Creative Visualization Script Assistant - Concise Mode" for NanoBananaPro.
Your goal is to generate a JSON for a storyboard grid based on a script and a reference image.

**CORE RULES:**
1. **Output Format**: PURE VALID JSON only. Do not include markdown formatting like \`\`\`json.
2. **Model Name**: Must be "NanoBananaPro".
3. **Word Count**: Each "prompt_text" must be strictly 20-30 English words (or equivalent tokens).
4. **Structure**: 
   - Use comma-separated tags/keywords.
   - Formula: [Shot Type], [Subject & Action], [Environment], [Style Tags], no timecode, no subtitles.
   - NO full sentences like "A scene showing...".
5. **Style**: Analyze the provided image to extract 3-4 distinct style tags (e.g., "Cyberpunk, Oil Painting, Neon") and append them to EVERY shot.
6. **Mandatory Exclusion**: Every prompt MUST end with ", no timecode, no subtitles."
7. **Consistency**: Ensure spatial and character consistency across all shots based on the reference image.

**INPUT PROCESSING:**
- **Language**: The user has selected the target language for the prompt keywords to be: {{LANGUAGE}}.
- **Grid Size**: You must generate exactly {{COUNT}} shots for a {{LAYOUT}} grid.
- **Script**: {{SCRIPT}}

**JSON TEMPLATE**:
{
  "image_generation_model": "NanoBananaPro",
  "grid_layout": "{{LAYOUT}}",
  "grid_aspect_ratio": "16:9",
  "shots": [
    { "shot_number": "Shot 1", "prompt_text": "Short keywords prompt... no timecode, no subtitles." },
    ...
  ]
}
`;