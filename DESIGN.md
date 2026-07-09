# Pollito Master Design Blueprint

## 1. Current architecture overview

The project is currently an early-stage React + TypeScript + Vite application with a modular shell structure and placeholder feature pages. The app already includes:

- React 19 with TypeScript.
- Vite for development and production builds.
- Material UI for visual components and layout primitives.
- React Router for route-based navigation.
- A feature-oriented folder structure under src with app, components, and feature modules.
- A simple, warm visual language with rounded cards and a mobile-first shell that is now being reoriented toward desktop use.

At this stage, the application is primarily a presentation shell rather than a full product architecture. The main responsibilities are currently split between:

- app shell and routing
- shared UI building blocks
- feature placeholders for Home, Planner, Alarms, and Settings

This is a good foundation for growth, but it should evolve toward a layered architecture before planner functionality is implemented.

## 2. Proposed desktop application architecture

Pollito Master should be treated as a desktop-first product platform with a long-term multi-platform strategy. The architecture should favor:

- clear separation between presentation, domain rules, and infrastructure
- platform-agnostic business logic
- modular feature development
- a design that can later support Android without rewriting core behavior

### Recommended architectural model

Use a layered structure with four major zones:

1. Presentation layer
   - React UI shell
   - desktop layout, panels, navigation, dialogs, forms, charts, and workspace surfaces
   - Material UI design system and theme configuration

2. Application layer
   - feature orchestration
   - view models or lightweight state containers
   - navigation and interaction coordination

3. Domain layer
   - planner entities, scheduling rules, reminders, recurring logic, task state transitions
   - cross-platform business rules
   - validation and pure logic

4. Infrastructure layer
   - persistence adapters
   - storage implementations
   - notifications and background services
   - platform-specific integrations

This keeps the user experience layer flexible while ensuring that planner behavior remains portable and testable.

## 3. Folder organization and responsibilities

The current structure can be expanded into a more explicit architecture.

### Proposed directory layout

```text
src/
  app/
    App.tsx
    AppRouter.tsx
    AppLayout.tsx
    providers/
    routes/
    theme/
  components/
    ui/
      primitives/
      layout/
      feedback/
      forms/
    feature/
  features/
    home/
    planner/
      components/
      hooks/
      pages/
      services/
    alarms/
    settings/
  domain/
    models/
    usecases/
    rules/
    types/
  infrastructure/
    storage/
    persistence/
    notifications/
    sync/
    platform/
  shared/
    utils/
    constants/
    hooks/
    lib/
  styles/
```

### Responsibility breakdown

- app/
  - application bootstrap, global providers, routing, layout shell, theming

- components/ui/
  - reusable visual building blocks such as buttons, cards, panels, drawers, modals, loaders, and typography

- features/
  - feature-specific pages, components, hooks, and services
  - each feature should remain relatively self-contained

- domain/
  - business entities and platform-independent rules
  - planner tasks, recurring schedules, alarms, and state transitions live here

- infrastructure/
  - storage, local persistence, notification adapters, sync logic, and platform bridge code

- shared/
  - common helpers and utilities that are not feature-specific

## 4. UI component hierarchy

The UI should be organized around a desktop shell with a strong information hierarchy.

### Recommended structure

```text
AppShell
  ├── TopBar
  │     ├── ProductBrand
  │     ├── GlobalSearch
  │     └── UserActions
  ├── SidebarNavigation
  │     ├── HomeSection
  │     ├── PlannerSection
  │     ├── AlarmsSection
  │     └── SettingsSection
  └── MainContentArea
        ├── PageHeader
        ├── FeaturePanel
        ├── ContentGrid
        └── DetailPanel
```

### Component guidelines

- Keep layout primitives simple and reusable.
- Prefer composition over large monolithic screens.
- Separate presentational UI from feature state and behavior.
- Use shared containers for cards, panels, tables, and detail surfaces.
- Prepare for a future desktop workspace model where one view can show a main board and a detail inspector side by side.

## 5. Navigation structure

Navigation should now be designed around desktop workflows rather than a mobile tab bar.

### Proposed navigation model

- Home
  - dashboard and overview
  - quick actions
  - recent activity

- Planner
  - day/week/month views
  - task board or calendar-style planning surface
  - task detail and editing workflow

- Alarms
  - reminders and notification management
  - scheduled routines
  - time-based actions

- Settings
  - appearance
  - preferences
  - integrations
  - data and sync controls

### Suggested desktop interaction pattern

- Persistent left or top navigation for primary sections.
- A central workspace area for the selected feature.
- A detail panel for focused content when needed.
- Modal or drawer-based interactions for editing and configuration.

This structure is more appropriate for a desktop-first experience than a bottom navigation pattern.

## 6. Recommended technology stack

The stack should remain modern, maintainable, and suitable for long-term commercial growth.

### Core frontend

- React + TypeScript
- Vite
- Material UI for the component system
- React Router for navigation
- TypeScript strict mode for safer cross-feature development

### Desktop delivery

- A desktop wrapper should be considered for production packaging, such as:
  - Tauri for a lightweight native desktop experience, or
  - Electron if a broader desktop integration surface is needed

The web application should remain the primary implementation surface so the same UI can later be reused in companion experiences.

### State and data

- Prefer a lightweight local state strategy for simple UI concerns.
- Introduce a formal state management layer only when the planner and settings flows become complex.
- Use typed data models and repository-style abstractions for persistence.

### Quality and reliability

- ESLint and TypeScript for static quality checks
- structured testing strategy with unit and integration tests as the product grows
- environment-based configuration for local, desktop, and future mobile builds

## 7. Areas that should remain platform-independent for a future Android companion

To support a future Android app without rewriting core behavior, the following should remain platform-agnostic:

- domain models for tasks, plans, reminders, recurring events, and user preferences
- planner rules and scheduling logic
- validation rules and state transitions
- date and time handling utilities
- notification semantics and reminder definitions
- persistence interfaces and repository contracts
- feature workflows and user journeys
- shared UI content and copy guidelines

These concerns should not be coupled to the web UI implementation. They should live in a shared domain or application layer that both desktop and Android experiences can consume.

## 8. Technical risks and architectural decisions before implementing planner functionality

The planner is the most important feature and should not be implemented until several architectural decisions are made.

### Key risks

- Unclear data model for tasks, subtasks, recurring schedules, and completed states
- Weak boundaries between UI state and domain logic
- No clear persistence strategy for local-first or synced data
- Risk of tightly coupling planner behavior to the web-only UI shell
- Difficulty supporting future Android features if the data layer is not abstracted early

### Decisions to make first

1. Data model strategy
   - Decide whether planner data will be stored as tasks, events, blocks, or a hybrid model.

2. Persistence model
   - Decide whether the app should be local-first, cloud-synced, or hybrid.

3. State management approach
   - Decide whether the app needs a dedicated store, reducer pattern, or an event-driven model.

4. Notification architecture
   - Decide how reminders and alarms will be scheduled and whether they are desktop-only or shared with future mobile experiences.

5. Sync and offline behavior
   - Decide how planner data behaves when the app is offline or when the desktop app restarts.

6. Cross-platform data contracts
   - Define a stable contract for planner entities so Android and desktop clients can use the same domain rules.

7. UI composition model
   - Decide whether planner views should be built as reusable panels, widgets, or full-page editors.

8. Theme and layout system
   - Decide whether the desktop experience will be panel-based, workspace-based, or dashboard-driven.

## Recommended next steps

Before implementation begins, the project should focus on:

- formalizing the domain model for planner data
- defining shared interfaces for storage and notifications
- establishing a reusable desktop shell and navigation pattern
- separating business logic from UI components
- preparing a platform-independent foundation for future Android support

This will ensure that planner functionality is added in a way that is maintainable, extensible, and suitable for a long-term commercial product.
