export interface DiffBit {
    char: string;
    type: 'correct' | 'incorrect' | 'missing' | 'extra';
    expected?: string;
}

export function computeDiff(expected: string, actual: string): DiffBit[] {
    const n = expected.length;
    const m = actual.length;

    // DP table for LCS
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (expected[i - 1] === actual[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    const result: DiffBit[] = [];
    let i = n, j = m;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && expected[i - 1] === actual[j - 1]) {
            result.push({ char: expected[i - 1], type: 'correct' });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            // Extra character in actual
            result.push({ char: actual[j - 1], type: 'extra' });
            j--;
        } else if (i > 0 && (j === 0 || dp[i - 1][j] > dp[i][j - 1])) {
            // Missing character from expected
            result.push({ char: expected[i - 1], type: 'missing' });
            i--;
        } else {
            // This case shouldn't happen with LCS logic above, but for safety:
            result.push({ char: actual[j - 1], type: 'incorrect', expected: expected[i - 1] });
            i--;
            j--;
        }
    }

    return result.reverse();
}
