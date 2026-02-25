# 🖼️ Sistema de Avatares de Usuarios

## 📋 Resumen

El sistema de avatares permite que cada usuario del LIS pueda tener una imagen de perfil. Las imágenes se almacenan en el servidor en la carpeta `public/avatars/` y se accede a través de URLs HTTP.

---

## 📁 Estructura de Almacenamiento

```
proyecto/
├── public/
│   └── avatars/
│       ├── .gitkeep
│       ├── 550e8400-e29b-41d4-a716-446655440000-uuid.jpg
│       ├── 550e8400-e29b-41d4-a716-446655440001-uuid.png
│       └── ...más archivos
├── src/
│   ├── entities/
│   │   └── user.entity.ts (campo: avatar)
│   ├── features/
│   │   ├── upload/
│   │   │   ├── upload.service.ts
│   │   │   ├── upload.controller.ts
│   │   │   └── upload.module.ts
│   │   └── users/
│   │       └── users.controller.ts (nuevo endpoint)
│   └── main.ts (configurado para servir estáticos)
└── ...
```

---

## 🎯 Características

### ✅ Validación
- **Tipos permitidos**: JPG, PNG, GIF, WebP
- **Tamaño máximo**: 5 MB
- **Nombrado**: `{userId}-{uuid}.{extension}`

### ✅ Seguridad
- Solo usuarios autenticados pueden subir avatares
- Los usuarios pueden subir su propio avatar
- Los ADMINS pueden subir avatares para otros usuarios
- Los SUPERADMIN pueden hacer cualquier cosa

### ✅ Gestión Automática
- Se elimina automáticamente el avatar antiguo al actualizar
- Se elimina cuando se elimina el usuario
- Se puede establecer a null para remover el avatar

---

## 🔌 Endpoints

### 1. Subir Avatar
```
POST /users/:id/avatar
```

**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: multipart/form-data
```

**Body (form-data):**
- `file` (archivo binary)

**Respuesta (200):**
```json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "/avatars/550e8400-e29b-41d4-a716-446655440000-uuid.jpg",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "tecnico01",
    "name": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@lab.com",
    "avatar": "/avatars/550e8400-e29b-41d4-a716-446655440000-uuid.jpg",
    "isActive": true,
    ...
  }
}
```

**Errores:**
```json
// 400 - Archivo inválido
{
  "statusCode": 400,
  "message": "Invalid file type. Allowed types: image/jpeg, image/png, image/gif, image/webp"
}

// 400 - Archivo demasiado grande
{
  "statusCode": 400,
  "message": "File size exceeds maximum allowed size of 5MB"
}

// 401 - No autenticado
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// 403 - No tiene permisos
{
  "statusCode": 403,
  "message": "Solo puedes actualizar tu propio avatar"
}

// 404 - Usuario no encontrado
{
  "statusCode": 404,
  "message": "Usuario no encontrado"
}
```

---

### 2. Obtener Usuario (con avatar)
```
GET /users/:id
```

**Respuesta (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "tecnico01",
  "name": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@lab.com",
  "avatar": "/avatars/550e8400-e29b-41d4-a716-446655440000-uuid.jpg",
  "isActive": true,
  "role": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d481",
    "name": "TECNICO",
    "level": 3
  },
  ...
}
```

---

### 3. Actualizar Avatar a través de PATCH
```
PATCH /users/:id
```

**Body JSON:**
```json
{
  "avatar": "/avatars/550e8400-e29b-41d4-a716-446655440000-uuid.jpg"
}
```

O para **eliminar** el avatar:
```json
{
  "avatar": null
}
```

---

### 4. Acceder al Avatar directamente
```
GET /avatars/{nombreArchivo}
```

**Ejemplo:**
```
GET http://localhost:3000/avatars/550e8400-e29b-41d4-a716-446655440000-uuid.jpg
```

---

## 🛠️ Implementación Frontend (JavaScript/Axios)

### Subir Avatar
```javascript
const userId = "550e8400-e29b-41d4-a716-446655440000";
const formData = new FormData();
formData.append('file', fileInputElement.files[0]);

try {
  const response = await axios.post(
    `http://localhost:3000/users/${userId}/avatar`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  
  console.log('Avatar URL:', response.data.avatarUrl);
  console.log('Usuario actualizado:', response.data.user);
} catch (error) {
  console.error('Error subiendo avatar:', error.response.data);
}
```

### Mostrar Avatar
```html
<!-- HTML -->
<img 
  id="userAvatar" 
  src="/avatars/default.jpg" 
  alt="Avatar"
  width="100"
/>

<!-- JavaScript -->
<script>
  // Después de obtener el usuario
  const user = await getUser(userId);
  
  if (user.avatar) {
    document.getElementById('userAvatar').src = `http://localhost:3000${user.avatar}`;
  }
</script>
```

### Eliminar Avatar
```javascript
const updateData = {
  avatar: null
};

const response = await axios.patch(
  `http://localhost:3000/users/${userId}`,
  updateData,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
);
```

---

## 📊 Base de Datos

### Cambios en tabla `users`

**Columna agregada:**
```sql
ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL;
```

**En TypeORM (User entity):**
```typescript
@Column({ type: 'varchar', length: 255, nullable: true })
avatar: string;
```

---

## 🔄 Ciclo de Vida del Avatar

### 1️⃣ Creación de Usuario
- No tiene avatar (avatar = null)

### 2️⃣ Subida de Avatar
```
Usuario sube archivo → UploadService guarda → URL generada → 
UserService actualiza campo avatar → Respuesta con avatarUrl
```

### 3️⃣ Obtención del Usuario
```
GET /users/id → Campo avatar devuelve URL → Frontend carga imagen
```

### 4️⃣ Actualización de Avatar
```
Usuario sube nuevo archivo → Antiguo se elimina automáticamente → 
Nuevo archivo se guarda → URL actualizada
```

### 5️⃣ Eliminación del Usuario
```
DELETE /users/id → Avatar se elimina automáticamente → 
Usuario se elimina
```

---

## 🚨 Consideraciones de Seguridad

### ✅ Implementadas
- Validación de tipo MIME (no solo extensión)
- Límite de tamaño (5MB)
- Nombres de archivo aleatorios (UUID)
- Namespacing por usuario (userId-uuid)
- Solo usuarios autenticados pueden subir
- Permisos por rol

### ⚠️ Recomendaciones Adicionales
- **Rate limiting**: Limitar subidas por usuario/hora
- **Antivirus**: Escanear archivos antes de guardar
- **CDN**: Para archivos en producción
- **Backup**: Respaldar carpeta de avatares
- **Quotas**: Limitar almacenamiento por usuario

---

## 📝 Ejemplos de Uso Completo

### Flujo Completo: Login → Obtener Perfil → Subir Avatar

```javascript
// 1. Login
const loginResponse = await axios.post('http://localhost:3000/auth/login', {
  username: 'tecnico01',
  password: 'TecnicoPass123!'
});

const accessToken = loginResponse.data.accessToken;
const userId = loginResponse.data.user.id;

// 2. Obtener perfil con avatar actual
const userResponse = await axios.get(
  `http://localhost:3000/users/${userId}`,
  { headers: { Authorization: `Bearer ${accessToken}` } }
);

console.log('Avatar actual:', userResponse.data.avatar);

// 3. Subir nuevo avatar
const fileInput = document.getElementById('fileInput');
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadResponse = await axios.post(
  `http://localhost:3000/users/${userId}/avatar`,
  formData,
  { 
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data'
    } 
  }
);

// 4. Mostrar avatar en interfaz
document.getElementById('profileImage').src = 
  `http://localhost:3000${uploadResponse.data.avatarUrl}`;

console.log('¡Avatar actualizado!', uploadResponse.data.user);
```

---

## 🧪 Pruebas con Postman/Insomnia

### Request: Subir Avatar

```
POST /users/550e8400-e29b-41d4-a716-446655440000/avatar
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: multipart/form-data

file: [seleccionar archivo JPG/PNG/GIF/WebP, máx 5MB]
```

### Request: Obtener Usuario

```
GET /users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {{ACCESS_TOKEN}}
```

### Request: Eliminar Avatar

```
PATCH /users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "avatar": null
}
```

---

## 📦 Dependencias Requeridas

✅ `@nestjs/platform-express` - Para FileInterceptor (ya debería estar instalado)

Si no está instalado:
```bash
npm install @nestjs/platform-express
```

---

## 🔧 Troubleshooting

### El avatar no se muestra
- ✅ Verificar que main.ts esté configurado para servir estáticos
- ✅ Verificar que la URL sea correcta: `http://localhost:3000/avatars/...`
- ✅ Verificar que el archivo exista en `public/avatars/`

### Error "File size exceeds"
- ✅ La imagen debe ser menor a 5MB
- Comprimir imagen o reducir resolución

### Error "Invalid file type"
- ✅ Solo JPG, PNG, GIF, WebP permitidos
- Convertir imagen al formato correcto

### Error "Forbidden" al subir
- ✅ Solo ADMIN+ pueden subir avatares de otros usuarios
- ✅ Usuarios normales solo pueden subir el suyo

---

**Versión:** 1.0  
**Fecha:** 29 de octubre de 2025  
**Última actualización:** Implementación completa del sistema de avatares
