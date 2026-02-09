// Keyboard layout and finger assignments for proper typing technique

export const KEYBOARD_LAYOUT = {
    row1: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    row2: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
    row3: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    row4: ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
};

// Finger assignments: 0-4 = left hand, 5-9 = right hand
// 0 = left pinky, 1 = left ring, 2 = left middle, 3 = left index, 4 = left thumb
// 5 = right thumb, 6 = right index, 7 = right middle, 8 = right ring, 9 = right pinky
export const FINGER_ASSIGNMENTS: Record<string, number> = {
    // Numbers row
    '1': 0, '2': 1, '3': 2, '4': 3, '5': 3,
    '6': 6, '7': 6, '8': 7, '9': 8, '0': 9, '-': 9, '=': 9,

    // Top row (QWERTY)
    'q': 0, 'Q': 0,
    'w': 1, 'W': 1,
    'e': 2, 'E': 2,
    'r': 3, 'R': 3,
    't': 3, 'T': 3,
    'y': 6, 'Y': 6,
    'u': 6, 'U': 6,
    'i': 7, 'I': 7,
    'o': 8, 'O': 8,
    'p': 9, 'P': 9,
    '[': 9, ']': 9,

    // Home row (ASDF JKL;)
    'a': 0, 'A': 0,
    's': 1, 'S': 1,
    'd': 2, 'D': 2,
    'f': 3, 'F': 3,
    'g': 3, 'G': 3,
    'h': 6, 'H': 6,
    'j': 6, 'J': 6,
    'k': 7, 'K': 7,
    'l': 8, 'L': 8,
    ';': 9, ':': 9,
    "'": 9, '"': 9,

    // Bottom row (ZXCV BNM,.)
    'z': 0, 'Z': 0,
    'x': 1, 'X': 1,
    'c': 2, 'C': 2,
    'v': 3, 'V': 3,
    'b': 3, 'B': 3,
    'n': 6, 'N': 6,
    'm': 6, 'M': 6,
    ',': 7, '<': 7,
    '.': 8, '>': 8,
    '/': 9, '?': 9,

    // Space bar (both thumbs)
    ' ': 4,

    // Shift keys
    'Shift': 0 // Default to left shift finger for generic stats
};

// Color coding for each finger
export const FINGER_COLORS = [
    '#FF6B6B', // 0: Left pinky (red)
    '#4ECDC4', // 1: Left ring (teal)
    '#45B7D1', // 2: Left middle (blue)
    '#96CEB4', // 3: Left index (green)
    '#FFEAA7', // 4: Left thumb (yellow)
    '#FFEAA7', // 5: Right thumb (yellow)
    '#96CEB4', // 6: Right index (green)
    '#45B7D1', // 7: Right middle (blue)
    '#4ECDC4', // 8: Right ring (teal)
    '#FF6B6B', // 9: Right pinky (red)
];

// Finger names for display
export const FINGER_NAMES = [
    'Left Pinky',
    'Left Ring',
    'Left Middle',
    'Left Index',
    'Left Thumb',
    'Right Thumb',
    'Right Index',
    'Right Middle',
    'Right Ring',
    'Right Pinky',
];

// Get the correct finger for a given key
export function getCorrectFinger(key: string): number {
    return FINGER_ASSIGNMENTS[key] ?? 4; // Default to thumb (space) if unknown
}

// Get the color for a given finger
export function getFingerColor(finger: number): string {
    return FINGER_COLORS[finger] ?? '#CCCCCC';
}

// Get the name for a given finger
export function getFingerName(finger: number): string {
    return FINGER_NAMES[finger] ?? 'Unknown';
}
