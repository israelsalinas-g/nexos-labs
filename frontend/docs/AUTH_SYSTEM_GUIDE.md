# 🔐 Sistema de Autenticación y Gestión de Roles - Guía de Implementación Frontend

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Estructura del Sistema](#estructura-del-sistema)
3. [Configuración](#configuración)
4. [Uso de Servicios](#uso-de-servicios)
5. [Protección de Rutas](#protección-de-rutas)
6. [Componentes Implementados](#componentes-implementados)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

Se ha implementado un sistema completo de autenticación basado en JWT (JSON Web Tokens) con gestión de roles y permisos. El sistema incluye:

- ✅ Login/Logout
- ✅ Gestión de sesiones con localStorage
- ✅ Interceptor HTTP para tokens JWT
- ✅ Guards para protección de rutas
- ✅ Control de acceso basado en roles
- ✅ Gestión de usuarios, roles y permisos

---

## 📁 Estructura del Sistema

### Models/Interfaces

```
src/app/models/
├── auth.interface.ts       # Interfaces de autenticación
├── user.interface.ts       # Interfaces de usuarios
├── role.interface.ts       # Interfaces de roles
└── permission.interface.ts # Interfaces de permisos
```

### Enums

```
src/app/enums/
└── role.enums.ts          # Definición de roles del sistema
```

### Services

```
src/app/services/
├── auth.service.ts        # Servicio de autenticación
├── user.service.ts        # Servicio de gestión de usuarios
├── role.service.ts        # Servicio de gestión de roles
└── auth.interceptor.ts    # Interceptor HTTP para tokens
```

### Guards

```
src/app/guards/
└── auth.guard.ts          # Guards de protección de rutas
```

### Componentes

```
src/app/components/
├── auth/
│   ├── login.component.ts         # Componente de login
│   └── unauthorized.component.ts  # Página de acceso denegado
└── users/
    └── user-list.component.ts     # Lista de usuarios
```

---

## ⚙️ Configuración

### 1. Configuración de Interceptor

El interceptor ya está configurado en `app.config.ts`:

```typescript
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withInterceptorsFromDi()
    ),
    // ... otros providers
  ]
};
```

### 2. Roles Disponibles

```typescript
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',  // Nivel 1 - Acceso total
  ADMIN = 'ADMIN',            // Nivel 2 - Administrativo
  TECNICO = 'TECNICO',        // Nivel 3 - Técnico
  OPERADOR = 'OPERADOR'       // Nivel 4 - Lectura
}
```

---

## 🔧 Uso de Servicios

### AuthService

#### Iniciar Sesión

```typescript
import { AuthService } from './services/auth.service';

constructor(private authService: AuthService) {}

login() {
  const credentials = {
    username: 'superadmin',
    password: 'admin123'
  };

  this.authService.login(credentials).subscribe({
    next: (response) => {
      console.log('Login exitoso:', response.user);
      // El servicio automáticamente guarda el token y el usuario
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      console.error('Error en login:', error.message);
    }
  });
}
```

#### Cerrar Sesión

```typescript
logout() {
  this.authService.logout();
  // Automáticamente limpia el token y redirige a /login
}
```

#### Obtener Usuario Actual

```typescript
// Como Observable (reactivo)
this.authService.currentUser$.subscribe(user => {
  console.log('Usuario actual:', user);
});

// Como valor directo
const user = this.authService.getCurrentUserValue();
```

#### Verificar Autenticación

```typescript
// Verificar si está autenticado
if (this.authService.isAuthenticated()) {
  console.log('Usuario autenticado');
}

// Verificar si tiene un rol específico
if (this.authService.hasRole('SUPERADMIN')) {
  console.log('Es superadmin');
}

// Verificar si tiene alguno de varios roles
if (this.authService.hasAnyRole(['ADMIN', 'SUPERADMIN'])) {
  console.log('Es administrador');
}

// Verificar nivel de rol
if (this.authService.hasRoleLevel(2)) {
  console.log('Tiene nivel de ADMIN o superior');
}
```

#### Cambiar Contraseña

```typescript
changePassword() {
  const request = {
    currentPassword: 'old_password',
    newPassword: 'new_password'
  };

  this.authService.changePassword(request).subscribe({
    next: (response) => {
      console.log('Contraseña cambiada:', response.message);
    },
    error: (error) => {
      console.error('Error:', error.message);
    }
  });
}
```

### UserService

#### Listar Usuarios

```typescript
import { UserService } from './services/user.service';

loadUsers() {
  this.userService.getUsers(1, 10).subscribe({
    next: (response) => {
      console.log('Usuarios:', response.data);
      console.log('Total:', response.total);
      console.log('Páginas:', response.totalPages);
    }
  });
}
```

#### Crear Usuario

```typescript
createUser() {
  const userData = {
    username: 'nuevo_usuario',
    password: 'Password123!',
    name: 'Juan',
    lastName: 'Pérez',
    email: 'juan@lab.com',
    roleId: 'uuid-del-rol',
    isActive: true
  };

  this.userService.createUser(userData).subscribe({
    next: (user) => {
      console.log('Usuario creado:', user);
    }
  });
}
```

#### Actualizar Usuario

```typescript
updateUser(userId: string) {
  const updates = {
    name: 'Juan Carlos',
    email: 'nuevo@email.com'
  };

  this.userService.updateUser(userId, updates).subscribe({
    next: (user) => {
      console.log('Usuario actualizado:', user);
    }
  });
}
```

#### Activar/Desactivar Usuario

```typescript
toggleUserStatus(userId: string) {
  this.userService.toggleActive(userId).subscribe({
    next: (response) => {
      console.log(response.message);
    }
  });
}
```

### RoleService

#### Listar Roles

```typescript
import { RoleService } from './services/role.service';

loadRoles() {
  this.roleService.getRoles(1, 10).subscribe({
    next: (response) => {
      console.log('Roles:', response.data);
    }
  });
}
```

#### Obtener Permisos de un Rol

```typescript
getRolePermissions(roleId: string) {
  this.roleService.getRolePermissions(roleId).subscribe({
    next: (permissions) => {
      console.log('Permisos del rol:', permissions);
    }
  });
}
```

---

## 🛡️ Protección de Rutas

### Uso Básico del Guard

En `app.routes.ts`:

```typescript
import { authGuard, loginGuard } from './guards/auth.guard';
import { UserRole } from './enums/role.enums';

export const routes: Routes = [
  // Ruta pública de login
  { 
    path: 'login',
    canActivate: [loginGuard], // Redirige a dashboard si ya está autenticado
    loadComponent: () => import('./components/auth/login.component')
  },

  // Ruta protegida básica (solo requiere autenticación)
  { 
    path: 'dashboard',
    canActivate: [authGuard], // Requiere estar autenticado
    loadComponent: () => import('./components/dashboard/dashboard.component')
  },

  // Ruta con roles específicos requeridos
  {
    path: 'users',
    canActivate: [authGuard],
    data: { roles: [UserRole.ADMIN, UserRole.SUPERADMIN] }, // Solo ADMIN y SUPERADMIN
    loadComponent: () => import('./components/users/user-list.component')
  },

  // Ruta con nivel de rol mínimo
  {
    path: 'settings',
    canActivate: [authGuard],
    data: { minRoleLevel: 2 }, // Requiere nivel 2 o menor (ADMIN o SUPERADMIN)
    loadComponent: () => import('./components/settings.component')
  }
];
```

### Redirecciones del Guard

- Si el usuario **no está autenticado**: Redirige a `/login`
- Si el usuario **no tiene permisos**: Redirige a `/unauthorized`
- Si el **token está expirado**: Cierra sesión y redirige a `/login`

---

## 🎨 Componentes Implementados

### 1. LoginComponent

**Ruta:** `/login`

Componente de inicio de sesión con formulario de usuario y contraseña.

**
