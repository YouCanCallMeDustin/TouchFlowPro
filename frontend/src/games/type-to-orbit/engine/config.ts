export const RACE_CONFIG = {
    TRACK_LENGTH_METERS: 1000, // Virtual distance

    // Visual scaling
    FPS: 60,

    // Bot settings
    BOT_UPDATE_INTERVAL_MS: 50, // How often bots think
    BOT_WPM_VARIANCE: 0.15, // +/- 15% speed fluctuation

    // Player settings
    AFTERBURNER_BOOST_CHARS: 5, // Words skipped or chars boosted? Let's say word skip for now.

    // Difficulty presets (WPM)
    DIFFICULTY: {
        EASY: { min: 30, max: 45 },
        MEDIUM: { min: 50, max: 75 },
        HARD: { min: 80, max: 110 },
        INSANE: { min: 120, max: 160 },
    }
};

export const SPACE_QUOTES = [
    "The rocket will be an aerodynamically clean structure, thrust by a jet of exploding gas.",
    "Space is big. You just won't believe how vastly, hugely, mind-bogglingly big it is.",
    "That's one small step for man, one giant leap for mankind.",
    "The Earth is the cradle of humanity, but mankind cannot stay in the cradle forever.",
    "Across the sea of space, the stars are other suns.",
    "We choose to go to the moon not because it is easy, but because it is hard.",
    "Orbiting Earth in the spaceship, I saw how beautiful our planet is. People, let us preserve and increase this beauty, not destroy it!",
    "To confine our attention to terrestrial matters would be to limit the human spirit.",
    "The universe is under no obligation to make sense to you.",
    "Somewhere, something incredible is waiting to be known.",
];
