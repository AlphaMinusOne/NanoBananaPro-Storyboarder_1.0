export interface Shot {
  shot_number: string;
  prompt_text: string;
}

export interface StoryboardResponse {
  image_generation_model: string;
  grid_layout: string;
  grid_aspect_ratio: string;
  shots: Shot[];
}

export type GridSize = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface GridConfig {
  rows: number;
  cols: number;
  label: string;
}

export type Language = 'en' | 'zh';

export const SHOT_TYPES = [
  "Extreme Wide Shot",
  "Wide Shot",
  "Full Shot",
  "Medium Wide Shot",
  "Medium Shot",
  "Medium Close-Up",
  "Close-Up",
  "Extreme Close-Up",
  "Low Angle",
  "High Angle",
  "Over the Shoulder",
  "Bird's Eye View",
  "Dutch Angle"
];