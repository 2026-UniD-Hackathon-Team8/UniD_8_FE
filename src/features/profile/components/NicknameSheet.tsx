// 닉네임 수정 바텀시트 (ST_03)
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { saveNickname, validNickname } from '../../../shared/store/guest'
import { NICKNAME_RULE_TEXT } from '../constants'
import { useUpdateNickname } from '../hooks/useUpdateNickname'
import s from '../styles/profile.module.css'

const MAX_LENGTH = 10

type Props = {
  current: string
  onClose: () => void
  onSaved: (nickname: string) => void
}

export function NicknameSheet({ current, onClose, onSaved }: Props) {
  const [value, setValue] = useState(current)
  const { update, saving, error, clearError } = useUpdateNickname()

  const valid = validNickname(value)
  const unchanged = value.trim() === current
  const message = error ? (error.errors.nickname ?? error.message) : value && !valid ? NICKNAME_RULE_TEXT : null

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, saving])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!valid || unchanged || saving) return
    const saved = await update(value)
    if (!saved) return
    saveNickname(saved)
    onSaved(saved)
    onClose()
  }

  return (
    <div
      className={s.dim}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nickname-sheet-title"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <form className={s.sheet} onSubmit={(e) => void submit(e)}>
        <div className={s.grip} aria-hidden />
        <h2 id="nickname-sheet-title" className="t-h2">
          닉네임 수정
        </h2>
        <p className="t-cap mt4">랭킹에 보이는 이름이에요. {NICKNAME_RULE_TEXT}</p>
        <div className={s.field}>
          <input
            className="inp"
            value={value}
            maxLength={MAX_LENGTH}
            autoFocus
            aria-invalid={Boolean(message)}
            aria-describedby="nickname-sheet-msg"
            onChange={(e) => {
              setValue(e.target.value)
              if (error) clearError()
            }}
          />
          <span className={s.counter}>
            {value.trim().length}/{MAX_LENGTH}
          </span>
        </div>
        <p id="nickname-sheet-msg" className={s.fieldMsg} role="alert">
          {message ?? ''}
        </p>
        <div className={s.sheetActions}>
          <button type="button" className="btn dark" onClick={onClose} disabled={saving}>
            취소
          </button>
          <button type="submit" className="btn" disabled={!valid || unchanged || saving}>
            {saving ? '저장 중…' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
