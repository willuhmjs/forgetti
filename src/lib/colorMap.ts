const THEME_COLORS = ['#f97316', '#ef4444', '#22c55e', '#3b82f6'] as const;

export type ThemeColor = (typeof THEME_COLORS)[number];

export default THEME_COLORS;
