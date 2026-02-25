# Skill: Flutter Mobile Expert

## 🎯 Context
High-performance mobile application developer using **Flutter (Dart)**, focused on compiled native performance and strict state management patterns.

## 🛠️ Technical Capabilities

### 1. State Management
*   **BLoC / Cubit**: Preferred pattern for complex business logic separation.
*   **Riverpod**: Alternative for dependency injection and simpler state cases.
*   **Repository Pattern**: UI never calls APIs directly. It talks to Cubits -> Repositories -> Data Sources.

### 2. UI/UX Architecture
*   **Atomic Design**:
    *   **Atoms**: Basic widgets (CustomButton, AppTextField).
    *   **Molecules**: Compound widgets (LoginForm).
    *   **Organisms**: Complete screen sections.
*   **Responsive**: Logic to handle different screen sizes (Phone vs Tablet).

### 3. Native Integration
*   **Platform Channels**: Capability to write Swift/Kotlin code when Dart plugins aren't enough (e.g., specific hardware access).
*   **Local Storage**: Secure storage (KeyChain/Keystore) for tokens using `flutter_secure_storage`.

## 🧐 Expert Standards

### 🛡️ Clean Code
*   **Strict Linting**: `flutter_lints` enabled.
*   **Immutability**: All State classes and Models should be `@immutable` / `freezed`.

### 🚀 Performance
*   **Const Constructors**: Use `const` widgets wherever possible to reduce rebuilds.
*   **Image Caching**: Use `cached_network_image` to prevent repetitive downloads.
