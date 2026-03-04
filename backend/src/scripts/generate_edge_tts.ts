import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const TXT_FILE = path.join(__dirname, '../../../../dictation_scripts.txt');
const OUTPUT_DIR = path.join(__dirname, '../../../../frontend/public/audio/drills');
const VOICE = 'en-US-ChristopherNeural'; // Very clear, professional voice

async function generateWithEdgeTTS(text: string, outputPath: string) {
    // Sanitizing quotes from the text so it doesn't break the CLI
    const cleanText = text.replace(/"/g, '').replace(/'/g, '').trim();

    // Using edge-tts CLI tool
    const command = `edge-tts --voice ${VOICE} --text "${cleanText}" --write-media "${outputPath}"`;

    try {
        await execAsync(command);
        return true;
    } catch (error) {
        console.error(`Failed to generate TTS for ${outputPath}:`, error);
        return false;
    }
}

async function main() {
    console.log('Starting Edge TTS audio generation...');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    if (!fs.existsSync(TXT_FILE)) {
        console.error(`Could not find ${TXT_FILE}`);
        return;
    }

    const content = fs.readFileSync(TXT_FILE, 'utf-8');
    const sections = content.split('--------------------------------------');

    let processedCount = 0;
    let skippedCount = 0;

    for (const section of sections) {
        if (!section.trim() || section.includes('DICTATION SCRIPTS & NAMING CONVENTION')) continue;

        const lines = section.trim().split('\\n');

        let filename = '';
        let textToRecord = '';
        let isTextSection = false;

        for (const line of lines) {
            if (line.startsWith('Required Filename:')) {
                filename = line.replace('Required Filename:', '').trim();
            } else if (line.startsWith('Text to Record:')) {
                isTextSection = true;
            } else if (isTextSection && line.trim()) {
                textToRecord += line + ' ';
            }
        }

        if (filename && textToRecord) {
            const outputPath = path.join(OUTPUT_DIR, filename);

            // Skip if the file already exists so we don't regenerate everything if it stops halfway
            if (fs.existsSync(outputPath)) {
                console.log(`Skipping ${filename} (already exists)`);
                skippedCount++;
                continue;
            }

            process.stdout.write(`Generating ${filename}... `);
            const success = await generateWithEdgeTTS(textToRecord, outputPath);

            if (success) {
                console.log('Done \u2705');
                processedCount++;
            } else {
                console.log('Failed \u274C');
            }

            // Artificial small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    console.log(`\\nCompleted! Generated: ${processedCount}, Skipped: ${skippedCount}`);
}

main().catch(console.error);
