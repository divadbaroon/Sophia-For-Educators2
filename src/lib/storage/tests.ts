export type SavedTest = {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO timestamp
};

const KEY = "elevenlabs:saved-tests";
const LAST_ID_KEY = "elevenlabs:last-created-test-id";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read(): SavedTest[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function write(tests: SavedTest[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(KEY, JSON.stringify(tests));
}

export function loadSavedTests(): SavedTest[] {
  return read();
}

export function addSavedTest(test: SavedTest): SavedTest[] {
  const existing = read();
  const deduped = existing.filter(t => t.id !== test.id);
  const updated = [test, ...deduped]; // newest first
  write(updated);
  return updated;
}

export function removeSavedTest(id: string): SavedTest[] {
  const updated = read().filter(t => t.id !== id);
  write(updated);
  return updated;
}

export function clearSavedTests() {
  if (!canUseStorage()) return;
  localStorage.removeItem(KEY);
}

export function setLastCreatedTestId(id: string) {
  if (!canUseStorage()) return;
  localStorage.setItem(LAST_ID_KEY, id);
}

export function getLastCreatedTestId(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(LAST_ID_KEY);
}
