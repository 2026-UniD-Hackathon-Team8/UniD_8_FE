// 결과 공유: navigator.share가 있으면 공유 창을, 없으면 문구를 클립보드에 복사한다
export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed'

export const shareText = (typeName: string) => `나는 ${typeName}! 다믿어?에서 확인해 보세요`

export async function shareResult(typeName: string): Promise<ShareOutcome> {
  const text = shareText(typeName)

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: '다믿어?', text })
      return 'shared'
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
