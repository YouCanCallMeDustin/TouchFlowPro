const { TypingEngine } = require('./shared/typingEngine');
// Since TypingEngine is a class with static methods, we can just require it if compiled,
// but wait, it's TS. I'll use ts-node properly.
