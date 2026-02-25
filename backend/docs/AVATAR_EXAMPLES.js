// 🖼️ EJEMPLOS DE USO DE AVATARES - JavaScript/React

// ============================================================
// 1. SUBIR AVATAR - Vanilla JavaScript
// ============================================================

async function uploadAvatar(userId, fileInput, accessToken) {
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Por favor selecciona una imagen');
    return;
  }

  // Validación en cliente (opcional, también se valida en servidor)
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > maxSize) {
    alert('La imagen no puede ser mayor a 5MB');
    return;
  }

  if (!allowedTypes.includes(file.type)) {
    alert('Solo se permiten JPG, PNG, GIF y WebP');
    return;
  }

  // Crear FormData
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Mostrar loading
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Subiendo...';

    // Hacer request
    const response = await fetch(
      `http://localhost:3000/users/${userId}/avatar`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir avatar');
    }

    const data = await response.json();
    
    // Actualizar imagen en la interfaz
    const avatarImg = document.getElementById('userAvatar');
    avatarImg.src = `http://localhost:3000${data.avatarUrl}`;
    avatarImg.style.display = 'block';

    // Mostrar éxito
    alert('Avatar actualizado exitosamente');
    fileInput.value = ''; // Limpiar input

  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Subir Avatar';
  }
}

// ============================================================
// 2. SUBIR AVATAR - Usando Axios
// ============================================================

import axios from 'axios';

async function uploadAvatarAxios(userId, file, accessToken) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      `http://localhost:3000/users/${userId}/avatar`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('Avatar URL:', response.data.avatarUrl);
    console.log('Usuario:', response.data.user);
    return response.data;

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================================
// 3. COMPONENTE REACT - Upload Avatar
// ============================================================

import React, { useState } from 'react';
import axios from 'axios';

function AvatarUpload({ userId, accessToken, onAvatarUpdated }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    // Validaciones
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (selectedFile.size > maxSize) {
      setError('La imagen no puede ser mayor a 5MB');
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Solo JPG, PNG, GIF y WebP permitidos');
      return;
    }

    setError(null);
    setFile(selectedFile);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Selecciona una imagen primero');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:3000/users/${userId}/avatar`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Callback para actualizar en componente padre
      if (onAvatarUpdated) {
        onAvatarUpdated(response.data.avatarUrl, response.data.user);
      }

      setFile(null);
      setPreview(null);
      alert('Avatar actualizado exitosamente');

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avatar-upload-container">
      <div className="file-input-wrapper">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={loading}
          id="avatarInput"
        />
        <label htmlFor="avatarInput">
          {file ? file.name : 'Selecciona una imagen'}
        </label>
      </div>

      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" style={{ maxWidth: '200px' }} />
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="btn-upload"
      >
        {loading ? 'Subiendo...' : 'Subir Avatar'}
      </button>
    </div>
  );
}

export default AvatarUpload;

// ============================================================
// 4. COMPONENTE REACT - Mostrar Avatar
// ============================================================

function UserProfile({ userId, accessToken }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/users/${userId}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      setUser(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>Usuario no encontrado</div>;

  return (
    <div className="user-profile">
      <div className="avatar-section">
        {user.avatar ? (
          <img
            src={`http://localhost:3000${user.avatar}`}
            alt={user.name}
            className="avatar-image"
            style={{ width: '150px', height: '150px', borderRadius: '50%' }}
          />
        ) : (
          <div className="avatar-placeholder">
            {user.name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="user-info">
        <h2>{user.name} {user.lastName}</h2>
        <p>{user.email}</p>
        <p><strong>Rol:</strong> {user.role.name}</p>
        <p><strong>Estado:</strong> {user.isActive ? 'Activo' : 'Inactivo'}</p>
      </div>

      <AvatarUpload
        userId={userId}
        accessToken={accessToken}
        onAvatarUpdated={(url, updatedUser) => {
          setUser(updatedUser);
          // Re-fetch para asegurar datos frescos
          fetchUser();
        }}
      />
    </div>
  );
}

// ============================================================
// 5. HOOK PERSONALIZADO - useAvatar
// ============================================================

function useAvatar(userId, accessToken) {
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:3000/users/${userId}/avatar`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setAvatar(response.data.avatarUrl);
      return response.data;

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/users/${userId}`,
        { avatar: null },
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      setAvatar(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  return { avatar, loading, error, uploadAvatar, removeAvatar };
}

// Uso del hook:
// const { avatar, loading, uploadAvatar } = useAvatar(userId, accessToken);

// ============================================================
// 6. VALIDADOR DE AVATARES REUTILIZABLE
// ============================================================

const AvatarValidator = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],

  validate(file) {
    const errors = [];

    if (!file) {
      errors.push('No se seleccionó archivo');
      return { valid: false, errors };
    }

    if (file.size > this.MAX_SIZE) {
      errors.push(`Archivo debe ser menor a ${this.MAX_SIZE / 1024 / 1024}MB`);
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      errors.push(`Tipo permitido: ${this.ALLOWED_TYPES.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  formatError(errors) {
    return errors.join('\n');
  }
};

// Uso:
// const validation = AvatarValidator.validate(file);
// if (!validation.valid) {
//   alert(AvatarValidator.formatError(validation.errors));
// }

// ============================================================
// 7. SERVICIO DE AVATAR - Angular
// ============================================================

/*
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private baseUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  uploadAvatar(userId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.baseUrl}/${userId}/avatar`,
      formData
    );
  }

  removeAvatar(userId: string): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/${userId}`,
      { avatar: null }
    );
  }
}

// En componente:
// this.avatarService.uploadAvatar(userId, file).subscribe(
//   response => console.log(response),
//   error => console.error(error)
// );
*/

// ============================================================
// 8. MANEJO DE ERRORES ESPECÍFICOS
// ============================================================

function handleAvatarError(error) {
  const errorMap = {
    'File size exceeds': {
      title: 'Archivo muy grande',
      message: 'La imagen no puede exceder 5MB'
    },
    'Invalid file type': {
      title: 'Tipo de archivo inválido',
      message: 'Solo se permiten JPG, PNG, GIF y WebP'
    },
    'Solo puedes actualizar': {
      title: 'Permiso denegado',
      message: 'No tienes permiso para actualizar este avatar'
    },
    'Usuario no encontrado': {
      title: 'Usuario no encontrado',
      message: 'El usuario especificado no existe'
    },
    'No file provided': {
      title: 'Archivo no encontrado',
      message: 'Por favor selecciona un archivo'
    }
  };

  const errorMsg = error.response?.data?.message || error.message;
  
  for (const [key, errorInfo] of Object.entries(errorMap)) {
    if (errorMsg.includes(key)) {
      return errorInfo;
    }
  }

  return {
    title: 'Error desconocido',
    message: errorMsg || 'Ocurrió un error al subir el avatar'
  };
}

// Uso:
// try { ... } catch (error) {
//   const { title, message } = handleAvatarError(error);
//   alert(`${title}\n${message}`);
// }

// ============================================================
// 9. HTML - Formulario Completo
// ============================================================

/*
<div class="avatar-section">
  <h3>Mi Avatar</h3>
  
  <div class="avatar-display">
    <img id="currentAvatar" src="/avatars/default.jpg" alt="Avatar actual" />
  </div>

  <form id="avatarForm">
    <div class="form-group">
      <label for="avatarInput">Selecciona nueva imagen:</label>
      <input 
        type="file" 
        id="avatarInput" 
        accept="image/jpeg,image/png,image/gif,image/webp"
      />
      <small>JPG, PNG, GIF o WebP - Máximo 5MB</small>
    </div>

    <div id="preview" class="preview-container" style="display: none;">
      <img id="previewImg" alt="Preview" />
    </div>

    <div id="errorMsg" class="error-message"></div>

    <button type="submit" id="uploadBtn" class="btn-primary">
      Subir Avatar
    </button>
  </form>
</div>

<style>
  .avatar-section {
    max-width: 400px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .avatar-display img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    margin: 10px auto;
    display: block;
  }

  .preview-container {
    margin: 15px 0;
    text-align: center;
  }

  .preview-container img {
    max-width: 150px;
    border-radius: 8px;
  }

  .error-message {
    color: #d32f2f;
    margin: 10px 0;
    padding: 10px;
    background: #ffebee;
    border-radius: 4px;
  }

  .form-group {
    margin: 15px 0;
  }

  input[type="file"] {
    display: block;
    margin: 10px 0;
  }

  small {
    color: #666;
    display: block;
    margin-top: 5px;
  }

  .btn-primary {
    width: 100%;
    padding: 10px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }

  .btn-primary:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
</style>
*/

export {
  uploadAvatar,
  uploadAvatarAxios,
  AvatarUpload,
  UserProfile,
  useAvatar,
  AvatarValidator,
  handleAvatarError
};
