# SISTEMA DE SALAS E MAPA - DESIGN CORRETO

## PROBLEMA ATUAL

### O que está acontecendo agora:
- **Mundo único e contínuo**: 2560x720 pixels
- **"Salas" são apenas divisões lógicas**: 0-1280 e 1280-2560
- **Player pode ver ambas as salas**: Câmera mostra continuidade
- **Player pode caminhar livremente**: Sem barreiras reais
- **Portas são apenas triggers**: No meio do cenário, não nas bordas

### Por que isso está errado:
1. **Não há isolamento visual**: Você vê a próxima sala antes de entrar
2. **Não há sensação de mudança de ambiente**: Tudo é contínuo
3. **Portas ficam "no ar"**: No meio do cenário, não fazem sentido
4. **Não há mistério/exploração**: Você já vê o que tem na próxima sala

## SISTEMA CORRETO DE SALAS

### Conceito Base:
**Cada sala deve ser um ambiente completamente isolado e único**

### Características de um Sistema Correto:

#### 1. **SALAS ISOLADAS**
- Cada sala é um mapa separado de 1280x720 pixels
- Player só vê UMA sala por vez
- Transição entre salas muda completamente o ambiente
- Câmera limitada aos bounds da sala atual (0-1280)

#### 2. **PORTAS NAS BORDAS REAIS**
- Porta da Sala A: No pixel 1279 (borda direita absoluta)
- Porta da Sala B: No pixel 1 (borda esquerda absoluta) 
- Player não pode passar das bordas SEM usar a porta
- Colisão com borda do mundo força o player a usar a porta

#### 3. **TRANSIÇÕES VISUAIS CLARAS**
- Fade out completo (tela preta)
- Mudança de ambiente durante o fade
- Fade in na nova sala
- Player aparece na borda oposta da nova sala

#### 4. **AMBIENTES ÚNICOS**
- Cada sala tem background próprio
- Cores diferentes, elementos visuais distintos
- Inimigos específicos da sala
- Atmosfera única por sala

## IMPLEMENTAÇÃO TÉCNICA CORRETA

### Estrutura de Dados:
```javascript
rooms: {
  0: {
    id: 0,
    name: "Entrance Hall",
    background: "forest_entrance.jpg",
    theme: "nature",
    worldBounds: { x: 0, y: 0, width: 1280, height: 720 },
    doors: [
      { x: 1270, y: 520, width: 60, height: 100, toRoom: 1, direction: "east" }
    ],
    enemies: [
      { type: 'goblin', x: 400, y: 600 },
      { type: 'goblin', x: 800, y: 600 }
    ],
    playerSpawn: { x: 100, y: 550 }
  },
  1: {
    id: 1,  
    name: "Dark Chamber",
    background: "dark_dungeon.jpg", 
    theme: "dungeon",
    worldBounds: { x: 0, y: 0, width: 1280, height: 720 }, // SEMPRE 0-1280!
    doors: [
      { x: 10, y: 520, width: 60, height: 100, toRoom: 0, direction: "west" }
    ],
    enemies: [
      { type: 'orc', x: 500, y: 590 }
    ],
    bosses: [
      { type: 'shadowLord', x: 1000, y: 580 }
    ],
    playerSpawn: { x: 1180, y: 550 }
  }
}
```

### Camera System Correto:
```javascript
// Câmera SEMPRE limitada à sala atual
currentRoom = rooms[this.currentRoom]
camera.bounds = currentRoom.worldBounds  // 0-1280, não 0-2560

// Player nunca vê além da sala atual
camera.x = Math.max(0, Math.min(1280 - camera.width, camera.x))
```

### Collision System:
```javascript
// Bordas da sala atual funcionam como paredes
if (position.x <= 0) position.x = 0                    // Parede esquerda
if (position.x >= 1280) position.x = 1280             // Parede direita

// Portas são a ÚNICA forma de sair da sala
checkDoorCollision(player, currentRoom.doors)
```

### Transition System:
```javascript
async transitionToRoom(newRoomId) {
  // 1. Fade out completo
  await fadeOut()
  
  // 2. Limpar sala atual
  clearCurrentRoomEntities()
  
  // 3. Mudar world bounds da câmera
  this.game.worldBounds = newRoom.worldBounds
  
  // 4. Spawnar player na nova posição
  player.position = newRoom.playerSpawn
  
  // 5. Spawnar enemies da nova sala
  spawnRoomEntities(newRoomId)
  
  // 6. Fade in
  await fadeIn()
}
```

## EXPERIÊNCIA DO USUÁRIO

### Como deveria funcionar:
1. **Player inicia na Sala A**: Vê apenas 1280 pixels de largura
2. **Explora a Sala A**: Pode ir até a borda direita
3. **Encontra a porta**: Na borda direita absoluta da sala
4. **Entra na porta**: Fade out → Fade in
5. **Aparece na Sala B**: Ambiente completamente diferente
6. **Não vê mais a Sala A**: Isolamento visual completo

### Benefícios:
- **Mistério**: Não sabe o que tem na próxima sala
- **Surpresa**: Cada sala é uma descoberta
- **Imersão**: Transições dramáticas
- **Escalabilidade**: Pode ter 100+ salas únicas
- **Performance**: Só renderiza uma sala por vez

## DIFERENÇAS VISUAIS ENTRE SALAS

### Sala 0 - "Forest Entrance"
- **Background**: Verde/natureza
- **Ground**: Grama verde
- **Lighting**: Clara/dia
- **Enemies**: Goblins (criaturas da floresta)

### Sala 1 - "Dark Dungeon" 
- **Background**: Cinza/pedra
- **Ground**: Pedra escura
- **Lighting**: Escura/tocha
- **Enemies**: Orcs, Boss (criaturas do dungeon)

## SISTEMA DE MAPA

### Grid 5x5 com Salas Únicas:
```
[ ] [ ] [B] [ ] [ ]  ← Sala Boss no norte
[ ] [S] [H] [T] [ ]  ← Sala Start, Hall, Treasure  
[ ] [ ] [D] [ ] [ ]  ← Dungeon no sul
[ ] [ ] [ ] [ ] [ ]
[ ] [ ] [ ] [ ] [ ]
```

### Estados do Mapa:
- **Unexplored**: Salas não visitadas (invisíveis/?)
- **Visited**: Salas já visitadas (visíveis)
- **Current**: Sala atual (destacada)

## RESUMO

O sistema atual é uma **ilusão de salas** em um mundo contínuo. 
O sistema correto seria **salas verdadeiramente isoladas** com:
- Ambientes únicos por sala
- Transições dramáticas
- Portas nas bordas absolutas
- Câmera limitada à sala atual
- Exploração progressiva e misteriosa

**Cada sala deve ser um mini-jogo/experiência única, não apenas uma divisão arbitrária de um mundo grande.**