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
let allDrills = [
    ...Object.values(medicalDrillPacks).flat(),
    ...Object.values(legalDrillPacks).flat()
];

// Test mode: Only grab the first 1 drill that doesn't already have an audio file
allDrills = allDrills.filter(d => !fs.existsSync(path.join(OUT_DIR, `${d.id}.mp3`))).slice(0, 1);

// Helper to sanitize text for TTS (remove any weird artifacts if necessary)
const sanitizeText = (text: string) => {
    return text.trim();
};

async function generateAudioForDrill(drill: any): Promise<boolean> {
    const filename = `${drill.id}.mp3`;
    const filepath = path.join(OUT_DIR, filename);

    if (fs.existsSync(filepath)) {
        console.log(`Skipping ${drill.id} (already exists)`);
        return true;
    }

    const textToRead = sanitizeText(drill.content || drill.passage);

    if (!textToRead) {
        console.log(`Skipping ${drill.id} (no text found)`);
        return true;
    }

    console.log(`Generating audio for ${drill.id}...`);

    let retries = 0;
    const MAX_RETRIES = 3;

    while (retries < MAX_RETRIES) {
        try {
            const specialty = drill.specialty || 'medicine';
            const systemInstruction = `Style Instructions: "Generate a unique, realistic medical dictation in the specialty of ${specialty}. Ensure no repeated cases. Vary patient demographics and conditions. Maintain authentic structure and professional terminology. Keep it natural, not textbook-like."
            
Only dictate the text provided using the authentic tone and style described above. Do not add introductions or modify the test text.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro-preview-tts',
                contents: textToRead,
                config: {
                    systemInstruction,
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Zephyr', // Voice requested by user
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
                return true;
            } else {
                console.error(`❌ Failed to extract audio data for ${drill.id} (No inlineData found)`);
                console.log(JSON.stringify(response, null, 2));
                return false;
            }

        } catch (error: any) {
            const errorMsg = error.message || String(error);
            console.error(`❌ Error generating audio for ${drill.id}:`, errorMsg);

            if (errorMsg.includes('429') || errorMsg.includes('QUOTA') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
                const match = errorMsg.match(/Please retry in ([\d\.]+)s/);
                let waitSeconds = 60; // default 1 minute
                if (match) {
                    waitSeconds = parseFloat(match[1]) + 2; // Add 2s buffer
                }

                // If asking us to wait > 15 minutes, it's likely a daily quota limit
                if (waitSeconds > 900) {
                    console.error("⛔ Daily quota limit likely exceeded (long wait time). Aborting script to prevent API spam.");
                    process.exit(1);
                }

                console.log(`⏳ Rate limited. Waiting ${waitSeconds.toFixed(1)}s before retry... (Attempt ${retries + 1}/${MAX_RETRIES})`);
                await new Promise(res => setTimeout(res, waitSeconds * 1000));
                retries++;
            } else if (errorMsg.includes('400') || errorMsg.includes('404')) {
                console.error("⛔ Fatal API Error (Model or Modality not supported). Aborting script.");
                process.exit(1);
            } else {
                console.log(`⏳ Unknown error. Waiting 10s before retry... (Attempt ${retries + 1}/${MAX_RETRIES})`);
                await new Promise(res => setTimeout(res, 10000));
                retries++;
            }
        }
    }

    console.error(`❌ Failed to generate audio for ${drill.id} after ${MAX_RETRIES} attempts.`);
    return false;
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
