import { CardInstance } from '@/types/game';
import { Effect, EffectType } from '@/types/card';

/**
 * Handles the application and resolution of card effects
 */
export class EffectProcessor {
  /**
   * Apply an effect to a target
   */
  public static applyEffect(
    effect: Effect,
    source: CardInstance,
    targets: CardInstance | CardInstance[] | null
  ): void {
    // Handle different target types
    const targetArray = this.resolveTargets(effect, source, targets);
    
    if (!targetArray || targetArray.length === 0) {
      return;
    }
    
    // Apply the effect to each target
    targetArray.forEach(target => {
      this.applySingleEffect(effect, source, target);
    });
  }
  
  /**
   * Resolves target selection based on effect target type
   */
  private static resolveTargets(
    effect: Effect, 
    source: CardInstance,
    selectedTargets: CardInstance | CardInstance[] | null
  ): CardInstance[] {
    if (!selectedTargets) {
      return [];
    }
    
    // If already an array, use it
    if (Array.isArray(selectedTargets)) {
      return selectedTargets;
    }
    
    // Single target
    return [selectedTargets];
  }
  
  /**
   * Apply an effect to a single target
   */
  private static applySingleEffect(effect: Effect, source: CardInstance, target: CardInstance): void {
    switch (effect.category) {
      case 'stat_modification':
        this.applyStatModification(effect, target);
        break;
        
      case 'damage':
        this.applyDamage(effect, target);
        break;
        
      case 'healing':
        this.applyHealing(effect, target);
        break;
        
      case 'control':
        this.applyControlEffect(effect, target);
        break;
        
      case 'utility':
        this.applyUtilityEffect(effect);
        break;
    }
    
    // Add to active effects if it has duration
    if (effect.duration > 0) {
      // Check if already has this effect
      const existingEffect = target.activeEffects.find(e => e.effectId === effect.id);
      
      if (existingEffect) {
        // Refresh duration
        existingEffect.turnsRemaining = effect.duration;
      } else {
        // Add new effect
        target.activeEffects.push({
          effectId: effect.id,
          turnsRemaining: effect.duration,
          magnitude: effect.magnitude
        });
      }
    }
  }
  
  /**
   * Apply stat modification effects
   */
  private static applyStatModification(effect: Effect, target: CardInstance): void {
    const multiplier = (effect.type === EffectType.BUFF) ? 1 : -1;
    const magnitude = effect.magnitude * multiplier;
    
    if (effect.description.toLowerCase().includes('attack')) {
      target.currentStats.attack += magnitude;
    }
    
    if (effect.description.toLowerCase().includes('health')) {
      target.currentStats.health += magnitude;
    }
    
    // Ensure stats don't go below 0 (except health which can)
    target.currentStats.attack = Math.max(0, target.currentStats.attack);
  }
  
  /**
   * Apply damage effects
   */
  private static applyDamage(effect: Effect, target: CardInstance): void {
    target.currentStats.health -= effect.magnitude;
  }
  
  /**
   * Apply healing effects
   */
  private static applyHealing(effect: Effect, target: CardInstance): void {
    const maxHealth = target.card.stats.health;
    target.currentStats.health = Math.min(maxHealth, target.currentStats.health + effect.magnitude);
  }
  
  /**
   * Apply control effects (silence, stun, etc.)
   */
  private static applyControlEffect(effect: Effect, target: CardInstance): void {
    // Add to active effects instead of setting properties directly
    if (effect.description.toLowerCase().includes('silence')) {
      // Add silence effect to activeEffects
      target.activeEffects.push({
        effectId: 'silence-' + Math.random().toString(36).substring(7),
        turnsRemaining: effect.duration || 1,
        magnitude: 1
      });
    }
    
    if (effect.description.toLowerCase().includes('stun')) {
      // Add stun effect to activeEffects
      target.activeEffects.push({
        effectId: 'stun-' + Math.random().toString(36).substring(7),
        turnsRemaining: effect.duration || 1,
        magnitude: 1
      });
      target.canAttack = false;
    }
  }
  
  /**
   * Apply utility effects
   */
  private static applyUtilityEffect(effect: Effect): void {
    // Implement specific utility effects
    if (effect.description.toLowerCase().includes('draw')) {
      // Card draw logic would be implemented elsewhere
    }
    
    if (effect.description.toLowerCase().includes('mana')) {
      // Mana adjustment logic would be implemented elsewhere
    }
  }
  
  /**
   * Process effects at the start of a turn
   */
  public static processStartTurnEffects(cards: CardInstance[]): void {
    cards.forEach(card => {
      // Process active effects
      card.activeEffects = card.activeEffects.filter(activeEffect => {
        // Decrease duration
        activeEffect.turnsRemaining--;
        
        // Remove if duration is over
        return activeEffect.turnsRemaining > 0;
      });
      
      // Process persistent effects that trigger on turn start
      card.card.effects.forEach(effect => {
        if (effect.type === EffectType.PERSISTENT && effect.condition === 'turn_start') {
          this.applySingleEffect(effect, card, card);
        }
      });
    });
  }
  
  /**
   * Process effects at the end of a turn
   */
  public static processEndTurnEffects(cards: CardInstance[]): void {
    cards.forEach(card => {
      // Process persistent effects that trigger on turn end
      card.card.effects.forEach(effect => {
        if (effect.type === EffectType.PERSISTENT && effect.condition === 'turn_end') {
          this.applySingleEffect(effect, card, card);
        }
      });
    });
  }
}
