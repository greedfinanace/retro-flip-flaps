export const BOARD_COLUMNS = 22;
export const BOARD_ROWS = 4;
export const BOARD_SIZE = BOARD_COLUMNS * BOARD_ROWS;
export const TEXT_ROWS = BOARD_ROWS - 1;
export const CUSTOM_MESSAGE_CHAR_LIMIT = BOARD_COLUMNS * TEXT_ROWS;

export const COLOR_BLOCKS = {
  '[GRN]': '#34ff6a',
  '[ORG]': '#f66211',
  '[BLU]': '#2f8dff',
  '[PUR]': '#963cff',
  '[RED]': '#ff4343',
  '[YLW]': '#f5b91f',
  '[PNK]': '#ff4f9f',
} as const;

export type ColorBlockCode = keyof typeof COLOR_BLOCKS;
export type DisplayToken = string;
export type QuoteSpec = {
  label: string;
  lines: [string, string, string];
  accent: ColorBlockCode;
  shuffleBlocks: readonly ColorBlockCode[];
};

const COLOR_BLOCK_CODES = Object.keys(COLOR_BLOCKS) as ColorBlockCode[];
const GLYPH_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?-.,: '.split('');
const CUSTOM_SHUFFLE_BLOCKS = ['[BLU]', '[GRN]', '[ORG]', '[PUR]', '[PNK]'] as const;

type WrapResult = {
  cost: number;
  breakpoints: number[];
};

export const EMPTY_TOKEN = ' ';
export const EMPTY_BOARD = Array.from({ length: BOARD_SIZE }, () => EMPTY_TOKEN);
export const QUOTES: QuoteSpec[] = [
  {
    label: 'GOD IS IN THE DETAILS. - LUDWIG MIES',
    lines: ['GOD IS IN', 'THE DETAILS.', '- LUDWIG MIES'],
    accent: '[GRN]',
    shuffleBlocks: ['[GRN]', '[BLU]'],
  },
  {
    label: 'STAY HUNGRY STAY FOOLISH - STEVE JOBS',
    lines: ['STAY HUNGRY', 'STAY FOOLISH', '- STEVE JOBS'],
    accent: '[ORG]',
    shuffleBlocks: ['[RED]', '[PNK]', '[ORG]', '[YLW]'],
  },
  {
    label: 'GOOD DESIGN IS GOOD BUSINESS - THOMAS WATSON',
    lines: ['GOOD DESIGN IS', 'GOOD BUSINESS', '- THOMAS WATSON'],
    accent: '[PUR]',
    shuffleBlocks: ['[PUR]', '[BLU]', '[PNK]'],
  },
] as const;

export function isColorBlock(token: DisplayToken): token is ColorBlockCode {
  return token in COLOR_BLOCKS;
}

function normalizeWords(text: string, columns: number): string[] {
  const compact = text.toUpperCase().replace(/\s+/g, ' ').trim();

  if (!compact) {
    return [];
  }

  return compact.split(' ').flatMap((word) => {
    if (word.length <= columns) {
      return [word];
    }

    const chunks: string[] = [];

    for (let index = 0; index < word.length; index += columns) {
      chunks.push(word.slice(index, index + columns));
    }

    return chunks;
  });
}

export function wrapTextBalanced(
  text: string,
  columns = BOARD_COLUMNS,
  maxLines = BOARD_ROWS,
): string[] {
  const words = normalizeWords(text, columns);

  if (!words.length) {
    return [];
  }

  const memo = new Map<string, WrapResult>();

  const solve = (wordIndex: number, linesRemaining: number): WrapResult => {
    if (wordIndex >= words.length) {
      return { cost: 0, breakpoints: [] };
    }

    if (linesRemaining <= 0) {
      return { cost: Number.POSITIVE_INFINITY, breakpoints: [] };
    }

    const cacheKey = `${wordIndex}:${linesRemaining}`;
    const cached = memo.get(cacheKey);

    if (cached) {
      return cached;
    }

    let line = '';
    let best: WrapResult = {
      cost: Number.POSITIVE_INFINITY,
      breakpoints: [],
    };

    for (let cursor = wordIndex; cursor < words.length; cursor += 1) {
      const candidate = line ? `${line} ${words[cursor]}` : words[cursor];

      if (candidate.length > columns) {
        break;
      }

      const next = solve(cursor + 1, linesRemaining - 1);

      if (next.cost === Number.POSITIVE_INFINITY) {
        line = candidate;
        continue;
      }

      const slack = columns - candidate.length;
      const linePenalty = cursor === words.length - 1 ? slack * slack * 0.15 : slack * slack;
      const totalCost = linePenalty + next.cost;

      if (totalCost < best.cost) {
        best = {
          cost: totalCost,
          breakpoints: [cursor + 1, ...next.breakpoints],
        };
      }

      line = candidate;
    }

    memo.set(cacheKey, best);
    return best;
  };

  const solution = solve(0, maxLines);

  if (solution.cost === Number.POSITIVE_INFINITY) {
    return words.slice(0, maxLines).map((word) => word.slice(0, columns));
  }

  const lines: string[] = [];
  let start = 0;

  for (const breakpoint of solution.breakpoints) {
    lines.push(words.slice(start, breakpoint).join(' '));
    start = breakpoint;
  }

  return lines.slice(0, maxLines);
}

export function centerWrappedLines(
  lines: string[],
  columns = BOARD_COLUMNS,
  rows = BOARD_ROWS,
): DisplayToken[] {
  const board = Array.from({ length: rows * columns }, () => EMPTY_TOKEN);
  const clippedLines = lines.slice(0, rows);
  const verticalOffset = Math.max(0, Math.floor((rows - clippedLines.length) / 2));

  clippedLines.forEach((line, lineIndex) => {
    const printableLine = line.slice(0, columns);
    const horizontalOffset = Math.max(0, Math.floor((columns - printableLine.length) / 2));

    printableLine.split('').forEach((character, characterIndex) => {
      const position = (verticalOffset + lineIndex) * columns + horizontalOffset + characterIndex;
      board[position] = character;
    });
  });

  return board;
}

export function createCustomQuoteSpec(text: string): QuoteSpec {
  const normalized = text.replace(/\s+/g, ' ').trim().slice(0, CUSTOM_MESSAGE_CHAR_LIMIT);
  const wrapped = wrapTextBalanced(normalized, BOARD_COLUMNS, TEXT_ROWS).slice(0, TEXT_ROWS);
  const lines: [string, string, string] = [
    wrapped[0] ?? '',
    wrapped[1] ?? '',
    wrapped[2] ?? '',
  ];

  return {
    label: normalized || 'CUSTOM MESSAGE',
    lines,
    accent: '[BLU]',
    shuffleBlocks: CUSTOM_SHUFFLE_BLOCKS,
  };
}

export function formatQuoteForBoard(quote: QuoteSpec): DisplayToken[] {
  const board = Array.from({ length: BOARD_SIZE }, () => EMPTY_TOKEN);

  board[0] = quote.accent;
  board[BOARD_COLUMNS - 1] = quote.accent;

  quote.lines.forEach((line, lineIndex) => {
    const printableLine = line.slice(0, BOARD_COLUMNS);
    const horizontalOffset = Math.max(0, Math.floor((BOARD_COLUMNS - printableLine.length) / 2));
    const rowOffset = (lineIndex + 1) * BOARD_COLUMNS;

    printableLine.split('').forEach((character, characterIndex) => {
      board[rowOffset + horizontalOffset + characterIndex] = character;
    });
  });

  return board;
}

export function parseDisplayMarkup(input: string): DisplayToken[] {
  const normalized = input.toUpperCase();
  const tokens: DisplayToken[] = [];
  let cursor = 0;

  while (cursor < normalized.length) {
    const matchedBlock = COLOR_BLOCK_CODES.find((token) => normalized.startsWith(token, cursor));

    if (matchedBlock) {
      tokens.push(matchedBlock);
      cursor += matchedBlock.length;
      continue;
    }

    tokens.push(normalized[cursor]);
    cursor += 1;
  }

  return tokens;
}

export function pickRandomShuffleToken(
  exclusions: DisplayToken[] = [],
  blockPool: readonly ColorBlockCode[] = COLOR_BLOCK_CODES,
): DisplayToken {
  const exclusionSet = new Set(exclusions);
  const activeBlockPool = blockPool.length ? blockPool : COLOR_BLOCK_CODES;

  while (true) {
    const useColorBlock = Math.random() < 0.1;
    const token = useColorBlock
      ? activeBlockPool[Math.floor(Math.random() * activeBlockPool.length)]
      : GLYPH_POOL[Math.floor(Math.random() * GLYPH_POOL.length)];

    if (!exclusionSet.has(token)) {
      return token;
    }
  }
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
