# Implementación de Cambio de Avatar y Contraseña

## Resumen

Esta documentación describe la implementación completa de la funcionalidad para cambiar el avatar del usuario y la contraseña desde el componente header del sistema.

## Fecha de Implementación

30 de Octubre, 2025

## Componentes Implementados

### 1. Servicio de Usuarios (`user.service.ts`)

Se agregó el método `getAvailableAvatars()` para obtener los avatares disponibles desde el backend:

```typescript
/**
 * Obtener avatares disponibles
 * Obtiene la lista de avatares almacenados en el backend
 */
getAvailableAvatars(): Observable<string[]> {
  return this.http.get<string[]>(`${this.API_URL}/avatars/available`)
    .pipe(catchError(this.handleError));
}
```

El método `changeAvatar()` ya existía para enviar la selección del avatar al backend:

```typescript
/**
 * Cambiar avatar del usuario
 * El usuario puede cambiar su propio avatar
 * @param id - ID del usuario
 * @param avatarData - Objeto con la URL del avatar seleccionado
 */
changeAvatar(id: string, avatarData: ChangeAvatarRequest): Observable<User> {
  return this.http.post<User>(`${this.API_URL}/${id}/avatar`, avatarData)
    .pipe(catchError(this.handleError));
}
```

### 2. Servicio de Autenticación (`auth.service.ts`)

El método `changePassword()` ya existía para cambiar la contraseña:

```typescript
/**
 * Cambiar contraseña
 */
changePassword(request: ChangePasswordRequest): Observable<MessageResponse> {
  return this.http.post<MessageResponse>(`${this.API_URL}/auth/change-password`, request)
    .pipe(catchError(this.handleError));
}
```

### 3. Componente de Cambio de Avatar (`change-avatar-dialog.component.ts`)

**Cambios Principales:**

1. **Eliminación de funcionalidad de carga de archivos externos**: Ya no se permite subir imágenes desde el sistema de archivos local ni desde URLs externas.

2. **Galería de avatares del backend**: Se implementó una galería visual donde el usuario puede seleccionar entre los avatares disponibles en el backend.

3. **Vista previa en tiempo real**: El avatar seleccionado se muestra en una vista previa antes de guardarlo.

4. **Indicador de avatar actual**: El avatar que el usuario tiene actualmente se marca con un badge "Actual".

5. **Indicador de avatar seleccionado**: El avatar seleccionado se resalta con un overlay y un check.

**Características:**

- Carga automática de avatares disponibles al abrir el diálogo
- Estado de carga mientras se obtienen los avatares
- Validación para evitar seleccionar el mismo avatar actual
- Actualización automática del avatar en el header sin recargar la página
- Diseño responsivo con grid adaptable
- Animaciones suaves y transiciones
- Manejo de errores y mensajes de éxito

**Estados del Componente:**

```typescript
isLoading = signal(false);              // Estado de guardado
isLoadingAvatars = signal(false);       // Estado de carga de avatares
errorMessage = signal('');              // Mensajes de error
successMessage = signal('');            // Mensajes de éxito
selectedAvatar = signal('');            // Avatar seleccionado
currentAvatar = signal('');             // Avatar actual del usuario
availableAvatars = signal<string[]>([]); // Lista de avatares disponibles
```

**Flujo de Funcionamiento:**

1. Al abrir el diálogo, se carga el avatar actual del usuario desde `AuthService`
2. Se hace una petición a `/users/avatars/available` para obtener los avatares disponibles
3. El usuario selecciona un avatar de la galería
4. Al guardar, se envía una petición POST a `/users/{id}/avatar` con el avatar seleccionado
5. Si es exitoso, se actualiza el localStorage y se emite un evento `avatarUpdated`
6. El header escucha este evento y actualiza el avatar automáticamente
7. El diálogo se cierra después de 1 segundo

### 4. Componente de Cambio de Contraseña (`change-password-dialog.component.ts`)

**Características:**

- Formulario con tres campos:
  - Contraseña actual
  - Nueva contraseña
  - Confirmar nueva contraseña
- Validaciones:
  - Todos los campos son requeridos
  - La nueva contraseña debe tener mínimo 6 caracteres
  - La confirmación debe coincidir con la nueva contraseña
- Mensajes de error y éxito en tiempo real
- Deshabilita el botón de envío si las validaciones no pasan
- Cierra automáticamente después de cambiar la contraseña exitosamente

**Flujo de Funcionamiento:**

1. El usuario ingresa su contraseña actual
2. Ingresa y confirma la nueva contraseña
3. Al enviar, se valida que las contraseñas coincidan
4. Se envía una petición POST a `/auth/change-password`
5. Si es exitoso, se muestra mensaje de éxito y se cierra el diálogo
6. Si falla, se muestra el mensaje de error del backend

### 5. Componente Header (`header.component.ts`)

**Actualizaciones:**

Se agregó un listener para el evento `avatarUpdated` que permite actualizar el avatar en el header sin recargar la página:

```typescript
// Listener para actualizar avatar
this.avatarUpdatedListener = ((event: CustomEvent) => {
  if (this.currentUser && event.detail?.avatar) {
    this.currentUser = { ...this.currentUser, avatar: event.detail.avatar };
  }
}) as EventListener;
window.addEventListener('avatarUpdated', this.avatarUpdatedListener);
```

El header también maneja los diálogos usando signals:

```typescript
showChangePasswordDialog = signal(false);
showChangeAvatarDialog = signal(false);
```

## Endpoints del Backend Utilizados

### 1. Obtener Avatares Disponibles
```
GET /users/avatars/available
```
**Respuesta:** Array de strings con las URLs de los avatares

### 2. Seleccionar Avatar
```
POST /users/{id}/avatar
```
**Body:**
```json
{
  "avatar": "URL_del_avatar_seleccionado"
}
```
**Respuesta:** Objeto User actualizado

### 3. Cambiar Contraseña
```
POST /auth/change-password
```
**Body:**
```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña"
}
```
**Respuesta:** Mensaje de éxito

## Interfaces Utilizadas

### ChangeAvatarRequest
```typescript
export interface ChangeAvatarRequest {
  avatar: string;
}
```

### ChangePasswordRequest
```typescript
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

## Estilos y Diseño

### Componente de Cambio de Avatar

**Características de diseño:**

- Header con gradiente púrpura (`#667eea` a `#764ba2`)
- Vista previa circular del avatar con borde de 4px y sombra
- Grid responsivo de avatares con `auto-fill` y `minmax(80px, 1fr)`
- Scroll personalizado para la galería de avatares
- Efectos hover con transformación scale(1.05)
- Overlay de selección con check animado
- Badge "Actual" con gradiente verde para el avatar en uso
- Animaciones suaves para todas las transiciones
- Diseño responsivo que se adapta a móviles (70px en pantallas pequeñas)

### Componente de Cambio de Contraseña

**Características de diseño:**

- Diseño limpio con campos de formulario bien espaciados
- Validación visual con mensajes de alerta
- Estados disabled durante la carga
- Botones con estados hover y disabled
- Mensaje de advertencia si las contraseñas no coinciden
- Diseño responsivo para móviles

## Flujo de Eventos

### Evento `avatarUpdated`

Cuando el usuario guarda un nuevo avatar, se emite un evento personalizado:

```typescript
window.dispatchEvent(new CustomEvent('avatarUpdated', { 
  detail: { avatar: response.avatar } 
}));
```

Este evento es escuchado por el header para actualizar la UI sin recargar:

```typescript
this.avatarUpdatedListener = ((event: CustomEvent) => {
  if (this.currentUser && event.detail?.avatar) {
    this.currentUser = { ...this.currentUser, avatar: event.detail.avatar };
  }
}) as EventListener;
window.addEventListener('avatarUpdated', this.avatarUpdatedListener);
```

### Evento `closeDialog`

Ambos diálogos emiten este evento para cerrarse:

```typescript
const closeEvent = new CustomEvent('closeDialog');
window.dispatchEvent(closeEvent);
```

El header escucha este evento para actualizar los signals:

```typescript
this.dialogCloseListener = () => {
  this.showChangePasswordDialog.set(false);
  this.showChangeAvatarDialog.set(false);
};
window.addEventListener('closeDialog', this.dialogCloseListener);
```

## Seguridad

### Cambio de Avatar

- Solo el usuario autenticado puede cambiar su propio avatar
- Los avatares están almacenados en el backend, no se permiten URLs externas
- Se valida que el avatar seleccionado exista en la lista disponible

### Cambio de Contraseña

- Se requiere la contraseña actual para validar la identidad
- La nueva contraseña debe tener mínimo 6 caracteres
- La contraseña se envía de forma segura al backend
- El backend valida que la contraseña actual sea correcta

## Manejo de Errores

Ambos componentes implementan un manejo robusto de errores:

1. **Errores de red**: Se capturan y muestran mensajes amigables
2. **Validaciones del frontend**: Se muestran antes de enviar al backend
3. **Errores del backend**: Se extraen y muestran los mensajes del servidor
4. **Estados de carga**: Se deshabilitan los botones durante las operaciones

## Limpieza de Recursos

Ambos componentes implementan `ngOnDestroy` para limpiar los event listeners:

```typescript
ngOnDestroy(): void {
  if (this.dialogCloseListener) {
    window.removeEventListener('closeDialog', this.dialogCloseListener);
  }
  if (this.avatarUpdatedListener) {
    window.removeEventListener('avatarUpdated', this.avatarUpdatedListener);
  }
}
```

## Integración con el Sistema

### Menú del Header

Los diálogos se abren desde el menú dropdown del header:

```typescript
<button class="dropdown-item" (click)="openChangeAvatarDialog()">
  <span class="item-icon">🖼️</span>
  <span>Cambiar Avatar</span>
</button>
<button class="dropdown-item" (click)="openChangePasswordDialog()">
  <span class="item-icon">🔒</span>
  <span>Cambiar Contraseña</span>
</button>
```

### Actualización del LocalStorage

Cuando se cambia el avatar, se actualiza el localStorage para mantener la persistencia:

```typescript
const updatedUser = { ...currentUser, avatar: response.avatar };
localStorage.setItem('current_user', JSON.stringify(updatedUser));
```

## Pruebas Recomendadas

### Cambio de Avatar

1. Abrir el diálogo desde el menú del header
2. Verificar que se cargan los avatares disponibles
3. Verificar que el avatar actual se marca correctamente
4. Seleccionar un nuevo avatar
5. Verificar la vista previa
6. Guardar y verificar que se actualiza el header
7. Verificar que el botón está deshabilitado si se selecciona el avatar actual

### Cambio de Contraseña

1. Abrir el diálogo desde el menú del header
2. Ingresar la contraseña actual incorrecta y verificar el error
3. Ingresar contraseñas que no coinciden y verificar la advertencia
4. Ingresar una contraseña menor a 6 caracteres y verificar el error
5. Cambiar la contraseña correctamente y verificar el mensaje de éxito
6. Cerrar sesión y verificar que se puede iniciar con la nueva contraseña

## Archivos Modificados/Creados

1. **`src/app/services/user.service.ts`** - Agregado método `getAvailableAvatars()`
2. **`src/app/shared/change-avatar-dialog.component.ts`** - Reescrito completamente
3. **`src/app/shared/header.component.ts`** - Agregado listener `avatarUpdated`
4. **`docs/AVATAR_PASSWORD_CHANGE_IMPLEMENTATION.md`** - Documentación nueva

## Notas Adicionales

- Los componentes usan Angular Signals para la reactividad
- Los diálogos son standalone components
- El diseño es completamente responsivo
- Las animaciones mejoran la experiencia del usuario
- El código está bien documentado con comentarios JSDoc
- Se siguen las mejores prácticas de Angular 18+

## Conclusión

La implementación está completa y lista para ser utilizada. Los usuarios pueden cambiar su avatar seleccionando de una galería de avatares predefinidos en el backend, y pueden cambiar su contraseña de forma segura con validaciones en el frontend y backend.
