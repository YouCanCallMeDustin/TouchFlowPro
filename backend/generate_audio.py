import os
import asyncio
import edge_tts

TXT_FILE = "../dictation_scripts.txt"
OUTPUT_DIR = "../frontend/public/audio/drills"
# Using Christopher for Medical and Andrew for Legal to give them distinct voices
MED_VOICE = "en-US-ChristopherNeural"
LEG_VOICE = "en-US-AndrewNeural"

async def generate_audio(text, output_file, voice):
    # Remove quotes from the start and end of the exact text to record
    clean_text = text.strip().strip('"')
    if not clean_text:
        return True
    
    communicate = edge_tts.Communicate(clean_text, voice)
    try:
        await communicate.save(output_file)
        return True
    except Exception as e:
        print(f"Failed to generate {output_file}: {e}")
        return False

async def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
    if not os.path.exists(TXT_FILE):
        print(f"Could not find {TXT_FILE}")
        return
        
    with open(TXT_FILE, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Split by the separator used in the file
    sections = [s for s in content.split("--------------------------------------") if s.strip()]
    
    processed_count = 0
    skipped_count = 0
    
    print(f"Found {len(sections)} sections in the text file.")
    
    for section in sections:
        if "DICTATION SCRIPTS" in section:
            continue
            
        lines = [line.strip() for line in section.strip().split("\n") if line.strip()]
        
        filename = ""
        text_to_record = []
        is_text_section = False
        
        for line in lines:
            if line.startswith("Required Filename:"):
                filename = line.replace("Required Filename:", "").strip()
            elif line.startswith("Text to Record:"):
                is_text_section = True
            elif is_text_section:
                text_to_record.append(line)
                
        if filename and text_to_record:
            full_text = " ".join(text_to_record)
            output_path = os.path.join(OUTPUT_DIR, filename)
            
            # Use different voice depending on the prefix
            voice = MED_VOICE if filename.startswith("med_") else LEG_VOICE
            
            # Skip if already exists
            if os.path.exists(output_path):
                print(f"Skipping {filename} (already exists)")
                skipped_count += 1
                continue
                
            print(f"Generating {filename}...", end=" ", flush=True)
            success = await generate_audio(full_text, output_path, voice)
            
            if success:
                print("Done ✓")
                processed_count += 1
            else:
                print("Failed ✗")
                
            # Small delay to keep the free API happy
            await asyncio.sleep(0.5)

    print(f"\nCompleted! Generated: {processed_count}, Skipped: {skipped_count}")

if __name__ == "__main__":
    asyncio.run(main())
