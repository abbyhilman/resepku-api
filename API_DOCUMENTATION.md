# Recipe API - Dokumentasi Lengkap

## Base URL
```
http://localhost:3000/api/v1
```

## Table of Contents
1. [Authentication](#authentication)
2. [Recipes](#recipes)
3. [Search](#search)
4. [Reviews](#reviews)
5. [Saved Recipes](#saved-recipes)
6. [Response Format](#response-format)
7. [Error Codes](#error-codes)

---

## Authentication

### 1. Register User

**Endpoint:** `POST /auth/register`

**Deskripsi:** Mendaftarkan user baru dengan email dan password. Password akan di-hash menggunakan bcrypt sebelum disimpan.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Validasi:**
- `email`: Required, format email valid
- `password`: Required, minimal 6 karakter
- `full_name`: Required

**Response Success (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "created_at": "2025-12-08T01:54:11.792Z"
  }
}
```

**Response Error (400 - Validation Error):**
```json
{
  "success": false,
  "message": "Email, password, and full name are required"
}
```

**Response Error (409 - Email Already Exists):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Contoh cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

---

### 2. Login User

**Endpoint:** `POST /auth/login`

**Deskripsi:** Login user dan mendapatkan JWT token yang berlaku selama 1 jam.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validasi:**
- `email`: Required
- `password`: Required

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "email": "user@example.com",
      "full_name": "John Doe"
    }
  }
}
```

**Response Error (401 - Invalid Credentials):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Contoh cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Catatan:**
- Token JWT berlaku selama 1 jam
- Simpan token untuk digunakan di endpoint yang memerlukan autentikasi
- Format token di header: `Authorization: Bearer <token>`

---

## Recipes

### 3. Get All Recipes

**Endpoint:** `GET /recipes`

**Deskripsi:** Mendapatkan daftar semua resep dengan pagination dan filtering.

**Headers:**
```
(Tidak ada header khusus diperlukan)
```

**Query Parameters:**

| Parameter | Type | Required | Default | Deskripsi |
|-----------|------|----------|---------|-----------|
| `limit` | integer | No | 10 | Jumlah resep per halaman |
| `offset` | integer | No | 0 | Offset untuk pagination |
| `prep_time_min` | integer | No | - | Filter resep dengan waktu persiapan <= nilai ini (dalam menit) |
| `average_rating` | decimal | No | - | Filter resep dengan rating >= nilai ini (1.0 - 5.0) |

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "recipe_id": 1,
      "title": "Nasi Goreng Spesial",
      "description": "Nasi goreng dengan bumbu rahasia",
      "prep_time_min": 20,
      "average_rating": "4.50",
      "created_at": "2025-12-08T01:00:00.000Z"
    },
    {
      "recipe_id": 2,
      "title": "Soto Ayam",
      "description": "Soto ayam kuah kuning",
      "prep_time_min": 45,
      "average_rating": "4.80",
      "created_at": "2025-12-08T01:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Contoh cURL:**

```bash
# Tanpa filter
curl http://localhost:3000/api/v1/recipes

# Dengan pagination
curl "http://localhost:3000/api/v1/recipes?limit=5&offset=10"

# Filter berdasarkan waktu persiapan (maksimal 30 menit)
curl "http://localhost:3000/api/v1/recipes?prep_time_min=30"

# Filter berdasarkan rating (minimal 4.0)
curl "http://localhost:3000/api/v1/recipes?average_rating=4.0"

# Kombinasi filter
curl "http://localhost:3000/api/v1/recipes?limit=10&prep_time_min=30&average_rating=4.5"
```

---

### 4. Create Recipe

**Endpoint:** `POST /recipes`

**Deskripsi:** Membuat resep baru lengkap dengan ingredients dan steps. Endpoint ini **memerlukan autentikasi**.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "title": "Nasi Goreng Spesial",
  "description": "Nasi goreng dengan bumbu rahasia",
  "prep_time_min": 25,
  "image_url": "https://example.com/image.jpg",
  "ingredients": [
    { "name": "Nasi putih", "quantity": "3", "unit": "piring" },
    { "name": "Bawang putih", "quantity": "4", "unit": "siung" }
  ],
  "steps": [
    { "instruction": "Panaskan minyak dalam wajan" },
    { "instruction": "Tumis bawang putih hingga harum" }
  ]
}
```

**Validasi:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Max 200 characters |
| `description` | string | Yes | Max 1000 characters |
| `prep_time_min` | integer | Yes | 1-1440 minutes |
| `image_url` | string | No | Valid URL |
| `ingredients` | array | Yes | Min 1 ingredient |
| `steps` | array | Yes | Min 1 step |

**Response Success (201):**
```json
{
  "success": true,
  "message": "Recipe created successfully",
  "data": {
    "recipe_id": 1,
    "title": "Nasi Goreng Spesial",
    "description": "Nasi goreng dengan bumbu rahasia",
    "prep_time_min": 25,
    "image_url": "https://example.com/image.jpg",
    "average_rating": "0.00",
    "created_at": "2025-12-08T03:03:04.223Z",
    "ingredients": [...],
    "steps": [...]
  }
}
```

**Contoh cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Nasi Goreng",
    "description": "Enak",
    "prep_time_min": 25,
    "ingredients": [{"name": "Nasi", "quantity": "3", "unit": "piring"}],
    "steps": [{"instruction": "Goreng nasi"}]
  }'
```

---

### 5. Get Recipe by ID

**Endpoint:** `GET /recipes/:id`

**Deskripsi:** Mendapatkan detail lengkap resep termasuk ingredients dan steps.

**Headers:**
```
(Tidak ada header khusus diperlukan)
```

**URL Parameters:**
- `id`: Recipe ID (integer)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "recipe_id": 1,
    "title": "Nasi Goreng Spesial",
    "description": "Nasi goreng dengan bumbu rahasia dan telur mata sapi",
    "prep_time_min": 20,
    "average_rating": "4.50",
    "created_at": "2025-12-08T01:00:00.000Z",
    "ingredients": [
      {
        "ingredient_id": 1,
        "name": "Nasi putih",
        "quantity": "3",
        "unit": "piring"
      },
      {
        "ingredient_id": 2,
        "name": "Bawang putih",
        "quantity": "3",
        "unit": "siung"
      },
      {
        "ingredient_id": 3,
        "name": "Telur",
        "quantity": "2",
        "unit": "butir"
      }
    ],
    "steps": [
      {
        "step_id": 1,
        "step_number": 1,
        "instruction": "Panaskan minyak, tumis bawang putih hingga harum"
      },
      {
        "step_id": 2,
        "step_number": 2,
        "instruction": "Masukkan nasi putih, aduk rata"
      },
      {
        "step_id": 3,
        "step_number": 3,
        "instruction": "Tambahkan kecap manis dan garam secukupnya"
      }
    ]
  }
}
```

**Response Error (404 - Recipe Not Found):**
```json
{
  "success": false,
  "message": "Recipe not found"
}
```

**Contoh cURL:**
```bash
curl http://localhost:3000/api/v1/recipes/1
```

---

### 6. Update Recipe

**Endpoint:** `PUT /recipes/:id`

**Deskripsi:** Memperbarui data resep yang sudah ada. Mendukung **partial update** (hanya field yang dikirim yang akan diupdate). Endpoint ini **memerlukan autentikasi**.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

**Request Body (Semua field opsional):**
```json
{
  "title": "Nasi Goreng Spesial Updated",
  "description": "Deskripsi baru...",
  "prep_time_min": 30,
  "image_url": "https://images.unsplash.com/photo-...",
  "ingredients": [...],
  "steps": [...]
}
```

**Catatan Penting:**
- `ingredients` dan `steps`: Jika field ini disertakan, sistem akan **menghapus** data lama dan **menggantinya** dengan data baru (Full Replace Strategy)
- `image_url`: Wajib berupa valid URL jika disertakan

**Response Success (200):**
```json
{
  "success": true,
  "message": "Recipe updated successfully",
  "data": {
    "recipe_id": 1,
    "title": "Nasi Goreng Spesial Updated",
    ...
  }
}
```

**Contoh cURL:**
```bash
curl -X PUT http://localhost:3000/api/v1/recipes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Nasi Goreng Updated", "prep_time_min": 30}'
```

---

### 7. Delete Recipe

**Endpoint:** `DELETE /recipes/:id`

**Deskripsi:** Menghapus resep berdasarkan ID beserta seluruh data terkait (ingredients, steps, reviews, saved_recipes). Endpoint ini **memerlukan autentikasi**.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Recipe deleted successfully",
  "data": {
    "recipe_id": 2,
    "title": "Nasi Goreng Spesial"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Recipe not found"
}
```

**Contoh cURL:**
```bash
curl -X DELETE http://localhost:3000/api/v1/recipes/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Search

### 8. Search Recipes

**Endpoint:** `GET /search`

**Deskripsi:** Mencari resep berdasarkan keyword di title, description, dan nama ingredient (case-insensitive).

**Headers:**
```
(Tidak ada header khusus diperlukan)
```

**Query Parameters:**

| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| `q` | string | Yes | Keyword pencarian |

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "recipe_id": 1,
      "title": "Nasi Goreng Spesial",
      "description": "Nasi goreng dengan bumbu rahasia",
      "prep_time_min": 20,
      "average_rating": "4.50",
      "created_at": "2025-12-08T01:00:00.000Z"
    },
    {
      "recipe_id": 4,
      "title": "Nasi Kuning",
      "description": "Nasi kuning untuk acara spesial",
      "prep_time_min": 40,
      "average_rating": "4.30",
      "created_at": "2025-12-08T01:00:00.000Z"
    }
  ],
  "count": 2,
  "query": "nasi"
}
```

**Response Error (400 - Missing Query):**
```json
{
  "success": false,
  "message": "Search query (q) is required"
}
```

**Contoh cURL:**
```bash
# Cari resep dengan keyword "ayam"
curl "http://localhost:3000/api/v1/search?q=ayam"

# Cari resep dengan keyword "nasi goreng"
curl "http://localhost:3000/api/v1/search?q=nasi%20goreng"

# Cari berdasarkan ingredient
curl "http://localhost:3000/api/v1/search?q=telur"
```

**Catatan:**
- Pencarian bersifat case-insensitive
- Mencari di kolom: title, description, dan ingredient name
- Hasil diurutkan berdasarkan average_rating (tertinggi) dan created_at (terbaru)

---

## Reviews

### 6. Create Review

**Endpoint:** `POST /recipes/:id/reviews`

**Deskripsi:** Membuat review untuk resep tertentu. Endpoint ini **memerlukan autentikasi**.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

**URL Parameters:**
- `id`: Recipe ID (integer)

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Resep yang sangat enak dan mudah dibuat!"
}
```

**Validasi:**
- `rating`: Required, integer 1-5
- `comment`: Optional, string

**Response Success (201):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review_id": 1,
    "recipe_id": 1,
    "user_id": 1,
    "rating": 5,
    "comment": "Resep yang sangat enak dan mudah dibuat!",
    "created_at": "2025-12-08T02:00:00.000Z"
  }
}
```

**Response Error (400 - Invalid Rating):**
```json
{
  "success": false,
  "message": "Rating must be between 1 and 5"
}
```

**Response Error (401 - Unauthorized):**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Response Error (404 - Recipe Not Found):**
```json
{
  "success": false,
  "message": "Recipe not found"
}
```

**Contoh cURL:**
```bash
# Simpan token dari login
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Buat review
curl -X POST http://localhost:3000/api/v1/recipes/1/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "rating": 5,
    "comment": "Resep yang sangat enak!"
  }'
```

**Catatan:**
- Setelah review dibuat, `average_rating` di tabel recipes akan otomatis di-update
- User ID diambil dari JWT token

---

### 7. Get Reviews for Recipe

**Endpoint:** `GET /recipes/:id/reviews`

**Deskripsi:** Mendapatkan semua review untuk resep tertentu beserta informasi user yang membuat review.

**Headers:**
```
(Tidak ada header khusus diperlukan)
```

**URL Parameters:**
- `id`: Recipe ID (integer)

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "review_id": 1,
      "rating": 5,
      "comment": "Enak banget! Resep favorit keluarga",
      "created_at": "2025-12-08T02:00:00.000Z",
      "user_id": 1,
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    {
      "review_id": 2,
      "rating": 4,
      "comment": "Mudah dibuat dan rasanya mantap",
      "created_at": "2025-12-08T02:30:00.000Z",
      "user_id": 2,
      "full_name": "Jane Smith",
      "email": "jane@example.com"
    }
  ],
  "count": 2
}
```

**Contoh cURL:**
```bash
curl http://localhost:3000/api/v1/recipes/1/reviews
```

---

## Saved Recipes

### 8. Get Saved Recipes

**Endpoint:** `GET /users/saved`

**Deskripsi:** Mendapatkan semua resep yang disimpan oleh user yang sedang login. Endpoint ini **memerlukan autentikasi**.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "saved_at": "2025-12-08T03:00:00.000Z",
      "recipe_id": 1,
      "title": "Nasi Goreng Spesial",
      "description": "Nasi goreng dengan bumbu rahasia",
      "prep_time_min": 20,
      "average_rating": "4.50",
      "created_at": "2025-12-08T01:00:00.000Z"
    },
    {
      "id": 2,
      "saved_at": "2025-12-08T03:15:00.000Z",
      "recipe_id": 2,
      "title": "Soto Ayam",
      "description": "Soto ayam kuah kuning",
      "prep_time_min": 45,
      "average_rating": "4.80",
      "created_at": "2025-12-08T01:00:00.000Z"
    }
  ],
  "count": 2
}
```

**Response Error (401 - Unauthorized):**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Contoh cURL:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:3000/api/v1/users/saved \
  -H "Authorization: Bearer $TOKEN"
```

---

### 9. Save Recipe

**Endpoint:** `POST /users/saved`

**Deskripsi:** Menyimpan resep ke daftar favorit user. Endpoint ini **memerlukan autentikasi**.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "recipe_id": 1
}
```

**Validasi:**
- `recipe_id`: Required, integer

**Response Success (201):**
```json
{
  "success": true,
  "message": "Recipe saved successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "recipe_id": 1,
    "saved_at": "2025-12-08T03:00:00.000Z"
  }
}
```

**Response Error (404 - Recipe Not Found):**
```json
{
  "success": false,
  "message": "Recipe not found"
}
```

**Response Error (409 - Already Saved):**
```json
{
  "success": false,
  "message": "Recipe already saved"
}
```

**Contoh cURL:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/api/v1/users/saved \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "recipe_id": 1
  }'
```

**Catatan:**
- Sistem akan mencegah duplikasi (user tidak bisa save resep yang sama 2x)

---

### 10. Remove Saved Recipe

**Endpoint:** `DELETE /users/saved/:id`

**Deskripsi:** Menghapus resep dari daftar favorit user. Endpoint ini **memerlukan autentikasi**.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**URL Parameters:**
- `id`: Recipe ID (integer) yang ingin dihapus dari saved

**Response Success (200):**
```json
{
  "success": true,
  "message": "Recipe removed from favorites"
}
```

**Response Error (404 - Not Found):**
```json
{
  "success": false,
  "message": "Saved recipe not found"
}
```

**Contoh cURL:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X DELETE http://localhost:3000/api/v1/users/saved/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## User Management

### 15. Get All Users

**Endpoint:** `GET /users`

**Deskripsi:** Mendapatkan daftar semua user dengan pagination. Password hash tidak ditampilkan untuk keamanan.

**Query Parameters:**

| Parameter | Type | Required | Default | Deskripsi |
|-----------|------|----------|---------|-----------|
| `limit` | integer | No | 10 | Jumlah user per halaman (max 100) |
| `offset` | integer | No | 0 | Offset untuk pagination |

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "created_at": "2025-12-08T02:56:23.615Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

**Contoh cURL:**
```bash
curl http://localhost:3000/api/v1/users
curl "http://localhost:3000/api/v1/users?limit=5&offset=0"
```

---

### 16. Delete User

**Endpoint:** `DELETE /users/:id`

**Deskripsi:** Menghapus user berdasarkan ID. Endpoint ini **memerlukan autentikasi** dan akan menghapus semua data terkait user (reviews, saved recipes) secara cascade.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "user_id": 1,
    "email": "test@example.com"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

**Contoh cURL:**
```bash
curl -X DELETE http://localhost:3000/api/v1/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Response Format

### Success Response
Semua response sukses mengikuti format:
```json
{
  "success": true,
  "message": "Success message",
  "data": { /* response data */ }
}
```

### Error Response
Semua response error mengikuti format:
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Error Codes

| HTTP Code | Deskripsi |
|-----------|-----------|
| 200 | OK - Request berhasil |
| 201 | Created - Resource berhasil dibuat |
| 400 | Bad Request - Request tidak valid atau data tidak lengkap |
| 401 | Unauthorized - Token tidak valid atau tidak ada |
| 404 | Not Found - Resource tidak ditemukan |
| 409 | Conflict - Data sudah ada (duplicate) |
| 500 | Internal Server Error - Error di server |

### JWT Token Errors

**Token Expired:**
```json
{
  "success": false,
  "message": "Token has expired. Please login again."
}
```

**Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid token."
}
```

**No Token Provided:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

---

## Testing Flow

### 1. Register & Login
```bash
# 1. Register user baru
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'

# 2. Login dan simpan token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token' > token.txt

# 3. Set token ke variable
TOKEN=$(cat token.txt)
```

### 2. Browse Recipes
```bash
# Get all recipes
curl http://localhost:3000/api/v1/recipes

# Get recipe detail
curl http://localhost:3000/api/v1/recipes/1

# Search recipes
curl "http://localhost:3000/api/v1/search?q=ayam"
```

### 3. Interact with Recipes
```bash
# Save recipe
curl -X POST http://localhost:3000/api/v1/users/saved \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"recipe_id": 1}'

# Create review
curl -X POST http://localhost:3000/api/v1/recipes/1/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"rating": 5, "comment": "Enak sekali!"}'

# Get saved recipes
curl http://localhost:3000/api/v1/users/saved \
  -H "Authorization: Bearer $TOKEN"
```

---

## Postman Collection

Untuk testing yang lebih mudah, Anda bisa import collection Postman dengan struktur berikut:

1. **Authentication**
   - Register User
   - Login User

2. **Recipes**
   - Get All Recipes
   - Get Recipe by ID
   - Get Recipes (with filters)

3. **Search**
   - Search Recipes

4. **Reviews**
   - Create Review
   - Get Reviews

5. **Saved Recipes**
   - Get Saved Recipes
   - Save Recipe
   - Remove Saved Recipe

---

## Notes

- Semua endpoint menggunakan JSON format
- Token JWT berlaku selama 1 jam
- Pagination menggunakan `limit` dan `offset`
- Semua timestamp dalam format ISO 8601 (UTC)
- Rating harus antara 1-5 (integer)
- Email harus format valid
- Password minimal 6 karakter
