import React from 'react';
import { motion } from 'framer-motion';
import TypingTest from './TypingTest';
import { PlacementEngine, type PlacementResult } from '@shared/placement';
import type { TypingMetrics, KeystrokeEvent } from '@shared/types';
import { Card } from './ui/Card';

interface SkillAssessmentProps {
    onComplete: (metrics: TypingMetrics, result: PlacementResult) => void;
}

const ASSESSMENT_TEXT = "High-performance typing requires more than just speed; it demands absolute precision and rhythmic consistency. This assessment evaluates your baseline operational status across complex linguistic patterns. Maintain focus, minimize lateral hand movement, and prioritize accuracy to achieve an elite tier placement. Your results will determine your starting curriculum path within the TouchFlow Pro ecosystem.";

export const SkillAssessment: React.FC<SkillAssessmentProps> = ({ onComplete }) => {
    const handleTestComplete = (metrics: TypingMetrics, _keystrokes: KeystrokeEvent[]) => {
        const result = PlacementEngine.calculatePlacement(metrics);
        onComplete(metrics, result);
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Initial Calibration</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-text-main mb-6 uppercase tracking-tighter">
                    Skill <span className="text-primary">Assessment.</span>
                </h1>
                <p className="text-text-muted max-w-2xl mx-auto text-sm leading-relaxed uppercase tracking-widest opacity-60">
                    Establishing baseline performance density for personalized curriculum optimization.
                </p>
            </motion.div>

            <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse opacity-50" />

                <TypingTest
                    text={ASSESSMENT_TEXT}
                    onComplete={handleTestComplete}
                    showLiveMetrics={true}
                    showVirtualKeyboard={false}
                />
            </Card>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 text-center"
            >
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-30">
                    Operational Protocol: No Sudden Death during Calibration
                </p>
            </motion.div>
        </div>
    );
};
