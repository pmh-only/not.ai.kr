/** @type {Map<string, NodeJS.Timeout>} */
const cooldowns = new Map()

export function isCooldown(key) {
  return cooldowns.has(key)
}

export function addCooldown(key) {
  if (isCooldown(key))
    clearTimeout(cooldowns.get(key))

  cooldowns.set(key, setTimeout(() => {
    cooldowns.delete(key)
  }, 3 * 1000))
}
