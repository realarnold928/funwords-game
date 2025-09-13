#!/usr/bin/env python3
import pygame
import random
import math
from enum import Enum

# Initialize Pygame
pygame.init()

# Game constants
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 128, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
GRAY = (128, 128, 128)
YELLOW = (255, 255, 0)
DARK_GREEN = (0, 64, 0)

# Tank settings
TANK_SIZE = 30
TANK_SPEED = 3
ENEMY_SPEED = 1.5
BULLET_SPEED = 8
BULLET_SIZE = 5

class GameState(Enum):
    MENU = 1
    PLAYING = 2
    GAME_OVER = 3
    VICTORY = 4

class Direction(Enum):
    UP = 0
    RIGHT = 90
    DOWN = 180
    LEFT = 270

class Tank:
    def __init__(self, x, y, color, is_player=False):
        self.x = x
        self.y = y
        self.color = color
        self.direction = Direction.UP
        self.is_player = is_player
        self.speed = TANK_SPEED if is_player else ENEMY_SPEED
        self.reload_time = 0
        self.health = 3 if is_player else 1
        
    def move(self, dx, dy):
        new_x = self.x + dx * self.speed
        new_y = self.y + dy * self.speed
        
        # Keep tank within screen bounds
        if TANK_SIZE//2 <= new_x <= SCREEN_WIDTH - TANK_SIZE//2:
            self.x = new_x
        if TANK_SIZE//2 <= new_y <= SCREEN_HEIGHT - TANK_SIZE//2:
            self.y = new_y
            
    def update_direction(self, dx, dy):
        if dx > 0:
            self.direction = Direction.RIGHT
        elif dx < 0:
            self.direction = Direction.LEFT
        elif dy > 0:
            self.direction = Direction.DOWN
        elif dy < 0:
            self.direction = Direction.UP
            
    def draw(self, screen):
        # Draw tank body
        pygame.draw.rect(screen, self.color, 
                        (self.x - TANK_SIZE//2, self.y - TANK_SIZE//2, 
                         TANK_SIZE, TANK_SIZE))
        
        # Draw tank barrel
        barrel_length = TANK_SIZE // 2 + 5
        angle = self.direction.value
        end_x = self.x + barrel_length * math.sin(math.radians(angle))
        end_y = self.y - barrel_length * math.cos(math.radians(angle))
        pygame.draw.line(screen, self.color, (self.x, self.y), (end_x, end_y), 5)
        
        # Draw health indicator for player
        if self.is_player and self.health > 0:
            for i in range(self.health):
                pygame.draw.circle(screen, GREEN, 
                                 (self.x - TANK_SIZE//2 + 8 + i*12, self.y - TANK_SIZE//2 - 10), 4)
    
    def can_shoot(self):
        if self.reload_time <= 0:
            self.reload_time = 30  # Reload time in frames
            return True
        return False
    
    def update(self):
        if self.reload_time > 0:
            self.reload_time -= 1

class Bullet:
    def __init__(self, x, y, direction, owner_is_player):
        self.x = x
        self.y = y
        self.direction = direction
        self.owner_is_player = owner_is_player
        self.active = True
        
    def update(self):
        angle = self.direction.value
        self.x += BULLET_SPEED * math.sin(math.radians(angle))
        self.y -= BULLET_SPEED * math.cos(math.radians(angle))
        
        # Deactivate bullet if it goes off screen
        if (self.x < 0 or self.x > SCREEN_WIDTH or 
            self.y < 0 or self.y > SCREEN_HEIGHT):
            self.active = False
            
    def draw(self, screen):
        if self.active:
            color = YELLOW if self.owner_is_player else RED
            pygame.draw.circle(screen, color, (int(self.x), int(self.y)), BULLET_SIZE)
            
    def check_collision(self, tank):
        if not self.active:
            return False
        
        distance = math.sqrt((self.x - tank.x)**2 + (self.y - tank.y)**2)
        if distance < TANK_SIZE//2 + BULLET_SIZE:
            self.active = False
            return True
        return False

class Obstacle:
    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.rect = pygame.Rect(x, y, width, height)
        
    def draw(self, screen):
        pygame.draw.rect(screen, GRAY, self.rect)
        pygame.draw.rect(screen, BLACK, self.rect, 2)
        
    def check_collision(self, x, y, size):
        tank_rect = pygame.Rect(x - size//2, y - size//2, size, size)
        return self.rect.colliderect(tank_rect)

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Tank Battle Game")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 36)
        self.big_font = pygame.font.Font(None, 72)
        self.reset_game()
        
    def reset_game(self):
        self.state = GameState.MENU
        self.player = Tank(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 50, GREEN, is_player=True)
        self.enemies = []
        self.bullets = []
        self.obstacles = []
        self.score = 0
        self.wave = 1
        self.enemies_per_wave = 3
        
        # Create obstacles
        self.create_obstacles()
        
    def create_obstacles(self):
        self.obstacles = [
            Obstacle(150, 200, 100, 30),
            Obstacle(550, 200, 100, 30),
            Obstacle(350, 300, 100, 30),
            Obstacle(200, 400, 30, 100),
            Obstacle(570, 400, 30, 100),
        ]
        
    def spawn_enemies(self):
        for i in range(self.enemies_per_wave):
            while True:
                x = random.randint(TANK_SIZE, SCREEN_WIDTH - TANK_SIZE)
                y = random.randint(TANK_SIZE, SCREEN_HEIGHT // 2)
                
                # Check if position is clear of obstacles
                valid = True
                for obstacle in self.obstacles:
                    if obstacle.check_collision(x, y, TANK_SIZE):
                        valid = False
                        break
                        
                if valid:
                    enemy = Tank(x, y, RED)
                    enemy.direction = Direction(random.choice([0, 90, 180, 270]))
                    self.enemies.append(enemy)
                    break
                    
    def handle_input(self):
        keys = pygame.key.get_pressed()
        dx, dy = 0, 0
        
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            dx = -1
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            dx = 1
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            dy = -1
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            dy = 1
            
        if dx != 0 or dy != 0:
            old_x, old_y = self.player.x, self.player.y
            self.player.move(dx, dy)
            self.player.update_direction(dx, dy)
            
            # Check collision with obstacles
            for obstacle in self.obstacles:
                if obstacle.check_collision(self.player.x, self.player.y, TANK_SIZE):
                    self.player.x, self.player.y = old_x, old_y
                    break
                    
        if keys[pygame.K_SPACE]:
            if self.player.can_shoot():
                bullet = Bullet(self.player.x, self.player.y, 
                              self.player.direction, True)
                self.bullets.append(bullet)
                
    def update_enemies(self):
        for enemy in self.enemies:
            # Simple AI: move randomly and shoot occasionally
            if random.random() < 0.02:  # Change direction occasionally
                enemy.direction = Direction(random.choice([0, 90, 180, 270]))
                
            # Move in current direction
            dx = dy = 0
            if enemy.direction == Direction.UP:
                dy = -1
            elif enemy.direction == Direction.DOWN:
                dy = 1
            elif enemy.direction == Direction.LEFT:
                dx = -1
            elif enemy.direction == Direction.RIGHT:
                dx = 1
                
            old_x, old_y = enemy.x, enemy.y
            enemy.move(dx, dy)
            
            # Check collision with obstacles
            for obstacle in self.obstacles:
                if obstacle.check_collision(enemy.x, enemy.y, TANK_SIZE):
                    enemy.x, enemy.y = old_x, old_y
                    # Change direction on collision
                    enemy.direction = Direction(random.choice([0, 90, 180, 270]))
                    break
                    
            # Shoot at player occasionally
            if random.random() < 0.02 and enemy.can_shoot():
                # Aim towards player
                angle = math.atan2(self.player.x - enemy.x, 
                                  enemy.y - self.player.y)
                angle_deg = math.degrees(angle)
                
                # Snap to nearest cardinal direction
                if -45 <= angle_deg < 45:
                    enemy.direction = Direction.UP
                elif 45 <= angle_deg < 135:
                    enemy.direction = Direction.RIGHT
                elif angle_deg >= 135 or angle_deg < -135:
                    enemy.direction = Direction.DOWN
                else:
                    enemy.direction = Direction.LEFT
                    
                bullet = Bullet(enemy.x, enemy.y, enemy.direction, False)
                self.bullets.append(bullet)
                
            enemy.update()
            
    def update_bullets(self):
        for bullet in self.bullets[:]:
            bullet.update()
            
            # Check collision with obstacles
            for obstacle in self.obstacles:
                if obstacle.rect.collidepoint(bullet.x, bullet.y):
                    bullet.active = False
                    
            if bullet.owner_is_player:
                # Check collision with enemies
                for enemy in self.enemies[:]:
                    if bullet.check_collision(enemy):
                        enemy.health -= 1
                        if enemy.health <= 0:
                            self.enemies.remove(enemy)
                            self.score += 100
            else:
                # Check collision with player
                if bullet.check_collision(self.player):
                    self.player.health -= 1
                    if self.player.health <= 0:
                        self.state = GameState.GAME_OVER
                        
            if not bullet.active:
                self.bullets.remove(bullet)
                
    def draw_menu(self):
        self.screen.fill(DARK_GREEN)
        
        title = self.big_font.render("TANK BATTLE", True, WHITE)
        title_rect = title.get_rect(center=(SCREEN_WIDTH//2, 150))
        self.screen.blit(title, title_rect)
        
        start_text = self.font.render("Press ENTER to Start", True, WHITE)
        start_rect = start_text.get_rect(center=(SCREEN_WIDTH//2, 300))
        self.screen.blit(start_text, start_rect)
        
        controls = [
            "Controls:",
            "Arrow Keys / WASD - Move",
            "SPACE - Shoot",
            "ESC - Quit"
        ]
        
        y = 400
        for line in controls:
            text = self.font.render(line, True, WHITE)
            text_rect = text.get_rect(center=(SCREEN_WIDTH//2, y))
            self.screen.blit(text, text_rect)
            y += 40
            
    def draw_game(self):
        self.screen.fill(BLACK)
        
        # Draw obstacles
        for obstacle in self.obstacles:
            obstacle.draw(self.screen)
            
        # Draw tanks
        self.player.draw(self.screen)
        for enemy in self.enemies:
            enemy.draw(self.screen)
            
        # Draw bullets
        for bullet in self.bullets:
            bullet.draw(self.screen)
            
        # Draw UI
        score_text = self.font.render(f"Score: {self.score}", True, WHITE)
        self.screen.blit(score_text, (10, 10))
        
        wave_text = self.font.render(f"Wave: {self.wave}", True, WHITE)
        self.screen.blit(wave_text, (10, 50))
        
        enemies_text = self.font.render(f"Enemies: {len(self.enemies)}", True, WHITE)
        self.screen.blit(enemies_text, (SCREEN_WIDTH - 200, 10))
        
    def draw_game_over(self):
        self.screen.fill(BLACK)
        
        if self.state == GameState.GAME_OVER:
            text = self.big_font.render("GAME OVER", True, RED)
        else:
            text = self.big_font.render("VICTORY!", True, GREEN)
            
        text_rect = text.get_rect(center=(SCREEN_WIDTH//2, 200))
        self.screen.blit(text, text_rect)
        
        score_text = self.font.render(f"Final Score: {self.score}", True, WHITE)
        score_rect = score_text.get_rect(center=(SCREEN_WIDTH//2, 300))
        self.screen.blit(score_text, score_rect)
        
        restart_text = self.font.render("Press ENTER to Play Again", True, WHITE)
        restart_rect = restart_text.get_rect(center=(SCREEN_WIDTH//2, 400))
        self.screen.blit(restart_text, restart_rect)
        
        quit_text = self.font.render("Press ESC to Quit", True, WHITE)
        quit_rect = quit_text.get_rect(center=(SCREEN_WIDTH//2, 450))
        self.screen.blit(quit_text, quit_rect)
        
    def run(self):
        running = True
        
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        if self.state == GameState.PLAYING:
                            self.state = GameState.MENU
                        else:
                            running = False
                    elif event.key == pygame.K_RETURN:
                        if self.state == GameState.MENU:
                            self.reset_game()
                            self.state = GameState.PLAYING
                            self.spawn_enemies()
                        elif self.state in [GameState.GAME_OVER, GameState.VICTORY]:
                            self.reset_game()
                            self.state = GameState.MENU
                            
            if self.state == GameState.PLAYING:
                self.handle_input()
                self.player.update()
                self.update_enemies()
                self.update_bullets()
                
                # Check if wave is complete
                if len(self.enemies) == 0:
                    self.wave += 1
                    if self.wave > 5:  # Victory after 5 waves
                        self.state = GameState.VICTORY
                    else:
                        self.enemies_per_wave = min(self.enemies_per_wave + 1, 8)
                        self.spawn_enemies()
                        
            # Draw everything
            if self.state == GameState.MENU:
                self.draw_menu()
            elif self.state == GameState.PLAYING:
                self.draw_game()
            elif self.state in [GameState.GAME_OVER, GameState.VICTORY]:
                self.draw_game_over()
                
            pygame.display.flip()
            self.clock.tick(FPS)
            
        pygame.quit()

if __name__ == "__main__":
    game = Game()
    game.run()