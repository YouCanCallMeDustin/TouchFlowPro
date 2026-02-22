import { GoogleGenAI } from '@google/genai';
import { medicalDrillPacks } from '@shared/tracks/medical';
import { legalDrillPacks } from '@shared/tracks/legal';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Buffer } from 'buffer';

dotenv.config();

// Ensure the API key is present
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const OUT_DIR = path.join(__dirname, '../../../frontend/public/audio/drills');

// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Combine medical and legal drills
const allDrills = [
    ...Object.values(medicalDrillPacks).flat(),
    ...Object.values(legalDrillPacks).flat()
];

// Helper to sanitize text for TTS (remove any weird artifacts if necessary)
const sanitizeText = (text: string) => {
    return text.trim();
};

async function generateAudioForDrill(drill: any) {
    const filename = `${drill.id}.mp3`;
    const filepath = path.join(OUT_DIR, filename);

    if (fs.existsSync(filepath)) {
        console.log(`Skipping ${drill.id} (already exists)`);
        return;
    }

    const textToRead = sanitizeText(drill.content || drill.passage);

    if (!textToRead) {
        console.log(`Skipping ${drill.id} (no text found)`);
        return;
    }

    console.log(`Generating audio for ${drill.id}...`);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: textToRead,
            config: {
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: 'Aoede', // Aoede, Charon, Fenrir, Kore, Puck (Aoede is a good professional voice)
                        }
                    }
                }
            }
        });

        // The Gemini generateContent response has inlineData when speechConfig is provided
        // We need to extract the base64 audio and save as mp3

        let audioData: string | undefined = undefined;
        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.includes('audio')) {
                    audioData = part.inlineData.data;
                    break;
                }
            }
        }

        if (audioData) {
            fs.writeFileSync(filepath, Buffer.from(audioData, 'base64'));
            console.log(`✅ Saved ${filename}`);
        } else {
            console.error(`❌ Failed to extract audio data for ${drill.id} (No inlineData found)`);
            console.log(JSON.stringify(response, null, 2));
        }

    } catch (error: any) {
        console.error(`❌ Error generating audio for ${drill.id}:`, error.message || error);
        // Wait longer on error (rate limit backoff)
        await new Promise(res => setTimeout(res, 5000));
    }
}

async function run() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("FATAL: GEMINI_API_KEY is missing from backend/.env");
        process.exit(1);
    }

    console.log(`Found ${allDrills.length} total drills to process...`);

    // Process sequentially to respect rate limits
    const BATCH_SIZE = 10;
    const BATCH_DELAY_MS = 5 * 60 * 1000; // 5 minutes
    const REQUEST_DELAY_MS = 6000; // 6 seconds (max 10 RPM)

    for (let i = 0; i < allDrills.length; i++) {
        if (i > 0 && i % BATCH_SIZE === 0) {
            console.log(`\n⏳ Pacing limit reached. Cooling down for 5 minutes... (${i}/${allDrills.length} complete)`);
            await new Promise(res => setTimeout(res, BATCH_DELAY_MS));
        }

        await generateAudioForDrill(allDrills[i]);

        // Add a delay between individual requests within the batch
        await new Promise(res => setTimeout(res, REQUEST_DELAY_MS));
    }

    console.log("Audio generation complete!");
}

run();
