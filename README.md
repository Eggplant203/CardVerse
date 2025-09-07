# CardVerse - Transform Anything into Epic Cards

## Project Overview

CardVerse is a strategic PVP card game where players can transform any photo into unique, powerful cards. The game uses advanced AI to analyze each image and generate appropriate stats, effects, and lore-friendly descriptions, creating personalized cards that can be used in tactical battles.

## Features

- **AI-powered Card Generation**: Upload any photo and watch as our AI analyzes it to create a unique card with appropriate stats and abilities
- **Strategic 6-card Battlefield**: Position cards on a 6-slot battlefield with front and back rows for tactical gameplay
- **Card Collection System**: Create, collect, and manage your custom cards with JSON export/import functionality
- **PVP Battles**: Challenge opponents in turn-based strategic combat
- **Dynamic Effects**: A comprehensive status effect system with buffs, debuffs, triggers, and persistent effects
- **7 Rarity Levels**: From Common to Unique, each with distinct visual styling and power scaling
- **7 Magical Elements**: Aurora, Void, Crystal, Blood, Storm, Flora, and Aether
- **User-friendly Interface**: Beautiful and intuitive UI for easy navigation and gameplay

## Technology Stack

- **Frontend**: React 18+ with TypeScript, Next.js for routing and SSR
- **UI/Styling**: Tailwind CSS for utility-based styling, Framer Motion for animations
- **State Management**: Zustand for global state management
- **AI Integration**: Gemini AI API for image analysis and content generation
- **Storage**: Local storage for persistence in this demo version

## Getting Started

### Prerequisites

- Node.js 16+
- NPM or Yarn

### Installation

1. Clone the repository:

```bash
https://github.com/Eggplant203/CardVerse.git
cd CardVerse
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the game.

## Game Mechanics

### Card Creation

1. Upload any photo to the card creation page
2. The AI will analyze the image and generate appropriate stats and abilities
3. You can customize the card name and review the generated description
4. Save the card to your collection
5. Export cards as JSON files for backup or sharing
6. Import cards from JSON files to restore or share collections

### Gameplay

1. Build a deck from your card collection
2. Play cards strategically on the 6-slot battlefield (3 front, 3 back)
3. Manage your mana resources to deploy powerful cards
4. Use card abilities and positioning to outmaneuver your opponent
5. Reduce your opponent's health to zero to win

### Card Stats

- **Health Points (HP)**: Card's survivability (1-100)
- **Stamina**: Action points for abilities (1-50)
- **Attack Power**: Base damage output (1-50)
- **Defense**: Damage reduction capability (0-25)
- **Speed**: Turn order and initiative (1-20)
- **Mana Cost**: Cost to summon the card (1-10)

### Card Rarity Levels

- **Common**: Basic cards with simple effects
- **Uncommon**: Cards with 1-2 effects and minor secondary effects
- **Rare**: Cards with 2 effects, possibly including passive or trigger effects
- **Epic**: Cards with 2-3 effects combining active and passive mechanics
- **Legendary**: Cards with 2-3 powerful effects with combined mechanics
- **Mythic**: Cards with 2-3 unique effects that may change game rules
- **Unique**: Cards with 2-3 special effects with multiple layers of mechanics

### Card Elements

- **Aurora**: Mystical, rare effects (🌈)
- **Void**: Mysterious dark energy, weakening effects (⚫)
- **Crystal**: Durable power, reflection (💎)
- **Blood**: Sacrifice for power (🩸)
- **Storm**: Speed, chaos, explosive effects (⚡)
- **Flora**: Nature, healing, vitality (🌿)
- **Aether**: Ancient mystical energy, pure magic (🔮)

## Project Structure

The project follows a clear and maintainable structure:

```
src/
├── components/   # React UI components
│   ├── card/     # Card-related components
│   ├── battlefield/  # Battlefield components
│   ├── ui/       # Generic UI components
│   └── layout/   # Layout components
├── data/         # Game data definitions
├── services/     # Core services
│   ├── ai/       # AI image analysis and card generation
│   ├── game/     # Game mechanics and logic
│   ├── api/      # API interaction
│   └── storage/  # Local storage management
├── hooks/        # Custom React hooks
├── utils/        # Utility functions
├── types/        # TypeScript type definitions
├── pages/        # Next.js pages
└── styles/       # Global styles
```

## AI Integration

This game uses the Gemini AI API to analyze images and generate appropriate card stats and descriptions. The API examines the content, colors, mood, and complexity of uploaded images to create cards that match the visual content.

## Future Enhancements

- ✅ **JSON Export/Import**: Cards can be exported and imported as JSON files
- ✅ **Enhanced AI Analysis**: Improved color detection and card generation
- ✅ **7 Rarity Levels**: Complete rarity system from Common to Unique
- ✅ **7 Magical Elements**: Full elemental system with unique effects
- Online multiplayer capabilities
- Advanced AI opponents with different difficulty levels
- Card trading system
- Expanded card effects and abilities
- Mobile application version

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was created for educational purposes
- Special thanks to the Gemini AI team for providing the AI capabilities

## Author

© 2023-2025 - Developed by Eggplant203 🍆
