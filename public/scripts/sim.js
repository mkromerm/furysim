importScripts('./classes/Flurry.js')
importScripts('./classes/Player.js')
importScripts('./classes/Rage.js')
importScripts('./classes/Target.js')
importScripts('./classes/Weapon.js')
importScripts('./classes/Log.js')

importScripts('./classes/Aura.js')
importScripts('./classes/Auras/Windfury.js')

importScripts('./classes/Buff.js')
importScripts('./classes/Buffs/BloodFury.js')
importScripts('./classes/Buffs/BloodragePeriodic.js')
importScripts('./classes/Buffs/MightyRagePotion.js')

importScripts('./classes/Cooldown.js')
importScripts('./classes/Cooldowns/AngerManagement.js')
importScripts('./classes/Cooldowns/AttackSpeed.js')
importScripts('./classes/Cooldowns/Bloodrage.js')
importScripts('./classes/Cooldowns/HandOfJustice.js')

importScripts('./classes/Skill.js')
importScripts('./classes/Skills/Bloodthirst.js')
importScripts('./classes/Skills/Execute.js')
importScripts('./classes/Skills/HeroicStrike.js')
importScripts('./classes/Skills/Whirlwind.js')

importScripts('./helpers.js')

function run(cfg) {
  const startTime = new Date().getTime()
  const maxIterations = cfg.debug ? 1 : cfg.iterations
  const log = new Log(cfg.duration, maxIterations)
  const exists = (e) => !!e

  for (let i = 0; i < maxIterations; ++i) {
    const player = new Player(cfg, log)
    if (i === 0 && cfg.debug) console.log(player)

    const events = [
      player.mainhand,
      player.offhand,

      player.deathWish,
      player.bloodrage,
      player.mrp,

      player.execute,

      player.battleShout,
      player.bloodFury,

      player.bloodthirst,
      player.whirlwind,

      player.bloodrage.periodic,
      player.angerManagement
    ].filter(exists)

    const otherCooldowns = [
      player.gcd,
      player.flurry,
      player.windfury,
      player.hoj
    ].filter(exists)

    let time = 0
    while (time < cfg.duration) {
      // Get the next event with lower cooldown that can be usable,
      // respecting priority order
      const nextEvent = events.reduce((prio, next) => {
        if (!next.canUse) return prio
        if (prio.normTimeLeft <= next.normTimeLeft && prio.canUse) return prio
        return next
      })

      const latency = nextEvent.isPlayerInput
        ? m.max(0, getRandom(cfg.latency.min, cfg.latency.max) / 1000) : 0
      const secs = nextEvent.normTimeLeft + latency
      time += secs
      player.time = time

      // Tick cooldowns for next event
      otherCooldowns.forEach((e) => e.tick(secs))
      events.forEach((e) => e.tick(secs))

      // Some requirements for skills changes after advacing time
      if (!nextEvent.canUse) continue

      if (time > cfg.duration) break

      // Handle events
      if (nextEvent.swing) nextEvent.swing()
      if (nextEvent.use) nextEvent.use()

      // Try to queue HS
      player.heroicStrike.tryToQueue()
    }

    const progress = m.round(i / maxIterations * 100) + '%'
    postMessage({ progress })
  }

  const endTime = new Date().getTime()
  const finishedIn = ((endTime - startTime) / 1000)

  console.log(log)

  postMessage({ finishedIn, dps: log.dps, report: log.report })
}

onmessage = function (e) {
  const cfg = e.data
  run(cfg)
}
