export async function delay(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// References:
// https://github.com/asaskevich/govalidator/blob/96eecce7786b070da4bfef82fb58d299c48a4f1f/patterns.go#L69-L71
// https://github.com/asaskevich/govalidator/blob/96eecce7786b070da4bfef82fb58d299c48a4f1f/validator.go#L73-L101
export function isExistingEmail(email: string | undefined) {
  if (!is.string(email)) {
    return false
  }
  if (is.emptyStringOrWhitespace(email)) {
    return true
  }

  const userRegexp = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/
  const hostRegexp = /^[^\s]+\.[^\s]+$/
  const userDotRegexp = /(^[.]{1})|([.]{1}$)|([.]{2,})/

  if (email.length < 6 || email.length > 254) {
    return false
  }
  const at = email.lastIndexOf('@')
  if (at <= 0 || at > email.length - 3) {
    return false
  }
  const user = email.slice(0, at)
  const host = email.slice(at + 1)
  if (user.length > 64) {
    return false
  }
  switch (host) {
    case 'localhost':
    case 'example.com':
      return true
    default:
      return !(userDotRegexp.test(user) || !userRegexp.test(user) || !hostRegexp.test(host))
  }
}

export function checkStatusCodeLevel(statusCode: number, level: 1 | 2 | 3 | 4 | 5) {
  return Math.floor(statusCode / 100) === level
}
