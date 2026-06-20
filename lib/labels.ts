export const RECORD_TYPES = [
  { value: "note", label: "速记" },
  { value: "decision", label: "决策" },
  { value: "pitfall", label: "踩坑" },
  { value: "comm", label: "沟通" },
  { value: "review", label: "复盘" },
] as const;

export function recordTypeLabel(v: string) {
  return RECORD_TYPES.find((t) => t.value === v)?.label ?? v;
}

export const REVIEW_PERIODS = [
  { value: "day", label: "每日", days: 1 },
  { value: "week", label: "每周", days: 7 },
  { value: "month", label: "每月", days: 30 },
  { value: "project", label: "项目", days: 90 },
] as const;

export function reviewPeriodLabel(v: string) {
  return REVIEW_PERIODS.find((p) => p.value === v)?.label ?? v;
}

export const INSPIRATION_STATUS = [
  { value: "new", label: "新捕捉" },
  { value: "incubating", label: "孵化中" },
  { value: "converted", label: "已转化" },
  { value: "archived", label: "存档" },
] as const;

export function inspirationStatusLabel(v: string) {
  return INSPIRATION_STATUS.find((s) => s.value === v)?.label ?? v;
}

// 心情用 0..4 表示（由 MoodFace 渲染成纯色图标），存为字符串 "0".."4"
export const MOOD_LEVELS = [0, 1, 2, 3, 4] as const;
