// 🖼️ EJEMPLOS DE USO - SELECCIÓN DE AVATARES (Sistema Refactorizado)

// ============================================================
// 1. OBTENER LISTA DE AVATARES DISPONIBLES - Vanilla JS
// ============================================================

async function loadAvatarOptions() {
  try {
    const response = await fetch('http://localhost:3000/avatars/available');
    
    if (!response.ok) {
      throw new Error('Error al cargar avatares');
    }

    const data = await response.json();
    
    console.log('Avatares disponibles:', data.available);
    console.log('Avatar por defecto:', data.default);
    console.log('Total:', data.total);

    // Llenar select HTML
    const select = document.getElementById('avatarSelect');
    select.innerHTML = ''; // Limpiar

    // Opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = 'null';
    defaultOption.textContent = `📷 Por defecto (${data.default})`;
    select.appendChild(defaultOption);

    // Agregar opciones
    data.available.forEach(avatar => {
      const option = document.createElement('option');
      option.value = avatar;
      option.textContent = avatar;
      select.appendChild(option);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================
// 2. SELECCIONAR AVATAR - Vanilla JavaScript
// ============================================================

async function selectAvatar(userId, avatarName, accessToken) {
  try {
    // Si es 'null', enviar null
    const avatarValue = avatarName === 'null' ? null : avatarName;

    const response = await fetch(
      `http://localhost:3000/users/${userId}/avatar`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatar: avatarValue })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al seleccionar avatar');
    }

    const data = await response.json();
    
    console.log('Avatar actualizado:', data.avatarUrl);
    
    // Actualizar imagen en interfaz
    const avatarImg = document.getElementById('userAvatar');
    avatarImg.src = `http://localhost:3000${data.avatarUrl}`;

    return data;

  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
  }
}

// Uso:
// loadAvatarOptions();
// selectAvatar(userId, 'avatar-02.png', accessToken);

// ============================================================
// 3. SELECCIONAR AVATAR - Usando Axios
// ============================================================

import axios from 'axios';

async function selectAvatarAxios(userId, avatarName, accessToken) {
  try {
    const avatarValue = avatarName === 'null' ? null : avatarName;

    const response = await axios.post(
      `http://localhost:3000/users/${userId}/avatar`,
      { avatar: avatarValue },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Avatar URL:', response.data.avatarUrl);
    return response.data;

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================================
// 4. COMPONENTE REACT - Avatar Selector
// ============================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AvatarSelector({ userId, accessToken, onAvatarUpdated }) {
  const [avatars, setAvatars] = useState([]);
  const [selected, setSelected] = useState('default.png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar avatares disponibles al montar
  useEffect(() => {
    loadAvatarList();
  }, []);

  const loadAvatarList = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/avatars/available'
      );
      setAvatars(response.data.available);
    } catch (err) {
      setError('Error cargando avatares');
      console.error(err);
    }
  };

  const handleAvatarSelect = async (avatarName) => {
    setLoading(true);
    setError(null);

    try {
      const avatarValue = avatarName === null ? null : avatarName;
      
      const response = await axios.post(
        `http://localhost:3000/users/${userId}/avatar`,
        { avatar: avatarValue },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSelected(avatarName || 'default.png');
      
      if (onAvatarUpdated) {
        onAvatarUpdated(response.data);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avatar-selector">
      <h3>🖼️ Selecciona tu Avatar</h3>

      {error && <div className="error">{error}</div>}

      <div className="avatar-grid">
        {/* Opción por defecto */}
        <div
          className={`avatar-card ${selected === 'default.png' ? 'active' : ''}`}
          onClick={() => handleAvatarSelect(null)}
        >
          <img
            src="http://localhost:3000/avatars/default.png"
            alt="Por defecto"
          />
          <p>Por defecto</p>
        </div>

        {/* Avatares disponibles */}
        {avatars.map(avatar => (
          avatar !== 'default.png' && (
            <div
              key={avatar}
              className={`avatar-card ${selected === avatar ? 'active' : ''}`}
              onClick={() => handleAvatarSelect(avatar)}
            >
              <img
                src={`http://localhost:3000/avatars/${avatar}`}
                alt={avatar}
                onError={(e) => {
                  e.target.src = 'http://localhost:3000/avatars/default.png';
                }}
              />
              <p>{avatar}</p>
            </div>
          )
        ))}
      </div>

      {loading && <p className="loading">Actualizando...</p>}

      <style>{`
        .avatar-selector {
          padding: 20px;
          max-width: 600px;
        }

        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
          margin: 20px 0;
        }

        .avatar-card {
          cursor: pointer;
          border: 3px solid transparent;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .avatar-card:hover {
          border-color: #1976d2;
          background: #f0f0f0;
        }

        .avatar-card.active {
          border-color: #4caf50;
          background: #e8f5e9;
        }

        .avatar-card img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-card p {
          margin: 8px 0 0 0;
          font-size: 12px;
        }

        .error {
          color: #d32f2f;
          background: #ffebee;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .loading {
          text-align: center;
          color: #1976d2;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

export default AvatarSelector;

// ============================================================
// 5. COMPONENTE REACT - Mostrar Avatar de Usuario
// ============================================================

function UserProfile({ userId, accessToken }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('/avatars/default.png');

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/users/${userId}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );

      setUser(response.data);

      // Construir URL del avatar
      if (response.data.avatar) {
        setAvatarUrl(`/avatars/${response.data.avatar}`);
      } else {
        setAvatarUrl('/avatars/default.png');
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando perfil...</div>;
  if (!user) return <div>Usuario no encontrado</div>;

  return (
    <div className="user-profile">
      <div className="profile-header">
        <img
          src={`http://localhost:3000${avatarUrl}`}
          alt={user.name}
          className="profile-avatar"
        />
        <div className="profile-info">
          <h2>{user.name} {user.lastName}</h2>
          <p className="email">{user.email}</p>
          <p className="role">
            <strong>Rol:</strong> {user.role.name}
          </p>
        </div>
      </div>

      <AvatarSelector
        userId={userId}
        accessToken={accessToken}
        onAvatarUpdated={(data) => {
          setUser(data.user);
          // Actualizar URL del avatar
          if (data.avatarUrl) {
            setAvatarUrl(data.avatarUrl);
          }
        }}
      />
    </div>
  );
}

// ============================================================
// 6. HOOK PERSONALIZADO - useAvatar
// ============================================================

function useAvatarSelector(userId, accessToken) {
  const [avatars, setAvatars] = useState([]);
  const [selected, setSelected] = useState('default.png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar avatares disponibles
  const loadAvatars = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/avatars/available'
      );
      setAvatars(response.data.available);
    } catch (err) {
      setError('Error cargando avatares');
      console.error(err);
    }
  };

  // Seleccionar avatar
  const selectAvatar = async (avatarName) => {
    setLoading(true);
    setError(null);

    try {
      const avatarValue = avatarName === null ? null : avatarName;

      const response = await axios.post(
        `http://localhost:3000/users/${userId}/avatar`,
        { avatar: avatarValue },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      setSelected(avatarName || 'default.png');
      return response.data;

    } catch (err) {
      setError(err.response?.data?.message || 'Error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    avatars,
    selected,
    loading,
    error,
    loadAvatars,
    selectAvatar,
    getAvatarUrl: (avatar) => 
      `/avatars/${avatar || 'default.png'}`
  };
}

// Uso:
// const { avatars, selected, selectAvatar, loadAvatars } = 
//   useAvatarSelector(userId, token);

// ============================================================
// 7. SERVICIO ANGULAR - Avatar Selection
// ============================================================

/*
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private baseUrl = 'http://localhost:3000';
  private selectedAvatarSubject = new BehaviorSubject<string>('default.png');

  selectedAvatar$ = this.selectedAvatarSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAvailableAvatars(): Observable<any> {
    return this.http.get(`${this.baseUrl}/avatars/available`);
  }

  selectAvatar(userId: string, avatarName: string | null): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/users/${userId}/avatar`,
      { avatar: avatarName }
    );
  }

  getAvatarUrl(avatarName: string | null): string {
    return `${this.baseUrl}/avatars/${avatarName || 'default.png'}`;
  }

  setSelectedAvatar(avatarName: string): void {
    this.selectedAvatarSubject.next(avatarName);
  }
}

// En componente:
// this.avatarService.getAvailableAvatars().subscribe(data => {
//   this.avatars = data.available;
// });
*/

// ============================================================
// 8. VALIDADOR DE SELECCIÓN
// ============================================================

const AvatarValidator = {
  isValidSelection(avatarName, availableAvatars) {
    if (avatarName === null || avatarName === '') {
      return { valid: true, message: 'Será default.png' };
    }

    if (!availableAvatars.includes(avatarName)) {
      return {
        valid: false,
        message: `"${avatarName}" no está disponible`,
        available: availableAvatars
      };
    }

    return { valid: true, message: 'Avatar válido' };
  },

  isSafeSelection(avatarName) {
    if (!avatarName) return true;

    // Verificar que no intente path traversal
    if (
      avatarName.includes('..') ||
      avatarName.includes('/') ||
      avatarName.includes('\\') ||
      avatarName.includes(':')
    ) {
      return false;
    }

    return true;
  }
};

// Uso:
// const validation = AvatarValidator.isValidSelection(
//   'avatar-02.png',
//   ['default.png', 'avatar-01.png', 'avatar-02.png']
// );

// ============================================================
// 9. FORMULARIO COMPLETO CON PREVIEW
// ============================================================

/*
<div class="avatar-selector-form">
  <h2>Cambiar Avatar</h2>

  <div class="preview-section">
    <h3>Vista previa</h3>
    <img 
      id="avatarPreview" 
      src="http://localhost:3000/avatars/default.png"
      alt="Preview"
      style="width: 150px; height: 150px; border-radius: 50%;"
    />
  </div>

  <div class="selector-section">
    <label for="avatarSelect">Selecciona un avatar:</label>
    <select id="avatarSelect" onchange="updatePreview()">
      <option value="null">📷 Por defecto</option>
    </select>
  </div>

  <div class="action-buttons">
    <button onclick="applyAvatar()" id="applyBtn">Aplicar</button>
    <button onclick="resetForm()">Cancelar</button>
  </div>

  <div id="message" class="message"></div>
</div>

<script>
  async function updatePreview() {
    const select = document.getElementById('avatarSelect');
    const preview = document.getElementById('avatarPreview');
    const avatarValue = select.value === 'null' 
      ? 'default.png' 
      : select.value;
    
    preview.src = `http://localhost:3000/avatars/${avatarValue}`;
  }

  async function applyAvatar() {
    const select = document.getElementById('avatarSelect');
    const avatarValue = select.value === 'null' ? null : select.value;
    
    // Hacer request
    await selectAvatar(userId, avatarValue, accessToken);
  }

  function resetForm() {
    document.getElementById('avatarSelect').value = 'null';
    updatePreview();
  }

  // Cargar avatares al iniciar
  loadAvatarOptions();
</script>
*/

// ============================================================
// 10. GESTIÓN DE ERRORES
// ============================================================

function handleAvatarError(error) {
  const errorMap = {
    'Avatar "': {
      title: 'Avatar no válido',
      getMsg: (err) => err.match(/Avatar "([^"]+)"/)?.[1] || 'desconocido'
    },
    'Avatar name inválido': {
      title: 'Nombre de avatar inválido',
      message: 'No se permiten paths o caracteres especiales'
    },
    'Solo puedes actualizar': {
      title: 'Permiso denegado',
      message: 'No tienes permiso para cambiar este avatar'
    },
    'Usuario no encontrado': {
      title: 'Usuario no encontrado',
      message: 'El usuario especificado no existe'
    }
  };

  const errorMsg = error.response?.data?.message || error.message;

  for (const [key, errorInfo] of Object.entries(errorMap)) {
    if (errorMsg.includes(key)) {
      const msg = errorInfo.getMsg 
        ? errorInfo.getMsg(errorMsg)
        : errorInfo.message;

      return {
        title: errorInfo.title,
        message: msg || 'Error desconocido'
      };
    }
  }

  return {
    title: 'Error',
    message: errorMsg || 'Ocurrió un error al cambiar el avatar'
  };
}

export {
  loadAvatarOptions,
  selectAvatar,
  selectAvatarAxios,
  AvatarSelector,
  UserProfile,
  useAvatarSelector,
  AvatarValidator,
  handleAvatarError
};
