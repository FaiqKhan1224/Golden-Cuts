/**
 * Lightweight natural-language date/time-preference parser for the AI
 * Assistant's rule-based fallback mode (used automatically when no
 * ANTHROPIC_API_KEY is configured). Converts phrases like "tomorrow",
 * "this Saturday", "next week", "after 6pm" into structured data that
 * is then checked against REAL availability via utils/availability.js.
 */

const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat'];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function parseDate(text) {
  const t = text.toLowerCase();
  const today = todayStr();

  if (/\btoday\b/.test(t)) return today;
  if (/\btomorrow\b/.test(t)) return addDays(today, 1);

  for (let i = 0; i < DAY_KEYS.length; i++) {
    const names = {
      sun: 'sunday', mon: 'monday', tue: 'tuesday', wed: 'wednesday',
      thu: 'thursday', fri: 'friday', sat: 'saturday',
    };
    const name = names[DAY_KEYS[i]];
    if (t.includes(name)) {
      const todayIdx = new Date(`${today}T12:00:00Z`).getUTCDay();
      let diff = i - todayIdx;
      if (diff <= 0) diff += 7; // next occurrence
      if (t.includes('next ' + name) && diff < 7) diff += 7;
      return addDays(today, diff);
    }
  }

  // explicit YYYY-MM-DD
  const iso = t.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];

  return null;
}

function parseRange(text) {
  const t = text.toLowerCase();
  const today = todayStr();
  if (t.includes('this week')) return { start: today, end: addDays(today, 7) };
  if (t.includes('next week')) return { start: addDays(today, 7), end: addDays(today, 14) };
  if (t.includes('this weekend')) {
    const todayIdx = new Date(`${today}T12:00:00Z`).getUTCDay();
    let diffToSat = (6 - todayIdx + 7) % 7;
    const sat = addDays(today, diffToSat);
    return { start: sat, end: addDays(sat, 2) };
  }
  return null;
}

function parseTimePreference(text) {
  const t = text.toLowerCase();

  // explicit time like "7 pm", "6:30pm", "19:00"
  const m = t.match(/(\d{1,2})(:(\d{2}))?\s*(am|pm)?/);
  if (m && (m[4] || t.includes(':'))) {
    let hour = parseInt(m[1], 10);
    const min = m[3] ? parseInt(m[3], 10) : 0;
    if (m[4] === 'pm' && hour < 12) hour += 12;
    if (m[4] === 'am' && hour === 12) hour = 0;
    if (hour >= 0 && hour <= 23) {
      return { type: 'exact', hhmm: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}` };
    }
  }

  const afterMatch = t.match(/after\s+(\d{1,2})\s*(am|pm)?/);
  if (afterMatch) {
    let hour = parseInt(afterMatch[1], 10);
    if (afterMatch[2] === 'pm' && hour < 12) hour += 12;
    return { type: 'after', hhmm: `${String(hour).padStart(2, '0')}:00` };
  }
  const beforeMatch = t.match(/before\s+(\d{1,2})\s*(am|pm)?/);
  if (beforeMatch) {
    let hour = parseInt(beforeMatch[1], 10);
    if (beforeMatch[2] === 'pm' && hour < 12) hour += 12;
    return { type: 'before', hhmm: `${String(hour).padStart(2, '0')}:00` };
  }

  if (t.includes('morning')) return { type: 'range', from: '09:00', to: '12:00' };
  if (t.includes('afternoon')) return { type: 'range', from: '12:00', to: '17:00' };
  if (t.includes('evening') || t.includes('after work')) return { type: 'range', from: '17:00', to: '23:30' };
  if (t.includes('earliest')) return { type: 'earliest' };
  if (t.includes('latest')) return { type: 'latest' };

  return null;
}

module.exports = { parseDate, parseRange, parseTimePreference, addDays, todayStr };
