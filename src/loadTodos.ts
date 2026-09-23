export type Todo = { id: string; text: string; completed: boolean };

export const storageKey = "daily-todos-v1";

export function loadTodos(): Todo[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(saved)
      ? saved.filter(
          (item): item is Todo =>
            item !== null &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.text === "string" &&
            typeof item.completed === "boolean",
        )
      : [];
  } catch {
    return [];
  }
}
