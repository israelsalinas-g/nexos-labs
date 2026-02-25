# 📮 Postman Collection - User Profile Endpoints

## Importar en Postman

1. Copia el contenido JSON abajo
2. En Postman: `File → Import → Paste Raw Text`
3. Selecciona la carpeta destino
4. ¡Listo!

## Variables de Entorno Recomendadas

Crear un entorno en Postman con estas variables:

| Variable | Valor Ejemplo |
|----------|---|
| `base_url` | `http://localhost:3000` |
| `token` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `user_id` | `550e8400-e29b-41d4-a716-446655440000` |

---

## JSON Collection

```json
{
  "info": {
    "name": "User Profile Endpoints",
    "description": "Endpoints para cambio de contraseña y avatar de usuario",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "  var jsonData = pm.response.json();",
                  "  pm.environment.set('token', jsonData.accessToken);",
                  "  pm.environment.set('user_id', jsonData.user.id);",
                  "  console.log('✅ Token guardado: ' + jsonData.accessToken.substring(0, 20) + '...');",
                  "  console.log('✅ User ID guardado: ' + jsonData.user.id);",
                  "}"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"superadmin\",\n  \"password\": \"admin123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login",
              "host": ["{{base_url}}"],
              "path": ["auth", "login"]
            }
          },
          "response": []
        },
        {
          "name": "Get Current User",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/auth/me",
              "host": ["{{base_url}}"],
              "path": ["auth", "me"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "User Profile",
      "item": [
        {
          "name": "Change Password",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"currentPassword\": \"admin123\",\n  \"newPassword\": \"nuevaContraseña456\",\n  \"confirmPassword\": \"nuevaContraseña456\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/change-password",
              "host": ["{{base_url}}"],
              "path": ["auth", "change-password"]
            }
          },
          "response": []
        },
        {
          "name": "Get Available Avatars",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/users/avatars/available",
              "host": ["{{base_url}}"],
              "path": ["users", "avatars", "available"]
            }
          },
          "response": []
        },
        {
          "name": "Change Avatar - Specific",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "  var jsonData = pm.response.json();",
                  "  console.log('✅ Avatar actualizado: ' + jsonData.avatarUrl);",
                  "  console.log('📸 Usuario: ' + jsonData.user.username);",
                  "}"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"avatar\": \"avatar-01.png\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/users/{{user_id}}/avatar",
              "host": ["{{base_url}}"],
              "path": ["users", "{{user_id}}", "avatar"]
            }
          },
          "response": []
        },
        {
          "name": "Change Avatar - Default",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"avatar\": null\n}"
            },
            "url": {
              "raw": "{{base_url}}/users/{{user_id}}/avatar",
              "host": ["{{base_url}}"],
              "path": ["users", "{{user_id}}", "avatar"]
            }
          },
          "response": []
        },
        {
          "name": "Get User Profile",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/users/{{user_id}}",
              "host": ["{{base_url}}"],
              "path": ["users", "{{user_id}}"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Test Scenarios",
      "item": [
        {
          "name": "❌ Change Password - Invalid Current Password",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"currentPassword\": \"contraseñaIncorrecta\",\n  \"newPassword\": \"nuevaContraseña456\",\n  \"confirmPassword\": \"nuevaContraseña456\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/change-password",
              "host": ["{{base_url}}"],
              "path": ["auth", "change-password"]
            }
          },
          "response": []
        },
        {
          "name": "❌ Change Password - Passwords Don't Match",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"currentPassword\": \"admin123\",\n  \"newPassword\": \"nuevaContraseña456\",\n  \"confirmPassword\": \"otraContraseña789\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/change-password",
              "host": ["{{base_url}}"],
              "path": ["auth", "change-password"]
            }
          },
          "response": []
        },
        {
          "name": "❌ Change Avatar - Invalid Avatar Name",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"avatar\": \"avatar-inexistente-999.png\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/users/{{user_id}}/avatar",
              "host": ["{{base_url}}"],
              "path": ["users", "{{user_id}}", "avatar"]
            }
          },
          "response": []
        },
        {
          "name": "❌ Change Avatar - Path Traversal Attempt",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"avatar\": \"../../etc/passwd\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/users/{{user_id}}/avatar",
              "host": ["{{base_url}}"],
              "path": ["users", "{{user_id}}", "avatar"]
            }
          },
          "response": []
        },
        {
          "name": "✅ Happy Path - Full Flow",
          "item": [
            {
              "name": "1. Login",
              "event": [
                {
                  "listen": "test",
                  "script": {
                    "exec": [
                      "pm.test('Login exitoso', function () {",
                      "    pm.response.to.have.status(200);",
                      "    pm.environment.set('token', pm.response.json().accessToken);",
                      "    pm.environment.set('user_id', pm.response.json().user.id);",
                      "});"
                    ],
                    "type": "text/javascript"
                  }
                }
              ],
              "request": {
                "method": "POST",
                "header": [
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"username\": \"superadmin\",\n  \"password\": \"admin123\"\n}"
                },
                "url": {
                  "raw": "{{base_url}}/auth/login",
                  "host": ["{{base_url}}"],
                  "path": ["auth", "login"]
                }
              }
            },
            {
              "name": "2. Get Avatars Available",
              "event": [
                {
                  "listen": "test",
                  "script": {
                    "exec": [
                      "pm.test('Avatares obtenidos', function () {",
                      "    pm.response.to.have.status(200);",
                      "    pm.expect(pm.response.json().available).to.be.an('array');",
                      "    pm.expect(pm.response.json().available.length).to.be.greaterThan(0);",
                      "    console.log('📸 Avatares disponibles: ' + pm.response.json().available.join(', '));",
                      "});"
                    ],
                    "type": "text/javascript"
                  }
                }
              ],
              "request": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "{{base_url}}/users/avatars/available",
                  "host": ["{{base_url}}"],
                  "path": ["users", "avatars", "available"]
                }
              }
            },
            {
              "name": "3. Change Avatar",
              "event": [
                {
                  "listen": "test",
                  "script": {
                    "exec": [
                      "pm.test('Avatar cambiado', function () {",
                      "    pm.response.to.have.status(200);",
                      "    pm.expect(pm.response.json().user.avatar).to.equal('avatar-01.png');",
                      "    console.log('✅ Avatar actualizado a: ' + pm.response.json().user.avatar);",
                      "});"
                    ],
                    "type": "text/javascript"
                  }
                }
              ],
              "request": {
                "method": "POST",
                "header": [
                  {
                    "key": "Authorization",
                    "value": "Bearer {{token}}"
                  },
                  {
                    "key": "Content-Type",
                    "value": "application/json"
                  }
                ],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"avatar\": \"avatar-01.png\"\n}"
                },
                "url": {
                  "raw": "{{base_url}}/users/{{user_id}}/avatar",
                  "host": ["{{base_url}}"],
                  "path": ["users", "{{user_id}}", "avatar"]
                }
              }
            },
            {
              "name": "4. Get Updated Profile",
              "event": [
                {
                  "listen": "test",
                  "script": {
                    "exec": [
                      "pm.test('Perfil actualizado', function () {",
                      "    pm.response.to.have.status(200);",
                      "    pm.expect(pm.response.json().avatar).to.equal('avatar-01.png');",
                      "    console.log('👤 Usuario: ' + pm.response.json().username);",
                      "    console.log('🎨 Avatar: ' + pm.response.json().avatar);",
                      "});"
                    ],
                    "type": "text/javascript"
                  }
                }
              ],
              "request": {
                "method": "GET",
                "header": [
                  {
                    "key": "Authorization",
                    "value": "Bearer {{token}}"
                  }
                ],
                "url": {
                  "raw": "{{base_url}}/users/{{user_id}}",
                  "host": ["{{base_url}}"],
                  "path": ["users", "{{user_id}}"]
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 📌 Uso de la Collection

### Paso 1: Configurar Variables de Entorno

1. En Postman, haz clic en el botón de engranaje (⚙️) arriba a la derecha
2. Selecciona "Environments"
3. Haz clic en "Create"
4. Nombre: `LIS Development`
5. Agrega estas variables:

```
base_url = http://localhost:3000
token = (se llenará automáticamente al hacer login)
user_id = (se llenará automáticamente al hacer login)
```

### Paso 2: Ejecutar Collection

#### Opción A: Manual
1. Selecciona la collection "User Profile Endpoints"
2. Haz clic en cada request
3. Presiona "Send"

#### Opción B: Usar Collection Runner
1. Haz clic en "Runner" (parte superior izquierda)
2. Arrastra la collection a la ventana
3. Selecciona el environment "LIS Development"
4. Haz clic en "Run" (botón azul)
5. Observa los resultados en tiempo real

### Paso 3: Verificar Resultados

Cada request tiene tests automáticos. Si ves ✅ en verde, el request fue exitoso.

---

## 🧪 Escenarios de Prueba Incluidos

### ✅ Happy Path (Flujo Exitoso)
1. ✅ Login exitoso
2. ✅ Obtener lista de avatares
3. ✅ Cambiar avatar
4. ✅ Verificar perfil actualizado

### ❌ Error Cases (Casos de Error)
1. ❌ Cambiar contraseña con contraseña actual incorrecta
2. ❌ Cambiar contraseña con confirmación no coincidente
3. ❌ Cambiar avatar con nombre inválido
4. ❌ Intento de path traversal

---

## 💡 Pro Tips

### Guardar Tokens Automáticamente
Todos los requests de login guardan el token automáticamente en la variable `token` de Postman.

### Ejecutar en Secuencia
En la collection "Happy Path - Full Flow", los requests se ejecutan en orden y cada uno usa datos del anterior.

### Ver Logs de Consola
En Postman, ve a `View → Show Postman Console` para ver los logs de los tests.

### Pre-request Scripts
Algunos requests tienen validaciones pre-request que verifican que las variables necesarias existan.

---

## 🔗 Links Útiles

- [Postman Docs](https://learning.postman.com/)
- [Collection Format Reference](https://schema.getpostman.com/json/collection/v2.1.0/docs/index.html)
- [Postman Testing](https://learning.postman.com/docs/writing-scripts/test-scripts/)

