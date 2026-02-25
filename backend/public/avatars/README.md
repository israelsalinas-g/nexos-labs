# 🖼️ Carpeta de Avatares Predefinidos

Esta carpeta contiene todas las imágenes de avatar disponibles que los usuarios pueden seleccionar.

## 📋 Estructura

```
public/avatars/
├── default.png          ← Avatar por defecto (OBLIGATORIO)
├── avatar-01.png
├── avatar-02.png
├── avatar-03.png
├── avatar-04.png
├── avatar-05.png
└── ...más avatares
```

## 📝 Instrucciones

### 1. Avatar por Defecto (OBLIGATORIO)
- **Nombre**: `default.png`
- **Ubicación**: `public/avatars/default.png`
- **Función**: Se asigna automáticamente a nuevos usuarios
- **Se usa cuando**: No se selecciona ningún avatar

### 2. Avatares Adicionales
- **Formato**: PNG, JPG, GIF, WebP
- **Nombramiento**: `avatar-{numero}.{extensión}`
- **Ejemplo**: `avatar-01.png`, `avatar-02.jpg`, etc.
- **Se cargan automáticamente**: Al iniciar la aplicación

## 🚀 Cómo Agregar Nuevos Avatares

### Opción 1: Agregar archivo manualmente
1. Guardar imagen en esta carpeta
2. Usar nombre descriptivo: `avatar-06.png`
3. Reiniciar la aplicación (opcional, se detecta automáticamente)

### Opción 2: Listar avatares disponibles
```bash
# GET /avatars/available
# Retorna lista de todos los avatares disponibles
```

**Respuesta:**
```json
{
  "available": [
    "default.png",
    "avatar-01.png",
    "avatar-02.png",
    "avatar-03.png"
  ],
  "default": "default.png",
  "total": 4,
  "baseUrl": "/avatars"
}
```

## 🎨 Recomendaciones para Avatares

- **Resolución**: 200x200px a 500x500px (mínimo)
- **Formato**: PNG con fondo transparente (recomendado)
- **Tamaño de archivo**: 50KB - 200KB
- **Estilo**: Consistente con el diseño de la aplicación

## 💾 Acceso a Avatares

### Obtener avatar específico
```
GET /avatars/avatar-01.png
```

### Acceso desde Frontend
```html
<img src="http://localhost:3000/avatars/avatar-01.png" alt="Avatar" />
```

## 🔄 Flujo de Avatar en Usuarios

### Nuevo usuario
```
Usuario creado → avatar = null → Se asigna default.png automáticamente
```

### Seleccionar avatar
```
PATCH /users/{userId}
Body: { "avatar": "avatar-02.png" }

Respuesta: avatarUrl = "/avatars/avatar-02.png"
```

### Ver avatar del usuario
```
GET /users/{userId}
Respuesta: { avatar: "avatar-02.png" }

Para acceder: http://localhost:3000/avatars/avatar-02.png
```

## ❌ Lo que NO se puede hacer

- ❌ Subir imágenes desde aplicación
- ❌ Usar URLs externas
- ❌ Acceder a directorios fuera de avatars/
- ❌ Usar nombres con rutas: `/other/avatar.png`

## ✅ Lo que SÍ se puede hacer

- ✅ Agregar archivos manualmente
- ✅ Seleccionar entre avatares disponibles
- ✅ Cambiar avatar en cualquier momento
- ✅ Volver al default con `avatar: null`
- ✅ Ver lista de disponibles en `/avatars/available`

---

**Nota**: Los avatares no se eliminan cuando se borra un usuario. Son recursos compartidos.
