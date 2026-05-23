import { useState, useEffect } from 'react'
import './App.css'

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

const STORAGE_KEY = 'text2shop-items'

function parseText(input: string): string[] {
  const lines = input
    .split(/[\n\r]+/)
    .map(line => line.trim())
    .filter(line => line.length > 0)

  const items: string[] = []

  for (const line of lines) {
    // Remove common list prefixes: numbers, bullets, dashes, asterisks
    let cleaned = line
      .replace(/^[\d]+[.):\-]\s*/, '') // "1. ", "1) ", "1- ", "1: "
      .replace(/^[-*•●○◦▪▸►]\s*/, '') // "- ", "* ", "• ", etc.
      .replace(/^\[\s*[xX]?\s*\]\s*/, '') // "[ ] ", "[x] "
      .trim()

    if (!cleaned) continue

    // Check if this line contains comma-separated items
    if (cleaned.includes(',') && !cleaned.match(/^\d+[xX]?\s/)) {
      const subItems = cleaned.split(',').map(s => s.trim()).filter(s => s.length > 0)
      if (subItems.length > 1) {
        items.push(...subItems)
        continue
      }
    }

    items.push(cleaned)
  }

  // Remove duplicates (case-insensitive) while preserving order
  const seen = new Set<string>()
  return items.filter(item => {
    const lower = item.toLowerCase()
    if (seen.has(lower)) return false
    seen.add(lower)
    return true
  })
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function App() {
  const [inputText, setInputText] = useState('')
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  })
  const [showInput, setShowInput] = useState(true)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const handleParse = () => {
    if (!inputText.trim()) return

    const parsed = parseText(inputText)
    const newItems: ChecklistItem[] = parsed.map(text => ({
      id: generateId(),
      text,
      checked: false,
    }))

    setItems(prev => [...prev, ...newItems])
    setInputText('')
    setShowInput(false)
  }

  const toggleItem = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const [confirmAction, setConfirmAction] = useState<'clearChecked' | 'clearAll' | null>(null)

  const clearChecked = () => {
    setConfirmAction('clearChecked')
  }

  const clearAll = () => {
    setConfirmAction('clearAll')
  }

  const handleConfirm = () => {
    if (confirmAction === 'clearChecked') {
      setItems(prev => prev.filter(item => !item.checked))
    } else if (confirmAction === 'clearAll') {
      setItems([])
      setShowInput(true)
    }
    setConfirmAction(null)
  }

  const handleCancel = () => {
    setConfirmAction(null)
  }

  const checkedCount = items.filter(i => i.checked).length
  const totalCount = items.length

  return (
    <div className="app">
      <header className="header">
        <h1>Text2Shop</h1>
        {totalCount > 0 && (
          <span className="counter">{checkedCount}/{totalCount}</span>
        )}
      </header>

      <main className="main">
        {showInput || items.length === 0 ? (
          <div className="input-section">
            <textarea
              className="text-input"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste your shopping list here...

Examples:
1. Milk
2. Bread
3. Eggs

or

Milk, bread, eggs, butter

or

- Apples
- Bananas
- Oranges"
              autoFocus
            />
            <div className="input-actions">
              <button
                className="btn btn-primary"
                onClick={handleParse}
                disabled={!inputText.trim()}
              >
                Add to Checklist
              </button>
              {items.length > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowInput(false)}
                >
                  Back to List
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="checklist-section">
            <ul className="checklist">
              {items.map(item => (
                <li
                  key={item.id}
                  className={`checklist-item ${item.checked ? 'checked' : ''}`}
                >
                  <label className="item-label">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                    />
                    <span className="checkmark"></span>
                    <span className="item-text">{item.text}</span>
                  </label>
                  <button
                    className="btn-remove"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.text}`}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>

            <div className="list-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowInput(true)}
              >
                Add More
              </button>
              {checkedCount > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={clearChecked}
                >
                  Clear Checked ({checkedCount})
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={clearAll}
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </main>

      {confirmAction && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal-message">
              {confirmAction === 'clearChecked'
                ? `Remove ${checkedCount} checked item${checkedCount !== 1 ? 's' : ''}?`
                : `Remove all ${totalCount} item${totalCount !== 1 ? 's' : ''}?`
              }
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirm}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
