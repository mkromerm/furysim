import Player from '@/sim/classes/Player'
import Skill from '@/sim/classes/Skill'

export default class HeroicStrike extends Skill {
  private _isQueued: boolean
  private _isCleave: boolean
  queue: HeroicStrikeQueue

  constructor(player: Player, cfg: any) {
	const heroicCost = cfg.cleave ? 20 : 15
    super(player, cfg.cleave ? 'Cleave' : 'Heroic Strike', heroicCost, 0, false, cfg)

    this._isQueued = false
	this._isCleave = cfg.cleave
    this.queue = new HeroicStrikeQueue(this)
  }

  // Getters

  get isQueued() {
    return this._isQueued
  }

  get dmg() {
    return this._isCleave ? (this.player.mainhand.dmg + 100) * 2 : this.player.mainhand.dmg + 100;
  }

  get canQueue() {
    if (!this.cfg.canUse) return false
    if (this.isQueued) return false
    if (!super.canUse) return false
    if (!this.player.rage.has(this.cfg.rage || this.cost)) return false

    return true
  }

  // Methods

  tryToQueue() {
    if (this.isQueued) return
    if (!this.canQueue) return

    this._isQueued = true
    this.player.addTimeline(this.name, 'SKILL_QUEUED')
  }

  cancelQueue() {
    this._isQueued = false
  }

  reset() {
    super.reset()
    this._isQueued = false
  }
}

class HeroicStrikeQueue {
  name: string
  heroicStrike: HeroicStrike
  isPlayerInput: boolean

  constructor(heroicStrike: HeroicStrike) {
    this.name = 'Heroic Strike Queue'
    this.heroicStrike = heroicStrike
    this.isPlayerInput = true
  }

  // Getters

  get canUse() {
    return this.heroicStrike.canQueue
  }

  get timeLeft() {
    return this.heroicStrike.timeLeft
  }

  // Methods

  handle() {
    this.heroicStrike.tryToQueue()
  }

  tick(secs: number) {
    this.heroicStrike.tick(secs)
  }
}
