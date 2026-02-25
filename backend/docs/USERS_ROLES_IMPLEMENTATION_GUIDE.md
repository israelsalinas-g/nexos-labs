# 🔐 Guía de Implementación: Sistema de Usuarios y Roles

## 1. Arquitectura General

### Estructura de Entidades

```
User (1)──→ Role (1)
     │
     └─→ createdBy [User]
        updatedBy [User]

Role (1)──→ Permissions (Many)
```

### Roles Predefinidos

| Rol | Nivel | Permisos |
|-----|-------|----------|
| **SUPERADMIN** | 1 (máximo) | Acceso total: crear usuarios, roles, auditoría, eliminar datos |
| **ADMIN** | 2 | Gestión de test-definitions, test-sections, perfiles, auditoría, crear técnicos/operadores |
| **TECNICO** | 3 | Crear/actualizar exámenes, ver resultados, generar reportes |
| **OPERADOR** | 4 (mínimo) | Solo lectura: consultar exámenes, pacientes, resultados |

---

## 2. Modelos de Datos

### 2.1 Entidad: Role

```typescript
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: 'SUPERADMIN' | 'ADMIN' | 'TECNICO' | 'OPERADOR';

  @Column({ type: 'int' })
  level: number; // 1 = SUPERADMIN, 4 = OPERADOR

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => User, user => user.role)
  users: User[];

  @OneToMany(() => Permission, perm => perm.role)
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 2.2 Entidad: User

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ length: 255 })
  password: string; // bcrypt hashed

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @ManyToOne(() => Role, role => role.users)
  role: Role;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 2.3 Entidad: Permission

```typescript
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  code: string; // e.g., 'CREATE_USER', 'DELETE_TEST', etc.

  @Column({ length: 200 })
  description: string;

  @ManyToOne(() => Role, role => role.permissions)
  role: Role;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 3. Autenticación JWT

### 3.1 Flujo de Login

```
POST /auth/login
├─ Validar username existe
├─ Verificar password (bcrypt)
├─ Generar JWT con payload { sub, username, role, iat, exp }
└─ Retornar { accessToken, refreshToken?, user }
```

### 3.2 JWT Payload

```json
{
  "sub": "uuid-del-usuario",
  "username": "tecnico01",
  "email": "tecnico@lab.com",
  "role": "TECNICO",
  "roleLevel": 3,
  "iat": 1729790000,
  "exp": 1729793600
}
```

### 3.3 Protección de Rutas

```typescript
// Sin decorador: pública
GET /auth/login

// Con @UseGuards(JwtAuthGuard): requiere token válido
@UseGuards(JwtAuthGuard)
@Get('test-definitions')

// Con @Roles('ADMIN', 'SUPERADMIN'): requiere rol específico
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
@Delete('users/:id')
```

---

## 4. Decisiones de Diseño

### ¿Por qué ManyToOne(User → Role) y no ManyToMany?

**Opción 1: ManyToOne (RECOMENDADO) ✅**
```typescript
@ManyToOne(() => Role, role => role.users)
role: Role; // Un usuario = Un rol
```
- ✅ Más simple y performante
- ✅ Cubre el 95% de casos: cada usuario tiene UN rol definido
- ✅ Si necesitas multi-rol después, es fácil migrar a ManyToMany

**Opción 2: ManyToMany**
```typescript
@ManyToMany(() => Role)
@JoinTable()
roles: Role[]; // Un usuario = Múltiples roles
```
- ✅ Flexible
- ❌ Más complejo
- ❌ Consumo de memoria (tabla intermedia)
- ❌ Validaciones más complejas (¿qué pasa si asignas SUPERADMIN + OPERADOR?)

**Conclusión:** Usamos ManyToOne. Si en el futuro necesitas multi-rol, es una migración de 2 horas.

---

## 5. Seguridad

### 5.1 Hashing de Contraseña

```typescript
// Crear usuario
password = await bcrypt.hash(plainPassword, 10); // 10 rounds

// Login
isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### 5.2 Validaciones de Negocio

```typescript
// ❌ Un OPERADOR NO puede crear otros OPERADORES
if (currentUser.role.level > roleToAssign.level) {
  throw new ForbiddenException('Permisos insuficientes');
}

// ✅ Un ADMIN puede crear TECNICO u OPERADOR
// ✅ Un SUPERADMIN puede crear cualquier rol
```

### 5.3 Auditoría

```typescript
// Tracking automático de quién creó/modificó
@ManyToOne(() => User)
createdBy: User;

@ManyToOne(() => User)
updatedBy: User;

// En servicio:
user.createdBy = currentUser;
user.updatedBy = currentUser;
```

---

## 6. Endpoints Propuestos

### 6.1 Autenticación (Públicos)

```
POST   /auth/login              → { accessToken, user }
POST   /auth/refresh            → { accessToken }
GET    /auth/me                 → User actual (protegido)
POST   /auth/logout             → { message }
```

### 6.2 Gestión de Usuarios (Protegido)

```
POST   /users                   → Crear (ADMIN/SUPERADMIN)
GET    /users                   → Listar (ADMIN/SUPERADMIN)
GET    /users/:id               → Obtener
PATCH  /users/:id               → Actualizar (propio o ADMIN)
DELETE /users/:id               → Eliminar (SUPERADMIN)
PATCH  /users/:id/toggle-active → Activar/Desactivar (ADMIN)
PATCH  /users/:id/change-password → Cambiar contraseña (propio)
```

### 6.3 Gestión de Roles (Protegido)

```
POST   /roles                   → Crear (SUPERADMIN)
GET    /roles                   → Listar (ADMIN/SUPERADMIN)
GET    /roles/:id               → Obtener
PATCH  /roles/:id               → Actualizar (SUPERADMIN)
DELETE /roles/:id               → Eliminar (SUPERADMIN)
POST   /roles/:id/permissions   → Asignar permisos (SUPERADMIN)
```

---

## 7. Archivos a Crear

```
src/
├── entities/
│   ├── user.entity.ts          (NUEVO)
│   ├── role.entity.ts          (NUEVO)
│   └── permission.entity.ts    (NUEVO)
├── features/
│   ├── auth/
│   │   ├── auth.controller.ts  (NUEVO)
│   │   ├── auth.service.ts     (NUEVO)
│   │   ├── auth.module.ts      (NUEVO)
│   │   └── strategies/
│   │       └── jwt.strategy.ts (NUEVO)
│   ├── users/
│   │   ├── users.controller.ts (NUEVO)
│   │   ├── users.service.ts    (NUEVO)
│   │   ├── users.module.ts     (NUEVO)
│   └── roles/
│       ├── roles.controller.ts (NUEVO)
│       ├── roles.service.ts    (NUEVO)
│       └── roles.module.ts     (NUEVO)
├── dto/
│   ├── create-user.dto.ts      (NUEVO)
│   ├── update-user.dto.ts      (NUEVO)
│   ├── login.dto.ts            (NUEVO)
│   ├── create-role.dto.ts      (NUEVO)
│   └── create-permission.dto.ts (NUEVO)
├── guards/
│   ├── jwt-auth.guard.ts       (NUEVO)
│   └── roles.guard.ts          (NUEVO)
├── decorators/
│   ├── roles.decorator.ts      (NUEVO)
│   └── current-user.decorator.ts (NUEVO)
└── common/
    ├── enums/
    │   └── role.enum.ts        (NUEVO)
    └── interfaces/
        └── jwt-payload.interface.ts (NUEVO)
```

---

## 8. Dependencias a Instalar

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/bcrypt @types/passport-jwt
```

---

## 9. Ejemplo de Flujo Completo

### Step 1: Crear usuario SUPERADMIN (seed inicial)

```typescript
// En app.module.ts o migration
async setupInitialData() {
  const role = await this.roleRepository.save({
    name: 'SUPERADMIN',
    level: 1,
    description: 'Acceso total'
  });

  await this.userRepository.save({
    username: 'admin',
    password: await bcrypt.hash('admin123', 10),
    name: 'Admin',
    lastName: 'System',
    email: 'admin@lab.com',
    role: role,
    isActive: true
  });
}
```

### Step 2: Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "SUPERADMIN"
  }
}
```

### Step 3: Crear usuario TECNICO

```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tecnico01",
    "password": "tecnico123",
    "name": "Juan",
    "lastName": "Pérez",
    "email": "tecnico@lab.com",
    "roleId": "role-tecnico-uuid"
  }'
```

### Step 4: Acceder a recurso protegido

```bash
curl -X GET http://localhost:3000/test-definitions \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Response: Lista de definiciones (solo técnicos y superiores)
```

---

## 10. Configuración en .env

```env
# JWT
JWT_SECRET=tu-super-secreto-muy-largo-aleatorio-aqui
JWT_EXPIRATION=3600 # 1 hora en segundos
JWT_REFRESH_SECRET=tu-refresh-secreto
JWT_REFRESH_EXPIRATION=604800 # 7 días

# Bcrypt
BCRYPT_ROUNDS=10

# Seed datos
SEED_INITIAL_DATA=true
```

---

## 11. Próximos Pasos Implementación

1. ✅ Crear entidades (Role, User, Permission)
2. ✅ Crear DTOs
3. ✅ Crear AuthService + AuthController (Login, Refresh)
4. ✅ Crear UsersService + UsersController (CRUD)
5. ✅ Crear RolesService + RolesController
6. ✅ Implementar JwtStrategy y Guards
7. ✅ Crear decorador @Roles() y @CurrentUser()
8. ✅ Integrar autenticación en módulos existentes
9. ✅ Crear migrations para tablas iniciales
10. ✅ Documentación Swagger con autorización

---

## 12. Decisión Final: ¿Aceptas esta arquitectura?

**Pros:**
- ✅ Escalable y profesional
- ✅ Seguridad robusta con JWT + bcrypt
- ✅ Fácil de testear
- ✅ Compatible con microservicios futuros
- ✅ Auditoría incorporada

**Contras:**
- ⚠️ Requiere instalar dependencias JWT
- ⚠️ ~2-3 horas implementación completa

---

**¿Vamos con esto? Di "SÍ" y empiezo con las entidades y DTOs.**
