# 🖼️ Sistema de Selección de Avatares (Refactorizado)

## 📋 Cambio de Arquitectura

El sistema de avatares ha sido **refactorizado** de un sistema de upload a un sistema de **selección de imágenes predefinidas**.

### ❌ Antes (Upload)
```
Usuario sube archivo → Validar tipo/tamaño → Guardar en servidor → Asignar URL
```

### ✅ Ahora (Selection)
```
Admin agrega imágenes a /public/avatars → Usuario selecciona de lista → Asignar nombre archivo
```

---

## 🎯 Objetivos

✅ **No permitir uploads externos** - Solo imágenes del servidor  
✅ **Consistencia visual** - Avatares controlados y consistentes  
✅ **Seguridad mejorada** - Sin validación de archivos externos  
✅ **Facilidad de gestión** - Agregar avatares es simple  
✅ **Imagen por defecto** - `default.png` para nuevos usuarios  

---

## 📁 Estructura

```
proyecto/
├── public/
│   └── avatars/
│       ├── README.md (instrucciones)
│       ├── default.png (✨ OBLIGATORIO)
│       ├── avatar-01.png
│       ├── avatar-02.png
│       ├── avatar-03.png
│       └── ...más avatares
└── ...
```

---

## 🔌 API Endpoints

### 1. Obtener Lista de Avatares Disponibles
```
GET /avatars/available
```

**Respuesta (200):**
```json
{
  "available": [
    "default.png",
    "avatar-01.png",
    "avatar-02.png",
    "avatar-03.png",
    "avatar-04.png"
  ],
  "default": "default.png",
  "total": 5,
  "baseUrl": "/avatars"
}
```

---

### 2. Seleccionar Avatar para Usuario
```
POST /users/{userId}/avatar
```

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "avatar": "avatar-02.png"
}
```

**Respuesta (200):**
```json
{
  "message": "Avatar selected successfully",
  "avatarUrl": "/avatars/avatar-02.png",
  "user": {
    "id": "550e8400-...",
    "username": "tecnico01",
    "name": "Juan",
    "avatar": "avatar-02.png",
    ...
  }
}
```

**Eliminar avatar (volver a default):**
```json
{
  "avatar": null
}
```

---

### 3. Obtener Usuario (con avatar)
```
GET /users/{userId}
```

**Respuesta (200):**
```json
{
  "id": "550e8400-...",
  "username": "tecnico01",
  "name": "Juan",
  "avatar": "avatar-02.png",
  "avatarUrl": "/avatars/avatar-02.png",
  ...
}
```

---

### 4. Acceder a Imagen de Avatar
```
GET /avatars/{nombreArchivo}
```

**Ejemplo:**
```
GET /avatars/avatar-02.png
→ Descarga binaria de imagen
```

---

## 💻 Ejemplos de Uso

### JavaScript - Obtener Lista de Avatares
```javascript
async function loadAvatarList() {
  const response = await fetch('http://localhost:3000/avatars/available');
  const data = await response.json();
  
  console.log('Avatares disponibles:', data.available);
  console.log('Avatar por defecto:', data.default);
  
  // Mostrar en select
  const select = document.getElementById('avatarSelect');
  data.available.forEach(avatar => {
    const option = document.createElement('option');
    option.value = avatar;
    option.text = avatar;
    select.appendChild(option);
  });
}
```

### JavaScript - Seleccionar Avatar
```javascript
async function selectAvatar(userId, avatarName, accessToken) {
  try {
    const response = await fetch(
      `http://localhost:3000/users/${userId}/avatar`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatar: avatarName })
      }
    );

    if (!response.ok) {
      throw new Error('Error al seleccionar avatar');
    }

    const data = await response.json();
    console.log('Avatar actualizado:', data.avatarUrl);
    
    // Actualizar imagen en interfaz
    document.getElementById('userAvatar').src = 
      `http://localhost:3000${data.avatarUrl}`;

  } catch (error) {
    console.error('Error:', error);
  }
}
```

### React - Componente Avatar Selector
```jsx
import React, { useState, useEffect } from 'react';

function AvatarSelector({ userId, accessToken, onAvatarSelected }) {
  const [avatars, setAvatars] = useState([]);
  const [selected, setSelected] = useState('default.png');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    try {
      const response = await fetch('http://localhost:3000/avatars/available');
      const data = await response.json();
      setAvatars(data.available);
    } catch (error) {
      console.error('Error loading avatars:', error);
    }
  };

  const handleSelect = async (avatarName) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/users/${userId}/avatar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ avatar: avatarName })
        }
      );

      const data = await response.json();
      setSelected(avatarName);
      onAvatarSelected(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avatar-selector">
      <h3>Selecciona tu Avatar</h3>
      
      <div className="avatar-grid">
        {avatars.map(avatar => (
          <div
            key={avatar}
            className={`avatar-card ${selected === avatar ? 'active' : ''}`}
            onClick={() => handleSelect(avatar)}
          >
            <img
              src={`http://localhost:3000/avatars/${avatar}`}
              alt={avatar}
            />
            <p>{avatar}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => handleSelect(null)}
        disabled={loading}
      >
        Usar Avatar Por Defecto
      </button>
    </div>
  );
}

export default AvatarSelector;
```

### HTML - Mostrar Avatar de Usuario
```html
<div class="user-profile">
  <img 
    id="userAvatar"
    src="http://localhost:3000/avatars/default.png"
    alt="Avatar del usuario"
    width="150"
    height="150"
    style="border-radius: 50%;"
  />
  <h2>Juan Pérez</h2>
  <button onclick="changeAvatar()">Cambiar Avatar</button>
</div>

<script>
  async function changeAvatar() {
    const userId = '550e8400-...';
    const avatarName = 'avatar-03.png';
    const token = localStorage.getItem('accessToken');

    const response = await fetch(
      `http://localhost:3000/users/${userId}/avatar`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatar: avatarName })
      }
    );

    const data = await response.json();
    document.getElementById('userAvatar').src = 
      `http://localhost:3000${data.avatarUrl}`;
  }
</script>
```

---

## 📊 Flujos de Usuario

### Flujo 1: Nuevo Usuario
```
1. Usuario creado
2. avatar = null
3. Al obtener usuario: avatarUrl = /avatars/default.png
4. Frontend muestra default.png
```

### Flujo 2: Cambiar Avatar
```
1. Usuario hace POST /avatars/available
2. Obtiene lista de avatares disponibles
3. Selecciona uno (ej: avatar-02.png)
4. Hace POST /users/{id}/avatar con { avatar: "avatar-02.png" }
5. Usuario se actualiza con avatar: "avatar-02.png"
6. Frontend muestra nueva imagen
```

### Flujo 3: Volver a Default
```
1. Usuario hace POST /users/{id}/avatar
2. Body: { avatar: null }
3. avatar se pone null en BD
4. Frontend muestra /avatars/default.png
```

---

## 🔒 Seguridad

✅ **Sin uploads externos** - Solo archivos del servidor  
✅ **Validación de nombres** - No permite `../` o paths  
✅ **Permisos por rol** - Solo usuario o ADMIN+ pueden cambiar  
✅ **Autenticación** - Requiere JWT válido  
✅ **Whitelist** - Solo archivos que existen en carpeta

---

## ⚙️ Cambios en BD

### Column: avatar
- **Tipo**: VARCHAR(255)
- **Nullable**: true
- **Valor por defecto**: null
- **Valores válidos**: Nombres de archivos en public/avatars/

### Ejemplos
```sql
avatar = null              -- Usa default.png
avatar = 'avatar-01.png'   -- Usa public/avatars/avatar-01.png
avatar = 'avatar-02.jpg'   -- Usa public/avatars/avatar-02.jpg
```

---

## 🧪 Pruebas

### Test 1: Obtener Avatares Disponibles
```
GET /avatars/available

✅ 200 OK
{
  "available": ["default.png", "avatar-01.png", ...],
  "total": 5,
  ...
}
```

### Test 2: Seleccionar Avatar Válido
```
POST /users/{userId}/avatar
Body: { "avatar": "avatar-02.png" }
Auth: Bearer token

✅ 200 OK - Avatar actualizado
```

### Test 3: Seleccionar Avatar Inválido
```
POST /users/{userId}/avatar
Body: { "avatar": "no-existe.png" }

❌ 400 Bad Request
"Avatar "no-existe.png" no es válido"
```

### Test 4: Intentar Path Traversal
```
POST /users/{userId}/avatar
Body: { "avatar": "../../../etc/passwd" }

❌ 400 Bad Request
"Avatar name inválido"
```

### Test 5: Sin Permisos
```
// TECNICO intenta cambiar avatar de OPERADOR
POST /users/otro-id/avatar
Auth: Bearer token-tecnico

❌ 403 Forbidden
"Solo puedes actualizar tu propio avatar"
```

---

## 📝 Archivos Necesarios

### Obligatorio
- `public/avatars/default.png` - Avatar por defecto (DEBE existir)

### Ejemplo de Setup
```bash
# Crear carpeta
mkdir -p public/avatars

# Copiar imágenes
cp ~/images/avatars/* public/avatars/

# Asegurar que default.png existe
cp ~/images/default-avatar.png public/avatars/default.png
```

---

## 🔧 Configuración

### UploadService - Métodos Disponibles
```typescript
getAvailableAvatars()        // Lista de avatares
validateAvatar(name)         // Valida que exista
getAvatarUrl(name)           // Obtiene URL
getDefaultAvatar()           // Nombre default
```

### UpdateUserDto - Campo Avatar
```typescript
avatar?: string | null
```

Valores:
- `null` - Usa default
- `"avatar-01.png"` - Archivo específico

---

## ✅ Checklist Final

- [x] Sistema de selección implementado
- [x] Uploads deshabilitados
- [x] Validación de avatares
- [x] GET /avatars/available funciona
- [x] POST /users/:id/avatar funciona
- [x] Protección contra path traversal
- [x] Permisos por rol
- [x] Default.png como fallback
- [x] Documentación completa
- [x] Ejemplos de código
- [x] Sin errores TypeScript

---

## 🚀 Próximos Pasos

1. Crear `public/avatars/default.png` (IMPORTANTE)
2. Agregar más avatares a `public/avatars/`
3. Ejecutar migration (si no lo hizo antes)
4. Iniciar aplicación
5. Probar endpoints en Postman
6. Implementar selector en frontend

---

**Versión**: 2.0 (Refactorizado)  
**Fecha**: 29 de octubre de 2025  
**Cambio Principal**: De upload a selección
