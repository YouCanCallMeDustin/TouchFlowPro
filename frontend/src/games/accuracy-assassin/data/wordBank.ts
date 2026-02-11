// ── Accuracy Assassin: Word Bank ──
// Organized by difficulty level for prompt generation

/** L1: Common short words */
export const COMMON_WORDS = [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'its', 'may', 'new', 'now', 'old', 'see', 'way', 'who', 'did',
    'let', 'say', 'she', 'too', 'use', 'run', 'big', 'set', 'try', 'ask',
    'men', 'put', 'end', 'own', 'top', 'any', 'two', 'few', 'add', 'low',
    'age', 'air', 'arm', 'art', 'bag', 'bar', 'bed', 'bit', 'box', 'boy',
    'bus', 'car', 'cat', 'cup', 'cut', 'dog', 'ear', 'eat', 'egg', 'eye',
    'far', 'fat', 'fit', 'fly', 'fun', 'gas', 'god', 'gun', 'hat', 'hit',
    'hot', 'ice', 'job', 'key', 'kid', 'lay', 'leg', 'lie', 'lip', 'list',
    'lot', 'map', 'mix', 'net', 'nor', 'oil', 'pay', 'pen', 'per', 'pin',
    'pop', 'pull', 'rain', 'red', 'rest', 'rise', 'road', 'rock', 'roll',
    'room', 'safe', 'salt', 'sand', 'save', 'seat', 'seem', 'self', 'sell',
    'ship', 'shop', 'show', 'shut', 'sign', 'sing', 'site', 'size', 'skin',
    'slip', 'slow', 'snow', 'soft', 'soil', 'some', 'song', 'sort', 'star',
    'step', 'stop', 'sure', 'swim', 'talk', 'tall', 'team', 'tell', 'test',
    'than', 'them', 'then', 'they', 'thin', 'this', 'thus', 'time', 'tiny',
    'told', 'tone', 'took', 'tool', 'tree', 'trip', 'true', 'turn', 'type',
    'unit', 'upon', 'vast', 'very', 'wait', 'wake', 'walk', 'wall', 'warm',
    'wash', 'wave', 'weak', 'wear', 'week', 'well', 'went', 'were', 'west',
    'what', 'when', 'whom', 'wide', 'wife', 'wild', 'will', 'wind', 'wine',
] as const;

/** L2: Longer words (6+ chars) */
export const LONGER_WORDS = [
    'about', 'above', 'across', 'action', 'actually', 'after', 'against',
    'almost', 'already', 'always', 'among', 'animal', 'another', 'answer',
    'appear', 'around', 'attack', 'before', 'behind', 'believe', 'belong',
    'beside', 'better', 'between', 'beyond', 'border', 'bottle', 'bottom',
    'branch', 'bridge', 'broken', 'brother', 'budget', 'building', 'burden',
    'camera', 'cancer', 'carbon', 'career', 'center', 'central', 'century',
    'chairman', 'challenge', 'champion', 'chance', 'change', 'chapter',
    'charge', 'chicken', 'choice', 'church', 'circle', 'citizen', 'climate',
    'coffee', 'collect', 'college', 'column', 'common', 'company', 'computer',
    'concern', 'conduct', 'confirm', 'connect', 'consider', 'contain',
    'control', 'corner', 'correct', 'country', 'couple', 'course', 'cousin',
    'create', 'credit', 'culture', 'current', 'customer', 'danger', 'daughter',
    'debate', 'decide', 'defense', 'define', 'degree', 'demand', 'depend',
    'describe', 'design', 'detail', 'develop', 'device', 'differ', 'dinner',
    'direct', 'doctor', 'domain', 'double', 'driven', 'during', 'easily',
    'economy', 'education', 'effect', 'effort', 'either', 'election', 'emerge',
    'employ', 'enable', 'energy', 'engine', 'enough', 'entire', 'escape',
    'evening', 'everyone', 'examine', 'example', 'except', 'exchange',
    'execute', 'expect', 'explain', 'express', 'extend', 'extreme', 'fabric',
    'factor', 'family', 'father', 'feature', 'female', 'figure', 'filter',
    'finger', 'flight', 'flower', 'follow', 'foreign', 'forest', 'forget',
    'formal', 'former', 'forward', 'freedom', 'friend', 'future', 'garden',
    'gather', 'gender', 'general', 'global', 'golden', 'ground', 'growth',
    'guitar', 'handle', 'happen', 'harbor', 'health', 'heaven', 'height',
    'helping', 'herself', 'hidden', 'highly', 'history', 'honest', 'horror',
] as const;

/** Punctuation marks for L4 */
export const PUNCTUATION = ['.', ',', '!', '?', ';', ':', "'", '"', '-', '(', ')'] as const;

/** Number strings for L5 */
export const NUMBER_STRINGS = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '10', '25', '42', '99', '100', '256', '512', '1024',
    '3.14', '2.71', '0.5', '7.77', '13', '21', '34', '55',
] as const;

/** Symbol characters for L6 */
export const SYMBOL_CHARS = [
    '@', '#', '$', '%', '^', '&', '*', '+', '=', '~',
    '<', '>', '/', '\\', '|', '{', '}', '[', ']', '_',
] as const;
