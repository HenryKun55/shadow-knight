# Room Transition System Documentation

## Visão Geral

O sistema de transição de salas do Shadow Knight implementa uma arquitetura de salas isoladas com transições suaves entre ambientes. Cada sala possui coordenadas independentes (0-1280), impedindo visualização de áreas externas e garantindo experiência imersiva.

## Arquitetura do Sistema

### Estrutura de Salas

Cada sala é definida com as seguintes propriedades:

```javascript
{
  id: 0,                                    // ID único da sala
  name: "Forest Entrance",                  // Nome descritivo
  theme: "forest",                         // Tema visual (forest/dungeon)
  worldBounds: { x: 0, y: 0, width: 1280, height: 720 }, // Coordenadas isoladas
  backgroundColor: '#1a2e1a',              // Cor de fundo específica
  groundColor: '#2d4a2d',                  // Cor do chão
  doors: [...],                            // Portas para outras salas
  enemies: [...],                          // Inimigos específicos da sala
  bosses: [...],                           // Bosses (opcional)
  playerSpawnFromEast: { x: 1200, y: 570 }, // Spawn seguro vindo do leste
  playerSpawnFromWest: { x: 80, y: 570 },   // Spawn seguro vindo do oeste
  playerEntranceAnimation: {...}            // Dados da animação de entrada
}
```

### Sistema de Portas

As portas são posicionadas nas bordas das salas para criar transições naturais:

- **Sala 0 (Forest)**: Porta direita (x=1270) → Sala 1
- **Sala 1 (Dungeon)**: Porta esquerda (x=0) → Sala 0

```javascript
doors: [
  { 
    x: 1270,           // Posição X da porta
    y: 520,            // Posição Y da porta  
    width: 60,         // Largura da collision box
    height: 100,       // Altura da collision box
    toRoom: 1,         // ID da sala de destino
    direction: "east"  // Direção da porta
  }
]
```

## Sistema de Animações

### Animação de Saída (Exit Animation)

Quando o player toca numa porta:

1. **Movimento em direção à porta**: Player move 30 pixels na direção da porta
2. **Fade out gradual**: Alpha reduz de 1.0 para 0.0 em 12 steps
3. **Duração**: 720ms (60ms por step)

```javascript
// Animação de saída
for (let i = steps; i >= 1; i--) {
  sprite.alpha = i / steps;
  position.x += deltaX;  // Movimento em direção à porta
  await new Promise(resolve => setTimeout(resolve, 60));
}
```

### Animação de Entrada (Entrance Animation)

Após fade in da nova sala:

1. **Posicionamento inicial**: Player inicia na posição da porta
2. **Movimento para posição segura**: Move da porta para posição segura
3. **Fade in gradual**: Alpha aumenta de 0.0 para 1.0 em 15 steps
4. **Duração**: 600ms (40ms por step)

```javascript
// Animação de entrada
const deltaX = (entranceAnim.endX - entranceAnim.startX) / steps;
for (let i = 1; i <= steps; i++) {
  sprite.alpha = i / steps;
  position.x = entranceAnim.startX + (deltaX * i);
  await new Promise(resolve => setTimeout(resolve, 40));
}
```

## Prevenção de Loops de Transição

### Sistema de Cooldown

Para evitar transições acidentais múltiplas:

- **Cooldown de 2 segundos** após cada transição
- Collision detection desabilitada durante cooldown
- Verificação `if (this.transitionCooldown <= 0)` antes de processar portas

### Posições Seguras de Spawn

- **Sala 0**: Player spawna em x=1200 (seguro antes da porta direita)
- **Sala 1**: Player spawna em x=80 (seguro após a porta esquerda)

## Sequência Completa de Transição

### 1. Detecção de Colisão
```javascript
if (playerRight > doorLeft && playerLeft < doorRight &&
    playerBottom > doorTop && playerTop < doorBottom) {
  this.transitionCooldown = 2000; // Inicia cooldown
  this.transitionToRoom(door.toRoom, player, mapState);
}
```

### 2. Animação de Saída
- Player move em direção à porta com fade out
- Controles do player são desabilitados

### 3. Fade Out da Sala
- Overlay preto aparece (opacity: 1)
- Aguarda 500ms para transição suave

### 4. Mudança de Ambiente
- Remove todas as entidades da sala atual
- Reconfigura world bounds para nova sala
- Atualiza background e tema visual
- Atualiza map state

### 5. Posicionamento do Player
- Player é posicionado na entrada da porta da nova sala
- Usa `playerEntranceAnimation.startX` como posição inicial

### 6. Spawn de Entidades
- Cria inimigos específicos da nova sala
- Cria bosses se definidos

### 7. Fade In da Nova Sala
- Remove overlay preto (opacity: 0)
- Aguarda 500ms

### 8. Animação de Entrada
- Player move da porta para posição segura com fade in
- Controles são reabilitados após animação

## Configurações de Performance

### Timing das Animações
- **Exit Animation**: 720ms (12 steps × 60ms)
- **Fade Transition**: 1000ms total (500ms out + 500ms in)
- **Entrance Animation**: 600ms (15 steps × 40ms)
- **Cooldown**: 2000ms para prevenir loops

### Otimizações
- Entities são removidas completamente entre salas
- Background é recriado apenas quando necessário
- Camera bounds são atualizados para sala atual
- Collision detection otimizada com early return

## Debug e Monitoramento

### Console Logs
```javascript
console.log(`Door collision! Transitioning to room ${door.toRoom}`);
console.log(`Player positioned for entrance animation: (${position.x}, ${position.y})`);
console.log(`Entrance animation completed. Final position: (${position.x}, ${position.y})`);
```

### Debug Visual
- Collision boxes das portas (F3 para ativar)
- Informações de sala atual e posição do player
- Performance stats em tempo real

## Troubleshooting

### Problema: Loop Infinito de Transições
**Causa**: Player spawna dentro da collision box da porta
**Solução**: Ajustar `playerSpawnFromWest/East` para posições seguras

### Problema: Animações Inconsistentes
**Causa**: Dados de `playerEntranceAnimation` incorretos
**Solução**: Verificar `startX`, `endX` e `y` em cada sala

### Problema: Player Fica Preso
**Causa**: World bounds incorretos ou collision detection falha
**Solução**: Verificar `enforceRoomBounds()` e configuração das salas

## Extensão do Sistema

Para adicionar novas salas:

1. Adicionar definição da sala em `this.rooms`
2. Configurar portas bidirecionais
3. Definir spawn positions seguras
4. Configurar animações de entrada
5. Adicionar entidades específicas da sala
6. Testar transições em ambas direções

O sistema foi projetado para ser facilmente extensível mantendo performance e experiência de usuário consistentes.