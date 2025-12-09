# Recipe API

REST API untuk aplikasi resep masakan.

## Base URL

```
http://localhost:3000/api/v1
```

## API Endpoints

### Authentication

| Method | Path | Status |
|--------|------|--------|
| POST | `/auth/register` | 🟢 Public |
| POST | `/auth/login` | 🟢 Public |

### Recipes

| Method | Path | Status |
|--------|------|--------|
| GET | `/recipes` | 🟢 Public |
| GET | `/recipes/:id` | 🟢 Public |
| POST | `/recipes` | 🔒 Protected |
| PUT | `/recipes/:id` | 🔒 Protected |
| DELETE | `/recipes/:id` | 🔒 Protected |

### Search

| Method | Path | Status |
|--------|------|--------|
| GET | `/search?q={keyword}` | 🟢 Public |

### Reviews

| Method | Path | Status |
|--------|------|--------|
| GET | `/recipes/:id/reviews` | 🟢 Public |
| POST | `/recipes/:id/reviews` | 🔒 Protected |

### Saved Recipes

| Method | Path | Status |
|--------|------|--------|
| GET | `/users/saved` | 🔒 Protected |
| POST | `/users/saved` | 🔒 Protected |
| DELETE | `/users/saved/:recipe_id` | 🔒 Protected |

---

**Legend:**
- 🟢 **Public** - Tidak memerlukan autentikasi
- 🔒 **Protected** - Memerlukan JWT Token di header `Authorization: Bearer <token>`
