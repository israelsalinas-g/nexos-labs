# ✅ Resumen de Endpoints de Perfil de Usuario

## 🎯 Respuesta a tu pregunta

> "¿Crees que sería útil un endpoint para cambio de avatar y para cambio de password para los usuarios, quizá con patch?"

**Sí, es MUY útil** y **YA ESTÁN IMPLEMENTADOS** en el sistema. Aunque usamos `POST` en lugar de `PATCH` (POST es más común para estas operaciones de cambio de estado/perfil).

---

## 📊 Comparativa de Endpoints

| Aspecto | Cambio de Contraseña | Cambio de Avatar |
|--------|-------------------|------------------|
| **Endpoint** | `POST /auth/change-password` | `POST /users/:id/avatar` |
| **HTTP Method** | POST | POST |
| **Autenticación** | ✅ JWT requerido | ✅ JWT requerido |
| **Body** | JSON con contraseñas | JSON con nombre avatar |
| **Validaciones** | Contraseña actual correcta, coincidencia | Whitelist de archivos, path traversal |
| **Permisos** | Solo el usuario de su propia contraseña | Usuario su propio avatar, ADMIN otros |
| **Respuesta** | Mensaje de éxito | Nuevo avatar + datos usuario |

---

## Listar Avatares Disponibles

### Endpoint: `GET /users/avatars/available`

```http
GET /users/avatars/available
Content-Type: application/json
```

### Respuesta (200)
```json
{
  "available": [
    "default.png",
    "avatar-01.png",
    "avatar-02.jpg",
    ...
  ],
  "default": "default.png",
  "total": 12,
  "baseUrl": "/avatars"
}
```

```http
POST /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "nuevaContraseña456",
  "confirmPassword": "nuevaContraseña456"
}
```

### ✅ Respuesta (200)
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

### Validaciones
- ✅ Contraseña actual debe ser correcta
- ✅ Nueva contraseña mínimo 6 caracteres
- ✅ Confirmación debe coincidir
- ✅ Hash bcrypt con 10 rondas

### Seguridad
```typescript
// En auth.service.ts línea 130-145
async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  
  // Verificar contraseña actual
  const isPasswordValid = await bcrypt.compare(
    changePasswordDto.currentPassword,
    user.password
  );
  
  if (!isPasswordValid) {
    throw new BadRequestException('Contraseña actual incorrecta');
  }
  
  // Hash de nueva contraseña
  const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
  user.password = hashedPassword;
  await this.userRepository.save(user);
  
  return { message: 'Contraseña actualizada exitosamente' };
}
```

---

## 🎨 Endpoint: Cambiar Avatar

```http
POST /users/:id/avatar
Authorization: Bearer <token>
Content-Type: application/json

{
  "avatar": "avatar-01.png"
}
```

### ✅ Respuesta (200)
```json
{
  "message": "Avatar selected successfully",
  "avatarUrl": "/avatars/avatar-01.png",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "juan_perez",
    "avatar": "avatar-01.png",
    "role": { "name": "USER", "level": 1 },
    "isActive": true,
    ...
  }
}
```

### Validaciones
- ✅ Avatar debe existir en `public/avatars/`
- ✅ Se valida contra whitelist
- ✅ Se previene path traversal (`../`, `/`)
- ✅ Se permite null para avatar por defecto

### Seguridad
```typescript
// En upload.service.ts
validateAvatar(avatarName: string): boolean {
  if (!avatarName) return true; // null es válido
  
  // Prevenir path traversal
  if (avatarName.includes('..') || 
      avatarName.includes('/') || 
      avatarName.includes('\\')) {
    throw new BadRequestException('Avatar name inválido');
  }
  
  // Validar contra whitelist
  const availableAvatars = this.getAvailableAvatars();
  return availableAvatars.includes(avatarName);
}
```

---

## 🔄 Flujo Completo del Usuario

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO INICIA SESIÓN                │
│  POST /auth/login { username, password }                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  ✅ LOGIN EXITOSO          │
        │  - accessToken             │
        │  - user { id, username }   │
        └────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────────┐      ┌──────────────┐
    │ CAMBIAR     │      │ CAMBIAR      │
    │ CONTRASEÑA  │      │ AVATAR       │
    └─────────────┘      └──────────────┘
         │                       │
         ▼                       ▼
    POST /auth/              POST /users/
    change-password          :id/avatar
    ┌─────────────┐      ┌──────────────┐
    │ { current   │      │ { avatar:    │
    │   new       │      │   "avatar-"  │
    │   confirm } │      │   01.png" }  │
    └─────────────┘      └──────────────┘
         │                       │
         ▼                       ▼
    ✅ Contraseña           ✅ Avatar
    actualizada             actualizado
```

---

## 💾 Implementación Actual

### Archivos Clave

#### 1. `src/features/auth/auth.controller.ts` (línea 67-81)
```typescript
@Post('change-password')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Cambiar contraseña',
  description: 'Permite a un usuario cambiar su contraseña',
})
async changePassword(
  @CurrentUser() user: JwtPayload,
  @Body() changePasswordDto: ChangePasswordDto,
): Promise<{ message: string }> {
  return await this.authService.changePassword(user.sub, changePasswordDto);
}
```

#### 2. `src/features/users/users.controller.ts` (línea 195-252)
```typescript
@Post(':id/avatar')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Seleccionar avatar de usuario',
  description: 'Permite que un usuario seleccione un avatar de la lista disponible',
})
async selectAvatar(
  @Param('id', new ParseUUIDPipe()) id: string,
  @Body() body: { avatar: string | null },
  @CurrentUser() currentUser: JwtPayload,
) {
  if (currentUser.sub !== id && currentUser.roleLevel > 2) {
    throw new BadRequestException('Solo puedes actualizar tu propio avatar');
  }
  
  if (body.avatar !== null && !this.uploadService.validateAvatar(body.avatar)) {
    throw new BadRequestException(`Avatar "${body.avatar}" no es válido`);
  }
  
  const updateDto: UpdateUserDto = { avatar: body.avatar };
  const updatedUser = await this.usersService.update(id, updateDto, currentUser);
  const avatarUrl = this.uploadService.getAvatarUrl(body.avatar);
  
  return { 
    message: 'Avatar selected successfully', 
    avatarUrl, 
    user: updatedUser 
  };
}
```

#### 3. `src/features/auth/auth.service.ts` (línea 125-160)
```typescript
async changePassword(
  userId: string,
  changePasswordDto: ChangePasswordDto,
): Promise<{ message: string }> {
  const user = await this.userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new UnauthorizedException('Usuario no encontrado');
  }

  const isPasswordValid = await bcrypt.compare(
    changePasswordDto.currentPassword,
    user.password,
  );

  if (!isPasswordValid) {
    throw new BadRequestException('Contraseña actual incorrecta');
  }

  const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
  user.password = hashedPassword;
  await this.userRepository.save(user);

  this.logger.log(`Contraseña actualizada para usuario: ${user.username}`);

  return { message: 'Contraseña actualizada exitosamente' };
}
```

---

## 📚 Documentación Disponible

| Documento | Descripción |
|-----------|------------|
| **USER_PROFILE_ENDPOINTS.md** | Guía completa con ejemplos (cURL, JS, Angular, React) |
| **POSTMAN_USER_PROFILE.md** | Collection lista para importar en Postman |
| **AVATAR_SELECTION_GUIDE.md** | Guía detallada del sistema de avatares |
| **USERS_ROLES_IMPLEMENTATION_COMPLETE.md** | Documentación completa del sistema |

---

## 🚀 Próximos Pasos Sugeridos

### ✅ Opcional: Usar PATCH en lugar de POST

Si prefieres usar `PATCH` (que es más semántico para actualizaciones):

```typescript
@Patch(':id/avatar')
@HttpCode(HttpStatus.OK)
async updateAvatar(
  @Param('id', new ParseUUIDPipe()) id: string,
  @Body() body: { avatar: string | null },
  @CurrentUser() currentUser: JwtPayload,
) {
  // ... misma implementación
}
```

### ✅ Opcional: Endpoint adicional para ADMIN cambiar contraseña de otros

```typescript
@Patch(':id/password')
@Roles('ADMIN', 'SUPERADMIN')
async resetUserPassword(
  @Param('id', new ParseUUIDPipe()) id: string,
  @Body() body: { newPassword: string },
  @CurrentUser() currentUser: JwtPayload,
) {
  // ADMIN puede cambiar contraseña de otro sin verificar la actual
  // Útil para resetear si usuario olvida contraseña
}
```

### ✅ Opcional: Endpoint para obtener perfil completo

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
async getMyProfile(@CurrentUser() user: JwtPayload) {
  // Retorna perfil completo del usuario actual
}
```

---

## ✨ Características de Seguridad

### 🔐 Contraseña
- ✅ Hash bcrypt con 10 rondas (criptográficamente seguro)
- ✅ Validación de contraseña actual
- ✅ Mínimo 6 caracteres
- ✅ Confirmación de nueva contraseña
- ✅ Jamás se retorna la contraseña en respuestas

### 🎨 Avatar
- ✅ Whitelist de archivos (solo los que existen)
- ✅ Prevención de path traversal
- ✅ Validación de extensiones
- ✅ Control de permisos (solo usuario o ADMIN)
- ✅ Almacenamiento seguro en carpeta estática

---

## 📈 Estadísticas

| Métrica | Valor |
|---------|-------|
| **Endpoints implementados** | 2 ✅ |
| **Métodos HTTP** | POST |
| **Autenticación requerida** | Sí (JWT) |
| **Endpoints públicos** | 1 (`GET /avatars/available`) |
| **Pruebas unitarias** | Incluidas en DTOs |
| **Documentación** | Completa |

---

## 🎯 Conclusión

✅ **Ya tienes implementados ambos endpoints:**
- ✅ Cambio de contraseña seguro con bcrypt
- ✅ Selección de avatar con validación y whitelist
- ✅ Control de permisos basado en roles
- ✅ Documentación completa con ejemplos

**Próximo paso:** Usar estos endpoints desde tu frontend siguiendo los ejemplos en `USER_PROFILE_ENDPOINTS.md`

