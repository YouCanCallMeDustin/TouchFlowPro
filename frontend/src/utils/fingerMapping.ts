export type Finger =
    | 'left_pinky' | 'left_ring' | 'left_middle' | 'left_index'
    | 'right_index' | 'right_middle' | 'right_ring' | 'right_pinky'
    | 'thumb';

export const FINGER_MAP: Record<string, Finger> = {
    // Row 1 (Numbers)
    '1': 'left_pinky', '2': 'left_ring', '3': 'left_middle', '4': 'left_index', '5': 'left_index',
    '6': 'right_index', '7': 'right_index', '8': 'right_middle', '9': 'right_ring', '0': 'right_pinky',
    '-': 'right_pinky', '=': 'right_pinky',

    // Row 2 (Top)
    'q': 'left_pinky', 'w': 'left_ring', 'e': 'left_middle', 'r': 'left_index', 't': 'left_index',
    'y': 'right_index', 'u': 'right_index', 'i': 'right_middle', 'o': 'right_ring', 'p': 'right_pinky',
    '[': 'right_pinky', ']': 'right_pinky', '\\': 'right_pinky',

    // Row 3 (Home)
    'a': 'left_pinky', 's': 'left_ring', 'd': 'left_middle', 'f': 'left_index', 'g': 'left_index',
    'h': 'right_index', 'j': 'right_index', 'k': 'right_middle', 'l': 'right_ring', ';': 'right_pinky',
    '\'': 'right_pinky',

    // Row 4 (Bottom)
    'z': 'left_pinky', 'x': 'left_ring', 'c': 'left_middle', 'v': 'left_index', 'b': 'left_index',
    'n': 'right_index', 'm': 'right_index', ',': 'right_middle', '.': 'right_ring', '/': 'right_pinky',

    // Modifiers & Big Keys
    ' ': 'thumb',
    'Enter': 'right_pinky',
    'Backspace': 'right_pinky',
    'Shift': 'left_pinky', // Simplified: usually left shift is left pinky, right shift is right pinky
    'Tab': 'left_pinky',
    'CapsLock': 'left_pinky',
};

// Helper to get finger for any key string
export const getFingerForKey = (key: string): Finger => {
    // 1. Direct match (for Space, Shift, etc.)
    if (FINGER_MAP[key]) return FINGER_MAP[key];

    // 2. Case-insensitive match for letters
    const lowerKey = key.toLowerCase();
    if (FINGER_MAP[lowerKey]) return FINGER_MAP[lowerKey];

    // 3. Special handled symbols that might be passed as their shifted versions
    const symbolMap: Record<string, string> = {
        '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
        '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
        '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\',
        ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
    };

    if (symbolMap[key]) return FINGER_MAP[symbolMap[key]];

    return 'left_pinky'; // Fallback
};

export const getFingerName = (finger: Finger): string => {
    return finger.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
