# LisDymindFe

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Theming & Dark Mode

- Global design tokens (colors, typography, spacing) now live under CSS variables declared in `src/styles.css`. Override these variables to brand the application without touching component styles.
- The active theme is stored on the `<html>` element via the `data-theme` attribute (`light` or `dark`). Update that attribute or call the `ThemeService` to switch modes programmatically.
- A user-facing toggle is exposed in the header; it persists the preference in `localStorage` and also respects the OS-level `prefers-color-scheme` when no explicit choice exists.
- When building new components, reference the shared variables (e.g., `var(--color-surface)`, `var(--color-text-muted)`) instead of hard-coded values to keep light/dark support automatic.

## Accessibility Enhancements

- Header controls now expose `aria-label`, `aria-pressed`, and `aria-expanded` metadata, and sidebar navigation buttons announce their expanded/active state for screen readers.
- Modals (change password/avatar) render with semantic `role="dialog"`, trap keyboard focus, close on <kbd>Esc</kbd>, and surface validation feedback through `role="alert"` regions.
- Avatar galleries behave like radio groups so users can move through options with the keyboard; list/grid buttons advertise their selection via `aria-checked`.
- Global button/anchor focus styles plus higher-contrast surfaces ensure sighted keyboard users can track focus without custom CSS per component.
