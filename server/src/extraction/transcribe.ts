import { createReadStream } from "node:fs";
import OpenAI from "openai";
import { env } from "../env.js";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function transcribeAudio(filePath: string): Promise<string> {
  const transcription = await openai.audio.transcriptions.create({
    file: createReadStream(filePath),
    model: "whisper-1",
  });
  return transcription.text;
}
