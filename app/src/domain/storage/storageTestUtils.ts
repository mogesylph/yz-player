import type { StorageLike } from './storageTypes'

export function createMemoryStorage(): StorageLike & { values: Map<string, string> } {
  const values = new Map<string, string>()

  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => {
      values.delete(key)
    }
  }
}
