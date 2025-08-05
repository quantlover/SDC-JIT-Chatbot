import OpenAI from "openai";
import { promises as fs } from 'fs';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "default_key"
});

export interface VoiceProcessingResult {
  transcript: string;
  duration?: number;
  language?: string;
  confidence?: number;
}

export interface VoiceSynthesisResult {
  audioBuffer: Buffer;
  format: string;
  duration?: number;
}

export async function transcribeAudio(audioPath: string): Promise<VoiceProcessingResult> {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('*')) {
      throw new Error('OpenAI API key not configured for voice processing');
    }

    const audioBuffer = await fs.readFile(audioPath);
    const audioFile = new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en", // Can be made dynamic
      response_format: "verbose_json",
    });

    return {
      transcript: transcription.text,
      duration: transcription.duration,
      language: transcription.language,
      // confidence: transcription.confidence, // Not available in current API
    };
  } catch (error) {
    console.error("Voice transcription error:", error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function synthesizeVoice(text: string, voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy'): Promise<VoiceSynthesisResult> {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('*')) {
      throw new Error('OpenAI API key not configured for voice synthesis');
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
      response_format: "mp3",
    });

    const audioBuffer = Buffer.from(await mp3.arrayBuffer());

    return {
      audioBuffer,
      format: 'mp3',
    };
  } catch (error) {
    console.error("Voice synthesis error:", error);
    throw new Error(`Failed to synthesize voice: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function processVoiceMessage(audioPath: string): Promise<{
  transcript: string;
  processedText: string;
  metadata: any;
}> {
  try {
    const transcriptionResult = await transcribeAudio(audioPath);
    
    // Basic text processing - could be enhanced with NLP
    const processedText = transcriptionResult.transcript
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?-]/g, ''); // Remove special characters

    const metadata = {
      originalDuration: transcriptionResult.duration,
      language: transcriptionResult.language,
      wordCount: processedText.split(' ').length,
      processedAt: new Date().toISOString(),
    };

    return {
      transcript: transcriptionResult.transcript,
      processedText,
      metadata,
    };
  } catch (error) {
    console.error("Voice message processing error:", error);
    throw error;
  }
}

export function isAudioFile(mimetype: string): boolean {
  const audioTypes = [
    'audio/mpeg',
    'audio/wav', 
    'audio/ogg',
    'audio/webm',
    'audio/mp4',
    'audio/aac'
  ];
  return audioTypes.includes(mimetype);
}