import redis from "../config/redis.js"

// ── Get from cache, or compute + cache ──────────────────────
export const cached = async(key, ttlSeconds, fetchFn) => {
    try {
        const hit = await redis.get(key)
        if(hit) return JSON.parse(hit)
    } catch (error) {
         console.error(`Redis GET error [${key}]:`, err.message)
    }

     const data = await fetchFn()

     try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds)
  } catch (err) {
    console.error(`Redis SET error [${key}]:`, err.message)
  }

  return data;
}

// ── Invalidate a single key ─────────────────────────────────
export const invalidate = async (key) => {
  try {
    await redis.del(key)
  } catch (err) {
    console.error(`Redis DEL error [${key}]:`, err.message)
  }
}

// ── Invalidate all keys matching a pattern ──────────────────
export const invalidatePattern = async(pattern) => {
    try {
        const keys = await redis.keys(pattern)
        if(keys.length > 0) await redis.del(...keys)
    } catch (error) {
        console.error(`Redis pattern DEL error [${pattern}]:`, err.message)
    }
}

// ── TTL presets (seconds) ───────────────────────────────────
export const TTL = {
  SHORT:  60,        // 1 min  — roster lists, things that change often
  MEDIUM: 300,       // 5 min  — plan data, dashboard data
  LONG:   3600,      // 1 hour — weekly reports, trend charts (immutable-ish)
  DAY:    86400,     // 24 hr  — rarely-changing reference data
}