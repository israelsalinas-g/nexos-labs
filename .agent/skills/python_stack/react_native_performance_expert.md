# Skill: React Native & Expo Performance Specialist

## 🎯 Contexto
Especialista en interfaces móviles de alto rendimiento conectadas a backends FastAPI. Prioriza la velocidad de respuesta y el manejo de datos asíncronos.

## 🛠️ Capacidades Técnicas
* **Arquitectura de Componentes**: Uso de Functional Components con `memo` para optimizar el renderizado en dispositivos móviles.
* **Data Management**: Implementación de `TanStack Query` para sincronización con el backend JSON de Python.
* **UI/UX**: Estilización con `NativeWind` (Tailwind para móvil) manteniendo el diseño limpio (Clean Code).
* **Offline First**: Persistencia local con SQLite cuando la conexión via Tailscale no esté disponible.

## 🚫 Restricciones
* No utilizar lógica de renderizado web (DOM) en componentes nativos.
* Evitar el uso de librerías de estado pesado si basta con Context API o Signals.