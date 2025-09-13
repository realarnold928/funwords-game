# Tank Battle Game 坦克大战游戏

A classic tank battle game written in Python using Pygame.

## Installation 安装

1. Install Python 3.6 or higher
2. Install dependencies:
```bash
pip install -r requirements.txt
```

## How to Run 运行方法

```bash
python tank_battle_game.py
```

## Game Features 游戏特性

- **Player Tank**: Control a green tank with health points
- **Enemy Tanks**: Red enemy tanks with AI behavior
- **Combat System**: Shoot bullets to destroy enemies
- **Obstacles**: Gray barriers for tactical gameplay
- **Wave System**: Progress through 5 waves of increasing difficulty
- **Score System**: Earn points for destroying enemies

## Controls 控制键

- **Arrow Keys / WASD**: Move your tank
- **SPACE**: Shoot bullets
- **ENTER**: Start game / Restart
- **ESC**: Return to menu / Quit

## Gameplay 游戏玩法

1. Start from the menu by pressing ENTER
2. Control your green tank to destroy all enemy red tanks
3. Avoid enemy bullets - you have 3 health points
4. Use obstacles for cover and tactical advantage
5. Complete 5 waves to achieve victory
6. Each wave increases the number of enemies

## Game Mechanics 游戏机制

- **Player Health**: 3 hit points (shown as green dots above tank)
- **Enemy Health**: 1 hit point each
- **Reload Time**: Brief cooldown between shots
- **AI Behavior**: Enemies move randomly and shoot at the player
- **Collision Detection**: Tanks cannot pass through obstacles
- **Victory Condition**: Survive and clear all 5 waves
- **Game Over**: Lose all health points

## Technical Details 技术细节

- Built with Python 3 and Pygame
- 60 FPS gameplay
- 800x600 resolution
- Object-oriented design with separate classes for game entities
- Simple AI for enemy behavior
- Collision detection for tanks, bullets, and obstacles