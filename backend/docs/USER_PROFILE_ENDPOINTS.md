# 👤 Endpoints de Perfil de Usuario

Guía completa de endpoints para cambio de contraseña y avatar del usuario.

## 📋 Resumen

| Endpoint | Método | Descripción | Autenticado |
|----------|--------|-------------|-------------|
| `/auth/change-password` | **POST** | Cambiar contraseña del usuario | ✅ Sí |
| `/users/:id/avatar` | **POST** | Seleccionar avatar disponible | ✅ Sí |
| `/avatars/available` | **GET** | Listar avatares disponibles | ❌ No |

---

## 🔐 1. Cambiar Contraseña

### Endpoint
```
POST /auth/change-password
```

### Autenticación
Requiere JWT válido en header:
```
Authorization: Bearer <token>
```

### Body (JSON)
```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña",
  "confirmPassword": "nueva_contraseña"
}
```

### Validaciones
- `currentPassword`: Requerido, debe ser la contraseña actual correcta
- `newPassword`: Requerido, mínimo 6 caracteres
- `confirmPassword`: Requerido, debe coincidir con `newPassword`

### Respuesta Exitosa (200)
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

### Respuestas de Error

**401 - Contraseña actual incorrecta**
```json
{
  "statusCode": 401,
  "message": "Contraseña actual incorrecta"
}
```

**400 - Validación fallida**
```json
{
  "statusCode": 400,
  "message": "Las contraseñas no coinciden"
}
```

### Ejemplos

#### cURL
```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "nuevaContraseña456",
    "confirmPassword": "nuevaContraseña456"
  }'
```

#### JavaScript/Fetch
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/auth/change-password', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    currentPassword: 'admin123',
    newPassword: 'nuevaContraseña456',
    confirmPassword: 'nuevaContraseña456'
  })
});

const data = await response.json();
console.log(data); // { message: "Contraseña actualizada exitosamente" }
```

#### Angular
```typescript
import { HttpClient } from '@angular/common/http';

export class AuthService {
  constructor(private http: HttpClient) {}

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.http.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
  }
}

// Uso en componente
this.authService.changePassword('admin123', 'nuevaContraseña456', 'nuevaContraseña456')
  .subscribe({
    next: (response) => console.log('✅ Contraseña actualizada'),
    error: (error) => console.error('❌', error.error.message)
  });
```

#### React Hook
```typescript
import { useState } from 'react';

export const useChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      if (!response.ok) throw new Error('Error al cambiar contraseña');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error };
};

// Uso en componente
function ChangePasswordForm() {
  const { changePassword, loading, error } = useChangePassword();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await changePassword(
      formData.currentPassword,
      formData.newPassword,
      formData.confirmPassword
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="Contraseña actual"
        value={formData.currentPassword}
        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={formData.newPassword}
        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Confirmar contraseña"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </form>
  );
}
```

---

## 🎨 2. Cambiar Avatar

### Endpoint
```
POST /users/:id/avatar
```

### Parámetros
- `id`: UUID del usuario (path parameter)

### Autenticación
Requiere JWT válido. El usuario puede cambiar su propio avatar o un ADMIN/SUPERADMIN puede cambiar el de otros.

```
Authorization: Bearer <token>
```

### Body (JSON)
```json
{
  "avatar": "avatar-01.png"
}
```

O para usar avatar por defecto:
```json
{
  "avatar": null
}
```

### Validaciones
- `avatar`: String opcional, debe ser un nombre de archivo válido de la lista de avatares disponibles
- No se permiten paths relativos (`../`, `/`, `\`)

### Respuesta Exitosa (200)
```json
{
  "message": "Avatar selected successfully",
  "avatarUrl": "/avatars/avatar-01.png",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "juan_perez",
    "email": "juan@example.com",
    "name": "Juan",
    "lastName": "Pérez",
    "avatar": "avatar-01.png",
    "role": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d480",
      "name": "USER",
      "level": 1
    },
    "isActive": true,
    "createdAt": "2025-10-29T10:00:00Z",
    "updatedAt": "2025-10-29T15:30:00Z"
  }
}
```

### Respuestas de Error

**400 - Avatar inválido**
```json
{
  "statusCode": 400,
  "message": "Avatar \"avatar-invalido.png\" no es válido. Use GET /avatars/available para ver opciones"
}
```

**403 - Permisos insuficientes**
```json
{
  "statusCode": 403,
  "message": "Solo puedes actualizar tu propio avatar"
}
```

**404 - Usuario no encontrado**
```json
{
  "statusCode": 404,
  "message": "Usuario no encontrado"
}
```

### Ejemplos

#### cURL
```bash
# Cambiar avatar a uno específico
curl -X POST http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000/avatar \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "avatar": "avatar-01.png"
  }'

# Cambiar a avatar por defecto (null)
curl -X POST http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000/avatar \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "avatar": null
  }'
```

#### JavaScript/Fetch
```javascript
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');

// Cambiar avatar
const response = await fetch(
  `http://localhost:3000/users/${userId}/avatar`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      avatar: 'avatar-01.png'
    })
  }
);

const data = await response.json();
console.log('✅ Avatar actualizado:', data.avatarUrl);
```

#### Angular
```typescript
import { HttpClient } from '@angular/common/http';

export class UserService {
  constructor(private http: HttpClient) {}

  updateAvatar(userId: string, avatarName: string | null) {
    return this.http.post(`/users/${userId}/avatar`, {
      avatar: avatarName
    });
  }
}

// Uso en componente
this.userService.updateAvatar(userId, 'avatar-01.png')
  .subscribe({
    next: (response: any) => {
      console.log('✅ Avatar actualizado:', response.avatarUrl);
      this.userAvatar = response.avatarUrl;
    },
    error: (error) => console.error('❌', error.error.message)
  });
```

#### React Hook
```typescript
import { useState } from 'react';

export const useChangeAvatar = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const changeAvatar = async (userId: string, avatarName: string | null) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
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

      if (!response.ok) throw new Error('Error al cambiar avatar');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { changeAvatar, loading, error };
};

// Uso en componente
function AvatarSelector({ userId, currentAvatar }) {
  const { changeAvatar, loading, error } = useChangeAvatar();
  const [availableAvatars, setAvailableAvatars] = useState([]);

  useEffect(() => {
    // Obtener lista de avatares disponibles
    fetch('http://localhost:3000/avatars/available')
      .then(r => r.json())
      .then(data => setAvailableAvatars(data.available));
  }, []);

  const handleAvatarChange = async (avatarName) => {
    await changeAvatar(userId, avatarName);
  };

  return (
    <div>
      <h3>Selecciona tu avatar</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {availableAvatars.map(avatar => (
          <button
            key={avatar}
            onClick={() => handleAvatarChange(avatar)}
            disabled={loading}
            style={{
              opacity: currentAvatar === avatar ? 1 : 0.6,
              border: currentAvatar === avatar ? '3px solid blue' : '1px solid gray'
            }}
          >
            <img src={`/avatars/${avatar}`} alt={avatar} style={{width: '100%'}} />
            {avatar}
          </button>
        ))}
      </div>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}
```

---

## 🖼️ 3. Obtener Avatares Disponibles

### Endpoint
```
GET /users/avatars/available
```

### Autenticación
❌ No requiere autenticación

### Respuesta Exitosa (200)
```json
{
  "available": [
    "default.png",
    "avatar-01.png",
    "avatar-02.jpg",
    "female-black-hair.png",
    "girl-black-hair.png",
    "girl-blue-jacket.png",
    "girl-brown-hair.png",
    "man-blonde.png",
    "man-blue.png",
    "man-glasses.png",
    "man-red-tie.png",
    "woman-brown-hair.png"
  ],
  "default": "default.png",
  "total": 12,
  "baseUrl": "/avatars"
}
```

### Ejemplos

#### cURL
```bash
curl -X GET http://localhost:3000/users/avatars/available
```

#### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3000/users/avatars/available');
const data = await response.json();

console.log('Avatares disponibles:', data.available);
console.log('Total:', data.total);
console.log('URL base:', data.baseUrl);

// Mostrar avatares en HTML
const avatarContainer = document.getElementById('avatars');
data.available.forEach(avatar => {
  const img = document.createElement('img');
  img.src = `${data.baseUrl}/${avatar}`;
  img.alt = avatar;
  img.onclick = () => selectAvatar(avatar);
  avatarContainer.appendChild(img);
});
```

---

## 📱 Flujo Completo: Cambiar Perfil

### 1. Usuario inicia sesión
```
POST /auth/login
→ Obtiene: accessToken, user data
```

### 2. Usuario solicita cambiar contraseña (opcional)
```
POST /auth/change-password
Body: { currentPassword, newPassword, confirmPassword }
→ Respuesta: { message: "Contraseña actualizada exitosamente" }
```

### 3. Usuario obtiene lista de avatares disponibles
```
GET /avatars/available
→ Respuesta: { available: [...], default: "...", total: N, baseUrl: "..." }
```

### 4. Usuario selecciona nuevo avatar
```
POST /users/:id/avatar
Body: { avatar: "avatar-01.png" }
→ Respuesta: { message, avatarUrl, user }
```

### 5. Frontend actualiza UI con nuevos datos
```javascript
// Mostrar nuevo avatar en UI
userAvatar.src = avatarUrl;
userName.textContent = user.name + ' ' + user.lastName;
```

---

## 🛡️ Seguridad

### Validaciones de Contraseña
- ✅ Mínimo 6 caracteres
- ✅ Debe coincidir con confirmación
- ✅ Se valida contra contraseña actual (debe ser correcta)
- ✅ Se almacena con hash bcrypt (10 rondas)

### Validaciones de Avatar
- ✅ Se valida contra whitelist de archivos en `public/avatars/`
- ✅ Se previenen path traversal (`../`, `/`, `\`)
- ✅ Solo se permiten extensiones de imagen (.png, .jpg, .jpeg, .gif, .webp)

### Permisos
- 👤 Usuario puede cambiar su propia contraseña y avatar
- 🛡️ ADMIN/SUPERADMIN pueden cambiar contraseña de otros (via endpoint adicional si existe)
- 🛡️ ADMIN/SUPERADMIN pueden cambiar avatar de otros

---

## ⚡ Performance Tips

1. **Cache de avatares disponibles** en el frontend:
```javascript
const avatarCache = {
  data: null,
  timestamp: null,
  TTL: 1000 * 60 * 5, // 5 minutos

  async get() {
    if (this.data && Date.now() - this.timestamp < this.TTL) {
      return this.data;
    }
    this.data = await fetch('/avatars/available').then(r => r.json());
    this.timestamp = Date.now();
    return this.data;
  }
};
```

2. **Validar contraseña en el cliente** antes de enviar:
```javascript
function validatePassword(password, confirmPassword) {
  if (password.length < 6) {
    return 'Mínimo 6 caracteres';
  }
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden';
  }
  return null; // válido
}
```

3. **Debounce en cambio de avatar** para evitar múltiples requests:
```javascript
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const debouncedChangeAvatar = debounce(changeAvatar, 500);
```

---

## 📚 Referencias

- [Documentación de Autenticación](./AUTH.md)
- [Documentación de Usuarios](./USERS_ROLES_IMPLEMENTATION_COMPLETE.md)
- [Guía de Avatares](./AVATAR_SELECTION_GUIDE.md)
