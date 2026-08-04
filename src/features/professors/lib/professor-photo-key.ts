/**
 * 교수명을 R2 업로드 키에 쓸 ASCII 슬러그로 바꿉니다.
 *
 * 한글 파일명을 그대로 쓰면 macOS(NFD)와 URL(NFC) 정규화가 어긋나 공개 URL이
 * 404가 납니다. 이미 올라간 사진들도 같은 규칙(kimsihye, iminta …)을 씁니다.
 */

const CHO = [
  "g", "kk", "n", "d", "tt", "r", "m", "b", "pp",
  "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h",
];

const JUNG = [
  "a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o",
  "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu",
  "eu", "ui", "i",
];

// 인덱스 0은 받침 없음. 이후 ㄱ ㄲ ㄳ ㄴ ㄵ ㄶ ㄷ ㄹ ㄺ ㄻ ㄼ ㄽ ㄾ ㄿ ㅀ ㅁ ㅂ ㅄ ㅅ ㅆ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ
const JONG = [
  "", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l",
  "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t",
];

/** 한글 음절을 로마자로 옮깁니다. 표준 표기법이 아니라 파일 키 생성용 근사치입니다. */
export function romanizeKorean(value: string): string {
  let out = "";
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const index = code - 0xac00;
      out += CHO[Math.floor(index / 588)];
      out += JUNG[Math.floor((index % 588) / 28)];
      out += JONG[index % 28];
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      out += ch.toLowerCase();
    }
  }
  return out;
}

/**
 * "김시혜 교수" → "kimsihye" (직함은 뗍니다)
 *
 * 이미 올라간 사진들이 성씨를 관용 표기(김=kim, 박=park)로 쓰고 있어 맞춥니다.
 */
const SURNAME_STYLE: [RegExp, string][] = [
  [/^gim/, "kim"],
  [/^bak/, "park"],
  [/^bag/, "park"],
];

export function professorPhotoKey(name: string): string {
  const bare = name.replace(/\s*(교수님|교수|강사님|강사)\s*$/, "").trim();
  let key = romanizeKorean(bare);
  for (const [pattern, replacement] of SURNAME_STYLE) {
    if (pattern.test(key)) {
      key = key.replace(pattern, replacement);
      break;
    }
  }
  return key || "professor";
}
