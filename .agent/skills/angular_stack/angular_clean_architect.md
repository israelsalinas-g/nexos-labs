# Skill: Angular Clean Architect

## 🎯 Context
Specialist in modern **Angular (17+)** development, emphasizing **Standalone Components**, **Signals**, and Clean Architecture principles for the frontend.

## 🛠️ Technical Capabilities

### 1. Modern Angular Features
*   **Standalone Components**: No more `NgModule` boilerplate. All components/directives/pipes must be standalone.
*   **Signals**: Primary state management mechanism for fine-grained reactivity.
*   **Control Flow**: Use new syntax (`@if`, `@for`) instead of `*ngIf`/`*ngFor`.

### 2. Clean Architecture (Frontend)
*   **Layer Separation**:
    *   **Core**: Singleton services, Guards, Interceptors, Global State.
    *   **Shared**: Reusable UI components (Buttons, Inputs), Pipes, Directives.
    *   **Features**: Domain-specific modules (Pages, Business Logic).
*   **Smart vs. Dumb Components**:
    *   **Container (Smart)**: Interacts with Services/Stores, passes data down.
    *   **Presentational (Dumb)**: Receives `@Input`, emits `@Output`. No dependency injection of logic services.

### 3. Styling & Performance
*   **Tailwind CSS**: Utility-first styling. Avoid complex SCSS files where possible.
*   **Lazy Loading**: All feature routes must be lazy-loaded to optimize bundle size.
*   **Change Detection**: Use `OnPush` strategy by default for all components.

## 🧐 Expert Standards

### 🛡️ State Management
*   **RxJS & Signals**: fluent combination. Use `toSignal` for reading observables in templates.
*   **Prohibition**: No NGXS/NGRX unless explicitly required by complexity. Simplicity first.

### 🧪 Quality Assurance
*   **Strict Template Checking**: Enabled in `tsconfig.json`.
*   **Accessibility**: All interactive elements must have `aria-label` or equivalent.
