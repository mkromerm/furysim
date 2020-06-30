import Player from '@/sim/classes/Player'

export default class Target {
  private armor: number
  private lvl: number

  constructor(private player: Player, cfg: any) {
    this.armor = cfg.armor
    this.lvl = cfg.lvl
  }

  // Getters

  get defenseSkill() {
    const value = this.lvl * 5
    Object.defineProperty(this, 'defenseSkill', { value })
    return value
  }

  // https://vanilla-wow.fandom.com/wiki/Armor
  get armorMitigationMul() {
	//calculate effective armor if pen proc is up
	let eArmor = this.armor
	if (this.player.mainhand.proc && this.player.mainhand.proc.type && this.player.mainhand.proc.type == 'pen' && this.player.mainhand.proc.isActive) eArmor = eArmor - this.player.mainhand.proc.amount * this.player.mainhand.proc.stacks
	if (eArmor < 0) eArmor = 0
    const value = 1 - (eArmor / (eArmor + 400 + 85 * this.player.lvl))
    //Object.defineProperty(this, 'armorMitigationMul', { value })
    return value
  }
}
