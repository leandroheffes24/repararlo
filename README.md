# 🔧 Repararlo

**El "Mercado Libre" de los servicios para el hogar en Argentina.**
Encontrá plomeros, electricistas, albañiles, gasistas y más: profesionales verificados,
con reseñas reales, para contactar gratis.

> Estado actual: **MVP funcionando** con datos de ejemplo. Listo para conectar una base
> de datos real (Supabase) y publicarse online (Vercel), todo con planes **gratuitos**.

---

## 🚀 Cómo correrla en tu compu

Necesitás tener instalado [Node.js](https://nodejs.org) (versión 20 o superior).

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Levantar la app en modo desarrollo
npm run dev
```

Después abrí tu navegador en **http://localhost:3000** 🎉

Otros comandos útiles:

```bash
npm run build   # genera la versión optimizada para producción
npm run start   # corre esa versión optimizada
npm run lint    # revisa el código
```

---

## 🗺️ Qué incluye el MVP

| Página | Ruta | Qué hace |
|---|---|---|
| Inicio | `/` | Hero con buscador, rubros, profesionales destacados, cómo funciona |
| Búsqueda | `/buscar` | Buscador con filtros por rubro, zona, calificación, disponibilidad y orden |
| Rubro | `/categorias/plomeria` | Listado de profesionales de cada rubro |
| Perfil | `/profesionales/[nombre]` | Perfil completo: reseñas, especialidades, zonas y contacto |
| Cómo funciona | `/como-funciona` | Explicación para clientes y profesionales |
| Sumate | `/sumate` | Landing + registro para profesionales |
| Registro | `/registrarse` | Crear cuenta (cliente o profesional) |
| Ingresar | `/ingresar` | Inicio de sesión |
| Mi panel | `/panel` | Panel protegido: el profesional crea y edita su perfil |

**Modelo de negocio (etapa actual):** la plataforma **conecta** clientes con
profesionales de forma **gratuita**. El contacto es directo (WhatsApp / teléfono) y el
pago lo arreglan entre las partes. Sin comisiones. La monetización (suscripciones,
destacados, etc.) se suma más adelante, cuando haya volumen de usuarios.

---

## 🧱 Tecnología (todo con plan gratis)

- **Next.js 16** + **React 19** + **TypeScript** → la web.
- **Tailwind CSS v4** → los estilos.
- **lucide-react** → los íconos.
- **Supabase** (opcional, ver abajo) → base de datos, usuarios y archivos.
- **Vercel** (opcional, ver abajo) → para publicarla en internet.

Los datos de ejemplo viven en [`src/lib/data/`](src/lib/data/). Hoy la app funciona
100% con esos datos, sin depender de ningún servicio externo.

---

## 🗄️ Conectar la base de datos real (Supabase) — opcional

Mientras tanto la app funciona con datos de ejemplo. Cuando quieras que los registros
de profesionales se **guarden de verdad**:

1. Creá una cuenta gratis en **https://supabase.com** y un proyecto nuevo.
2. En el panel de Supabase: **SQL Editor → New query**, pegá el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y ejecutá (crea las tablas y los rubros).
3. En **Project Settings → API** copiá los 3 valores.
4. En la raíz del proyecto, creá un archivo `.env.local` (copiá `.env.local.example`) y
   completá:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
   SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role
   ```

5. Reiniciá la app (`npm run dev`).

Desde ese momento funciona la **autenticación real**: las personas se registran como
cliente o profesional, y cada profesional que crea su perfil queda guardado en la base
y **aparece automáticamente en el directorio**.

> La app es auto-suficiente: con `schema.sql` alcanza. El archivo
> `supabase/02-auth-policies.sql` es **opcional** (agrega políticas de seguridad extra),
> no es necesario para que el registro funcione.

### ✉️ Importante: confirmación de email

Por defecto, Supabase pide **confirmar el email** al registrarse. Para testear más rápido
podés desactivarlo en **Authentication → Sign In / Providers → Email → "Confirm email"**.
La app contempla las dos opciones (si está activado, muestra un aviso de "revisá tu email").

---

## 🌐 Publicarla en internet (Vercel) — opcional

1. Subí el proyecto a un repositorio de **GitHub**.
2. Entrá a **https://vercel.com**, "Add New Project" e importá ese repo.
3. Si usás Supabase, cargá las mismas variables de entorno en Vercel
   (**Settings → Environment Variables**).
4. Deploy. ✅ Vercel te da una URL pública gratis (y podés conectar tu dominio
   `repararlo.com.ar` después).

---

## 🛣️ Próximos pasos sugeridos

- [x] Registro e inicio de sesión real (Supabase Auth) para clientes y profesionales.
- [x] Panel del profesional para editar su perfil.
- [x] Directorio que lee profesionales reales desde Supabase (con respaldo a ejemplos).
- [ ] Subir fotos de trabajos al perfil (Supabase Storage).
- [ ] Sistema de reseñas verificadas (solo quien contrató puede calificar).
- [ ] Notificaciones por WhatsApp/email cuando llega un contacto.
- [ ] Geolocalización y búsqueda por mapa.
- [ ] Monetización: perfiles destacados y planes para profesionales.

---

Hecho en Argentina 🇦🇷 — pensado para escalar a toda Latinoamérica.
