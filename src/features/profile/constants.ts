// 닉네임 규칙 (백엔드 UpdateNicknameRequest와 같게 둔다)
export const NICKNAME_MIN_LENGTH = 2
export const NICKNAME_MAX_LENGTH = 10
export const NICKNAME_RULE_TEXT = '2~10자로 입력해주세요.'

/** 서버에 보내기 전에 검사한다. 문제없으면 null */
export function validateNickname(nickname: string): string | null {
  const length = nickname.trim().length
  return length < NICKNAME_MIN_LENGTH || length > NICKNAME_MAX_LENGTH ? NICKNAME_RULE_TEXT : null
}
