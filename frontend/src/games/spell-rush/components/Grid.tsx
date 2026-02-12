import React, { useEffect } from 'react';
import { useGameStore } from '../state/store';
import { Tile } from './Tile';
import { GRID_SIZE } from '../data/constants';

export const Grid: React.FC = () => {
    const { grid, selectedTiles, startDrag, continueDrag, endDrag, hintPath } = useGameStore();

    // Global mouse up handler to end drag even if mouse leaves tiles
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            // Only end drag if we have selection?
            // Actually endDrag in logic submits.
            // We should check if we are dragging.
            if (useGameStore.getState().selectedTiles.length > 0) {
                endDrag();
            }
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [endDrag]);

    if (!grid || grid.length === 0) return <div className="text-white">Loading Grid...</div>;

    return (
        <div
            className="grid gap-2 bg-slate-800/50 p-4 rounded-xl shadow-2xl backdrop-blur-sm"
            style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
            }}
            onMouseLeave={endDrag} // End drag if leaving the grid area? Optional.
        >
            {grid.map((row) => (
                row.map((tile) => (
                    <Tile
                        key={tile.id}
                        tile={tile}
                        isSelected={selectedTiles.some(t => t.id === tile.id)}
                        isHint={hintPath?.some(t => t.id === tile.id)}
                        onMouseDown={startDrag}
                        onMouseEnter={(t) => {
                            if (selectedTiles.length > 0) {
                                continueDrag(t);
                            }
                        }}
                    />
                ))
            ))}
        </div>
    );
};
