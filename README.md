# AimTrainer

![AimTrainer Logo](https://github.com/user-attachments/assets/56f25c82-5f7c-4374-9557-e8854b914985)

A work-in-progress demo app exploring physics, Next.js, Three.js, and WebGL integration.

## Overview

AimTrainer is an interactive 3D aim training game built with Next.js.
It features floating targets for players to shoot, basic physics, and 3D graphics.

![Gameplay Screenshot](https://github.com/user-attachments/assets/e3352ef0-29e2-4836-ab39-86f5f6df3470)

## Tech Stack

- Next.js
- React
- Three.js
- WebGL
- Tailwind CSS

![Tech Stack Visualization](https://github.com/user-attachments/assets/98141c75-1b32-4068-b5a8-7b70f4465d60)

## Project Structure

- `src/app`: Core Next.js app files and API routes
- `src/components`: Reusable UI and game components
- `src/systems`: Core game systems (physics, AI, weapons)
- `src/hooks`: Custom React hooks for shared logic
- `src/services`: API and game services
- `src/utils`: Utility functions and helpers
- `public`: Static assets (3D models, textures, sounds)

## Features

- 3D environment with floating targets
- First-person shooter mechanics
- Basic physics simulation
- Responsive user interface
- Performance optimization for smooth gameplay

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables: `cp .env.example .env.local` and edit as needed
4. Start the development server: `npm run dev`
5. Open http://localhost:3000 in your browser

## Contributing

Issues and pull requests are welcome. Please refer to our contributing guidelines for more information.

## Roadmap

Some planned features and improvements for AimTrainer:

### Weapon System Improvements

- [x] Implement basic weapon functionality
- [x] Add multiple weapon types (e.g., pistol, rifle, sniper)
- [ ] Design and implement blood splatter effects
- [ ] Implement weapon recoil and spread patterns
- [ ] Create a weapon upgrade system

### Multiplayer Support

- [ ] Integrate Socket.io for real-time communication
- [ ] Develop a lobby system for matchmaking
- [ ] Implement multiplayer game modes (e.g., team deathmatch, capture the flag)

### Enhanced Graphics and Performance

- [x] Implement basic 3D graphics with Three.js
- [x] Create a basic performance optimization system
- [ ] Optimize rendering for better performance on low-end devices
- [x] Add advanced lighting and shadow effects
- [ ] Implement level of detail (LOD) system for complex objects

### User Experience and Accessibility

- [x] Implement basic UI components (HUD, menus)
- [x] Create a settings modal for basic customization
- [x] Implement a basic colorblind mode
- [ ] Improve colorblind mode options
- [ ] Add customizable keybindings
- [ ] Implement a tutorial system for new players

### Game Modes and Progression

- [x] Implement basic target system
- [ ] Create various training scenarios (e.g., moving targets, time trials)
- [ ] Develop a progression system with unlockable content
- [ ] Implement daily challenges and leaderboards

### Audio

- [x] Implement basic audio management
- [ ] Add immersive sound effects for weapons, impacts, and environment
- [ ] Implement 3D audio for better spatial awareness
- [ ] Create a dynamic music system that responds to gameplay intensity

### AI and NPC Behavior

- [x] Implement basic NPC functionality
- [ ] Develop advanced AI for dynamic NPC behavior
- [ ] Create different difficulty levels for AI opponents
- [ ] Implement AI-powered training scenarios

### Code Quality and Testing

- [x] Set up basic project structure with TypeScript
- [x] Implement basic state management
- [ ] Develop comprehensive unit test suite
- [ ] Implement integration tests for core game systems
- [ ] Set up end-to-end testing for critical user flows

### Performance Optimization

- [x] Implement basic performance monitoring
- [ ] Optimize asset loading and management
- [ ] Implement advanced caching strategies
- [ ] Develop performance profiling tools for ongoing optimization

### Community and Social Features

- [ ] Implement user profiles and statistics
- [ ] Develop a friend system and social interactions
