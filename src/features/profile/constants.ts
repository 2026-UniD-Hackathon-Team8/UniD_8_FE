// 닉네임 규칙은 shared/store/guest.ts의 validNickname(2~10자)을 따른다
import { validNickname } from '../../shared/store/guest'

export const NICKNAME_RULE_TEXT = '2~10자로 입력해주세요.'

/** 서버에 보내기 전에 검사한다. 문제없으면 null */
export function validateNickname(nickname: string): string | null {
  return validNickname(nickname) ? null : NICKNAME_RULE_TEXT
}
