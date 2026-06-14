# Arquitectura del Frontend

## Tecnologías principales

- React 19: la app está construida como una SPA con componentes funcionales y hooks.
- Vite: build tool y servidor de desarrollo.
- React Router v7: para manejar el enrutado de páginas.
- Firebase Auth: para la autenticación de usuarios con Google.
- Fetch API nativa: para las llamadas a la API del backend.
- ESLint: configuración básica para mantener la calidad de código.

## Organización del proyecto

La aplicación sigue una estructura de carpetas clara:

- `src/`
  - `App.jsx`: define la estructura principal de la aplicación, envolviendo el router y el proveedor de autenticación.
  - `main.jsx`: punto de entrada que monta React en el DOM.
  - `context/`
    - `AuthContext.jsx`: contexto global para el estado de autenticación y perfil del usuario.
  - `routes/`
    - `ProtectedRoute.jsx`: componente de ruta protegido que valida sesión y perfil antes de renderizar.
  - `services/`
    - `api.js`: funciones para llamar al backend, incluyendo gestión de token e headers.
    - `auth.js`: reexporta utilidades de Firebase.
    - `firebase.js`: inicializa Firebase Auth con variables de entorno.
  - `pages/`
    - `Nav.jsx`: navegación principal del sitio.
    - `Login.jsx`: página de inicio de sesión.
    - `Register.jsx`: página de registro.
    - `Users.jsx`: listado o gestión de usuarios.
    - `UserDetail.jsx`: detalle de un usuario.
    - `Calendar.jsx`: vista de calendario.
    - `Inicio.jsx`: pantalla principal del dashboard.
    - `PendingProfile.jsx`: estado intermedio cuando el usuario no tiene perfil asignado.
    - `NotFound.jsx`: página 404.
  - `assets/`: recursos estáticos usados por la app.
  - `utils/`
    - `errors.js`: manejo de errores.
    - `validation.js`: reglas de validación.

## Cómo funciona el sistema de autenticación con Firebase

El cliente usa Firebase Auth solo para manejar el inicio de sesión de Google y mantener la sesión activa.

- `src/services/firebase.js` carga la configuración de Firebase desde variables de entorno:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_APP_ID`
- Si falta alguna variable, `hasFirebaseConfig` queda en `false` y se muestra un error de configuración.
- El objeto `auth` se exporta para usarlo en otros servicios.

En `AuthContext.jsx` se hace lo siguiente:

- `onAuthStateChanged(auth, ...)` escucha los cambios de sesión de Firebase.
- Si aparece un usuario Firebase (`currentFirebaseUser`), se llama a `refreshProfile()`.
- `refreshProfile()` consulta al backend con `getMe()` para obtener el perfil completo del usuario.
- El perfil se guarda en el estado `user` y en `localStorage`.
- Si el usuario no está autenticado en Firebase, se establece el estado como `anonymous`.

El login usa `signInWithPopup(auth, provider)` con `GoogleAuthProvider`.
El logout llama a la API de backend `logoutUser()` y luego a `signOut(auth)` para cerrar sesión en Firebase.

## Contextos y stores de estado global

Solo hay un contexto global principal:

- `AuthContext`
  - `firebaseUser`: el usuario autenticado por Firebase.
  - `user`: el perfil recuperado desde la API del backend.
  - `loading`: indicador de carga global del flujo de autenticación.
  - `profileStatus`: estado lógico del perfil, con valores como:
    - `loading`
    - `anonymous`
    - `config-error`
    - `pending-profile`
    - `denied`
    - `ready`
  - `authError`: mensaje de error de autenticación o perfil.
  - `login()`: función para iniciar sesión con Google.
  - `logout()`: función para cerrar sesión.
  - `refreshProfile()`: recarga el perfil desde el backend.

Este contexto es el que usan `ProtectedRoute` y `AppRoutes` para decidir si se muestra la navegación, si la ruta es accesible, o si se debe redirigir al login.

## Configuración del router y rutas

La app usa `BrowserRouter` y `Routes` en `App.jsx`.

Rutas definidas:

- `/` → `Inicio` (protegida)
- `/login` → `Login`
- `/register` → `Register`
- `/users` → `Users` (protegida)
- `/users/:id` → `UserDetail` (protegida)
- `/calendar` → `Calendar` (protegida)
- `*` → `NotFound`

Las rutas protegidas se envuelven con `ProtectedRoute`, que valida:

- carga en progreso: muestra un mensaje de espera.
- error de configuración de Firebase: muestra alerta.
- perfil pendiente: renderiza `PendingProfile`.
- acceso denegado: muestra alerta.
- usuario no autenticado: redirige a `/login`.

Además, `App.jsx` decide si se muestra `Nav` según si hay usuario y el perfil está `ready`.

## Patrón y convenciones para llamadas a la API

El archivo `src/services/api.js` centraliza todas las llamadas HTTP:

- `API_BASE_URL` viene de `import.meta.env.VITE_API_BASE_URL` con fallback a `http://localhost:3000/api/user`.
- `request(path, options)` construye la petición:
  - `Content-Type: application/json`
  - agrega `Authorization: Bearer <token>` si no se usa `skipAuth`.
  - convierte el cuerpo a JSON si `body` está presente.
- Antes de cada petición autenticada obtiene el token de Firebase con `auth.currentUser.getIdToken()`.
- Maneja respuestas no exitosas lanzando un `Error` con `status` y `details`.

Funciones de API expuestas:

- `getMe()`
- `logoutUser()`
- `getUsers()`
- `getUserById(id)`
- `createUser(payload)`
- `updateUser(id, payload)`
- `deleteUser(id)`

Esto implementa un patrón consistente: un wrapper `request()` para peticiones REST, con autenticación transparente y manejo centralizado de errores y JSON.

## Qué resuelve cada parte

- `main.jsx`: monta la app React.
- `App.jsx`: configura router, contexto y layout principal.
- `AuthContext.jsx`: controla sesión Firebase, perfil de usuario y estados de autorización.
- `ProtectedRoute.jsx`: protege secciones privadas y gestiona estados de acceso.
- `firebase.js`: inicializa Firebase Auth a partir de variables de entorno.
- `api.js`: encapsula el consumo del backend y la identidad del usuario.
- `pages/`: contienen la interfaz de usuario para login, registro, dashboard, usuarios y calendario.
- `Nav.jsx`: sirve de menú principal cuando el usuario está autenticado.

En conjunto, el frontend resuelve la autenticación con Firebase, protege rutas sensibles, mantiene el perfil del usuario en un contexto global y consume un backend API segura usando tokens de Firebase para autorizar solicitudes.