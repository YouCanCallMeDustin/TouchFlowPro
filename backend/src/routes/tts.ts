import { Router, Request, Response } from 'express';
import { spawn } from 'child_process';

const router = Router();

interface VoiceMap {
    [key: string]: string;
}

const VOICE_MAP: VoiceMap = {
    christopher: 'en-US-ChristopherNeural',
    guy: 'en-US-GuyNeural',
    eric: 'en-US-EricNeural',
    roger: 'en-US-RogerNeural',
    steffan: 'en-US-SteffanNeural',
    ryan: 'en-GB-RyanNeural',
    jenny: 'en-US-JennyNeural',
    aria: 'en-US-AriaNeural',
    michelle: 'en-US-MichelleNeural',
    emma: 'en-US-EmmaMultilingualNeural',
    sonia: 'en-GB-SoniaNeural',
    natasha: 'en-AU-NatashaNeural'
};

router.get('/', (req: Request, res: Response) => {
    const { text, voice } = req.query;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text parameter is required' });
    }

    const ttsVoice = VOICE_MAP[(voice as string)?.toLowerCase()] || VOICE_MAP['christopher'];
    
    // Safety check: remove characters that could be used for shell injection
    // though spawn is generally safer than exec, we still want to be careful
    const cleanText = text.replace(/"/g, '').replace(/'/g, '').trim();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Spawn edge-tts and pipe stdout to response
    const edgeTts = spawn('edge-tts', [
        '--voice', ttsVoice,
        '--text', cleanText
    ]);

    edgeTts.stdout.pipe(res);

    edgeTts.stderr.on('data', (data) => {
        console.error(`Edge-TTS Error: ${data}`);
    });

    edgeTts.on('close', (code) => {
        if (code !== 0) {
            console.error(`Edge-TTS process exited with code ${code}`);
            if (!res.headersSent) {
                res.status(500).json({ error: 'TTS generation failed' });
            }
        }
    });

    // Handle client disconnect
    req.on('close', () => {
        edgeTts.kill();
    });
});

export default router;
