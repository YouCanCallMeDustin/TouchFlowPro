import React from 'react';
import { Star } from 'lucide-react';

interface AggregateRatingProps {
    rating: number;
    count: number;
}

export const AggregateRating: React.FC<AggregateRatingProps> = ({ rating, count }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 border-t border-white/5 mt-16">
            <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        size={20}
                        className={s <= Math.round(rating) ? "fill-primary text-primary" : "text-white/10"}
                    />
                ))}
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-widest">
                Rating: {rating.toFixed(1)} / 5
            </p>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black opacity-40 mt-1">
                Based on {count} user reviews
            </p>
        </div>
    );
};
