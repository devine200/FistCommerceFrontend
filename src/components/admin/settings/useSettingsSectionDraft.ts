import { useCallback, useState } from 'react'

export function useSettingsSectionDraft<T>(initial: T) {
  const [saved, setSaved] = useState<T>(() => structuredClone(initial))
  const [draft, setDraft] = useState<T>(() => structuredClone(initial))
  const [saving, setSaving] = useState(false)

  const cancel = useCallback(() => {
    setDraft(structuredClone(saved))
  }, [saved])

  const save = useCallback(async (onSave?: (next: T) => void | Promise<void>) => {
    setSaving(true)
    try {
      await onSave?.(draft)
      const next = structuredClone(draft)
      setSaved(next)
    } finally {
      setSaving(false)
    }
  }, [draft])

  const resetTo = useCallback((next: T) => {
    const copy = structuredClone(next)
    setSaved(copy)
    setDraft(structuredClone(copy))
  }, [])

  return {
    saved,
    draft,
    setDraft,
    saving,
    cancel,
    save,
    resetTo,
  }
}
