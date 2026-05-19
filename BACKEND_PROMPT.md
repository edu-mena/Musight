# GiraSightin — Full-Stack MVP Prompt
## Backend (PHP + MySQL on Hostinger) + Frontend PWA Integration

---

## 1. Project Overview

**GiraSightin** is an Angolan civic journalism platform. Citizens read articles (written at 3 complexity levels), participate in expert debates, and ask questions to an AI assistant called **Weza**.

**Access levels:**
- **Public** — Landing, login, register, policies
- **User/Reader** (`/app/*`) — Read articles, participate in debates, use Weza
- **Researcher/Expert** (`/researcher/*`) — Publish articles, create debates, manage own content
- **Admin** (`/admin/*`) — Approve/reject content, manage all users, view platform stats

---

## 2. Tech Stack

**Backend:**
- PHP 8.1+ (pure PHP, no framework)
- MySQL 8.0
- Apache (Hostinger shared or VPS)
- JWT authentication (HS256, manual implementation — no Composer required; use a simple JWT library you inline)
- File uploads handled by PHP (audio + images)

**Frontend (existing React app — to be modified):**
- React 18 + TypeScript + Vite
- React Router v6
- Tailwind CSS
- Convert to PWA (manifest.json + service worker)
- Replace all mock data with real API calls via `fetch`

**AI (Weza):**
- Call the Anthropic Claude API (or OpenAI) from PHP via cURL
- Model: `claude-haiku-4-5-20251001` (fast, cheap)
- System prompt: "You are Weza, a civic journalism AI assistant for the Angolan platform GiraSightin. Answer questions about news, civic topics, economics, health, and public policy, always in European Portuguese (Portugal/Angola orthography). Be concise, factual, and neutral. If you cite facts, note they should be verified with official sources."

---

## 3. Database Schema (MySQL)

Run this SQL exactly on your Hostinger MySQL database:

```sql
CREATE DATABASE IF NOT EXISTS girasightin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE girasightin;

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                  VARCHAR(150)  NOT NULL,
  email                 VARCHAR(150)  NOT NULL UNIQUE,
  password_hash         VARCHAR(255)  NOT NULL,
  role                  ENUM('user','researcher','expert','admin') NOT NULL DEFAULT 'user',
  verified              TINYINT(1)    NOT NULL DEFAULT 0,
  suspended             TINYINT(1)    NOT NULL DEFAULT 0,
  avatar                VARCHAR(300)  NULL,
  bio                   TEXT          NULL,
  -- Academic
  academic_level        VARCHAR(100)  NULL,
  academic_area         VARCHAR(150)  NULL,
  institution           VARCHAR(200)  NULL,
  -- Professional
  profession            VARCHAR(150)  NULL,
  organization          VARCHAR(200)  NULL,
  -- Links
  website               VARCHAR(255)  NULL,
  linkedin              VARCHAR(255)  NULL,
  -- Researcher application
  applied_for_researcher TINYINT(1)   NOT NULL DEFAULT 0,
  researcher_focus_area  VARCHAR(150) NULL,
  researcher_motivation  TEXT         NULL,
  portfolio_url          VARCHAR(255) NULL,
  -- Stats (denormalised for speed)
  contributions         INT UNSIGNED  NOT NULL DEFAULT 0,
  debates_count         INT UNSIGNED  NOT NULL DEFAULT 0,
  created_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- USER EXPERTISE AREAS
-- ─────────────────────────────────────────
CREATE TABLE user_expertise (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  topic       VARCHAR(150) NOT NULL,
  level       ENUM('basico','intermedio','avancado') NOT NULL DEFAULT 'basico',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- ARTICLES
-- ─────────────────────────────────────────
CREATE TABLE articles (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  author_id         INT UNSIGNED NOT NULL,
  title             VARCHAR(300) NOT NULL,
  category          VARCHAR(100) NOT NULL,
  excerpt           VARCHAR(500) NULL,
  article_date      DATE         NULL,
  status            ENUM('rascunho','em_revisao','publicado','recusado') NOT NULL DEFAULT 'rascunho',
  rejection_reason  TEXT         NULL,
  has_audio         TINYINT(1)   NOT NULL DEFAULT 0,
  audio_duration    VARCHAR(20)  NULL,
  audio_src         VARCHAR(300) NULL,
  image             VARCHAR(300) NULL,
  views             INT UNSIGNED NOT NULL DEFAULT 0,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- ARTICLE CONTENT LEVELS
-- ─────────────────────────────────────────
CREATE TABLE article_levels (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  article_id  INT UNSIGNED NOT NULL,
  level       ENUM('basico','intermedio','avancado') NOT NULL,
  label       VARCHAR(50)  NOT NULL,
  sublabel    VARCHAR(100) NULL,
  content     LONGTEXT     NOT NULL,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  UNIQUE KEY uq_article_level (article_id, level)
);

-- ─────────────────────────────────────────
-- ARTICLE KEY TERMS (GLOSSARY)
-- ─────────────────────────────────────────
CREATE TABLE article_key_terms (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  article_id  INT UNSIGNED NOT NULL,
  term        VARCHAR(150) NOT NULL,
  definition  TEXT         NOT NULL,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- ARTICLE REFERENCES
-- ─────────────────────────────────────────
CREATE TABLE article_references (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  article_id  INT UNSIGNED NOT NULL,
  label       VARCHAR(300) NOT NULL,
  url         VARCHAR(300) NULL,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- DEBATES
-- ─────────────────────────────────────────
CREATE TABLE debates (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  author_id         INT UNSIGNED NOT NULL,
  title             VARCHAR(300) NOT NULL,
  category          VARCHAR(100) NOT NULL,
  summary           TEXT         NOT NULL,
  stance            ENUM('favor','neutro','contra') NOT NULL DEFAULT 'neutro',
  initial_argument  TEXT         NULL,
  status            ENUM('rascunho','em_revisao','publicado','recusado') NOT NULL DEFAULT 'em_revisao',
  rejection_reason  TEXT         NULL,
  participants      INT UNSIGNED NOT NULL DEFAULT 0,
  experts_count     INT UNSIGNED NOT NULL DEFAULT 0,
  hot               TINYINT(1)   NOT NULL DEFAULT 0,
  debate_date       DATE         NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- DEBATE INVITED EXPERTS
-- ─────────────────────────────────────────
CREATE TABLE debate_invited_experts (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  debate_id   INT UNSIGNED NOT NULL,
  name        VARCHAR(150) NOT NULL,
  FOREIGN KEY (debate_id) REFERENCES debates(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- COMMENTS (on debates)
-- ─────────────────────────────────────────
CREATE TABLE comments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  debate_id   INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  content     TEXT         NOT NULL,
  side        ENUM('favor','neutro','contra') NOT NULL DEFAULT 'neutro',
  likes       INT UNSIGNED NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (debate_id) REFERENCES debates(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- COMMENT LIKES (prevent double-like)
-- ─────────────────────────────────────────
CREATE TABLE comment_likes (
  user_id     INT UNSIGNED NOT NULL,
  comment_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, comment_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- WEZA (AI chat history per user)
-- ─────────────────────────────────────────
CREATE TABLE weza_messages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  question    TEXT         NOT NULL,
  answer      TEXT         NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- SEED: default admin account
-- password: admin2026 (bcrypt hash)
-- ─────────────────────────────────────────
INSERT INTO users (name, email, password_hash, role, verified)
VALUES ('Admin GiraSightin', 'admin@girassol.ao',
        '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'admin', 1);
```

---

## 4. Backend Folder Structure

```
/public_html/api/          ← or /public_html/backend/api/
  index.php                ← Single entry point (front controller)
  .htaccess                ← URL rewriting
  config/
    database.php           ← PDO connection
    jwt.php                ← JWT encode/decode helpers
    cors.php               ← CORS headers
    env.php                ← Constants (DB creds, JWT secret, AI key)
  middleware/
    auth.php               ← requireAuth() — validates JWT, returns user array
    adminOnly.php          ← requireAdmin()
    researcherOnly.php     ← requireResearcher() — researcher or expert
  controllers/
    AuthController.php
    UserController.php
    ArticleController.php
    DebateController.php
    CommentController.php
    WezaController.php
    AdminController.php
  helpers/
    response.php           ← json_success(), json_error()
    upload.php             ← handle file uploads
  uploads/
    audio/
    images/
```

---

## 5. API Contract

**Base URL:** `https://api.girasightin.ao/` (or your Hostinger subdomain)
**All responses:** `Content-Type: application/json`
**Auth:** `Authorization: Bearer <jwt_token>` header on protected routes

### Standard Response Envelope

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "Human-readable message", "code": 422 }
```

---

### AUTH ENDPOINTS

#### POST /auth/register
```json
// Request
{
  "name": "Ana Silveira",
  "email": "ana@example.com",
  "password": "senha123",
  "terms_accepted": true
}

// Response 201
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": {
      "id": 1,
      "name": "Ana Silveira",
      "email": "ana@example.com",
      "role": "user",
      "verified": false,
      "joinedAt": "Maio 2026",
      "contributions": 0,
      "debates": 0
    }
  }
}
```
Validations: name required (min 2), email valid + unique, password min 8, terms_accepted must be true.

#### POST /auth/login
```json
// Request
{ "email": "ana@example.com", "password": "senha123" }

// Response 200 — same envelope as register
```

#### GET /auth/me  🔒 requires token
```json
// Response 200
{
  "success": true,
  "data": {
    "id": 1, "name": "...", "email": "...", "role": "user",
    "verified": false, "bio": null,
    "academic_level": null, "academic_area": null, "institution": null,
    "profession": null, "organization": null,
    "website": null, "linkedin": null,
    "expertise": [],
    "contributions": 0, "debates": 0,
    "applied_for_researcher": false,
    "joinedAt": "Maio 2026"
  }
}
```

---

### USER ENDPOINTS

#### PUT /users/profile  🔒
Update own profile. Accept JSON body with any of:
`name, bio, academic_level, academic_area, institution, profession, organization, website, linkedin, expertise`

Where `expertise` is an array:
```json
{ "expertise": [{ "topic": "Economia", "level": "avancado" }] }
```
Delete all existing `user_expertise` rows for this user, then re-insert.

#### POST /users/apply-researcher  🔒
```json
// Request
{
  "focus_area": "Economia",
  "motivation": "Texto com pelo menos 20 caracteres...",
  "portfolio_url": "https://..."  // optional
}
// Sets applied_for_researcher=1, stores fields, returns updated user
```

---

### ARTICLE ENDPOINTS (Public)

#### GET /articles
Query params: `?category=Economia&page=1&limit=10`
Returns published articles only. Each article object:
```json
{
  "id": 1,
  "title": "...",
  "category": "Economia",
  "excerpt": "...",
  "date": "06 MAI 2026",
  "author": { "id": 4, "name": "Mariana Fonseca", "role": "researcher", "verified": true },
  "has_audio": true,
  "audio_duration": "8 min",
  "has_references": true,
  "views": 1240,
  "status": "publicado"
}
```

#### GET /articles/{id}
Returns full article including levels, key_terms, references. Increments views counter by 1.
```json
{
  "id": 1,
  "title": "...",
  "category": "Economia",
  "excerpt": "...",
  "date": "06 MAI 2026",
  "author": { "id": 4, "name": "Mariana Fonseca", "role": "researcher", "verified": true },
  "has_audio": true,
  "audio_duration": "8 min",
  "audio_src": "/uploads/audio/filename.mp3",
  "image": null,
  "views": 1241,
  "levels": [
    { "id": "basico", "label": "Básico", "sublabel": "Para o Cidadão", "text": "..." },
    { "id": "intermedio", "label": "Intermédio", "sublabel": "Visão Prática", "text": "..." },
    { "id": "avancado", "label": "Avançado", "sublabel": "Análise Técnica", "text": "..." }
  ],
  "key_terms": [
    { "term": "Taxa BNA", "definition": "..." }
  ],
  "references": [
    { "label": "BNA — Comunicado...", "url": "https://..." }
  ]
}
```

---

### ARTICLE ENDPOINTS (Researcher) 🔒 researcher or expert role

#### GET /researcher/articles
Own articles with all statuses. Same article list format but includes `rejection_reason`.

#### POST /researcher/articles
```json
// Request (multipart/form-data to support audio/image uploads)
{
  "title": "...",
  "category": "Economia",
  "excerpt": "...",
  "article_date": "2026-05-16",
  "status": "em_revisao",  // or "rascunho"
  "levels": [
    { "level": "basico", "label": "Básico", "sublabel": "Para o Cidadão", "text": "..." },
    { "level": "intermedio", "label": "Intermédio", "sublabel": "Visão Prática", "text": "..." },
    { "level": "avancado", "label": "Avançado", "sublabel": "Análise Técnica", "text": "..." }
  ],
  "key_terms": [{ "term": "...", "definition": "..." }],
  "references": [{ "label": "...", "url": "..." }],
  "audio": <file>,   // optional
  "image": <file>    // optional
}
// Returns created article (201)
```
Validation: title required, category required, at least "basico" level content required.
On submit (status=em_revisao): all good. On save (status=rascunho): save as-is.
Increments `users.contributions` when status becomes `em_revisao` or `publicado`.

#### PUT /researcher/articles/{id}
Same fields as POST. Only author can update. Cannot edit if status is `publicado`.

#### DELETE /researcher/articles/{id}
Soft-delete or hard-delete. Only author. Cannot delete if `publicado`. Returns 200.

---

### DEBATE ENDPOINTS (Public)

#### GET /debates
Query: `?category=Economia&page=1&limit=10`
Returns published debates only.
```json
{
  "id": 1,
  "title": "...",
  "category": "Economia",
  "summary": "...",
  "author": { "id": 4, "name": "Mariana Fonseca", "role": "researcher", "verified": true },
  "participants": 892,
  "experts": 8,
  "date": "Hoje",
  "hot": true,
  "status": "publicado",
  "comment_count": 2
}
```

#### GET /debates/{id}
Full debate with comments:
```json
{
  ...debate fields...,
  "comments": [
    {
      "id": 1,
      "author": { "id": 2, "name": "António Paim", "role": "user", "verified": false },
      "text": "...",
      "side": "contra",
      "likes": 120,
      "time": "45min",
      "user_liked": false
    }
  ]
}
```

#### POST /debates/{id}/comments  🔒 any authenticated user
```json
// Request
{ "text": "Meu argumento...", "side": "favor" }
// Returns created comment (201)
// Increments debate.participants if user is new to this debate
// Increments users.debates_count for the commenter
```

#### POST /comments/{id}/like  🔒
Toggle like on a comment. Checks `comment_likes` table to prevent duplicates. Returns `{ "liked": true, "likes": 121 }`.

---

### DEBATE ENDPOINTS (Researcher) 🔒 researcher or expert role

#### GET /researcher/debates
Own debates with all statuses.

#### POST /researcher/debates
```json
{
  "title": "...",
  "category": "Economia",
  "summary": "...",  // max 300 chars
  "stance": "favor",
  "initial_argument": "...",
  "invited_experts": ["Nome Especialista 1", "Nome Especialista 2"]  // max 3, optional
}
// status auto-set to "em_revisao"
// Returns created debate (201)
```

#### DELETE /researcher/debates/{id}
Only author. Cannot delete if `publicado`.

---

### WEZA (AI Chat) 🔒

#### POST /weza
```json
// Request
{ "question": "O que é a taxa BNA?" }

// Response
{ "success": true, "data": { "answer": "A taxa BNA é..." } }
```

**PHP implementation using Anthropic API:**
```php
$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    'Content-Type: application/json',
    'x-api-key: ' . ANTHROPIC_API_KEY,
    'anthropic-version: 2023-06-01'
  ],
  CURLOPT_POSTFIELDS => json_encode([
    'model' => 'claude-haiku-4-5-20251001',
    'max_tokens' => 400,
    'system' => 'És a Weza, assistente de jornalismo cívico da plataforma GiraSightin de Angola. Responde sempre em português europeu (ortografia angolana). Sê conciso, factual e neutro. Máximo 3 parágrafos.',
    'messages' => [['role' => 'user', 'content' => $question]]
  ])
]);
$result = json_decode(curl_exec($ch), true);
$answer = $result['content'][0]['text'] ?? 'Não foi possível obter resposta.';
// Save to weza_messages, return $answer
```

Store the conversation in `weza_messages`. Add the `ANTHROPIC_API_KEY` to `config/env.php`.

---

### ADMIN ENDPOINTS 🔒 admin role only

#### GET /admin/stats
```json
{
  "total_users": 1284,
  "users_this_month": 87,
  "articles_in_review": 4,
  "debates_in_review": 3,
  "total_published": 38,
  "total_debates": 12,
  "pending_applications": 2
}
```
Compute these with COUNT queries.

#### GET /admin/users
Query: `?role=researcher&suspended=0&applied=1&search=Carlos&page=1&limit=20`
Returns all users with their expertise arrays.

#### PUT /admin/users/{id}
```json
// Accept any subset of:
{
  "role": "researcher",
  "verified": true,
  "suspended": false,
  "applied_for_researcher": false
}
```

#### DELETE /admin/users/{id}
Hard delete. Cannot delete self (admin deleting own account). Returns 200.

#### GET /admin/articles
Query: `?status=em_revisao&page=1&limit=20`
Returns all articles regardless of author, with author info and has_references flag.

#### PUT /admin/articles/{id}/approve
Sets `status = 'publicado'`. Returns updated article.

#### PUT /admin/articles/{id}/reject
```json
// Request
{ "reason": "Necessita de mais fontes primárias..." }
// Sets status = 'recusado', saves rejection_reason
```

#### GET /admin/debates
Query: `?status=em_revisao&page=1&limit=20`

#### PUT /admin/debates/{id}/approve
Sets `status = 'publicado'`, `hot = 0`. Returns updated debate.

#### PUT /admin/debates/{id}/reject
```json
{ "reason": "Tema já coberto por debate activo..." }
```

---

## 6. JWT Implementation (no Composer)

Inline a minimal JWT library in `config/jwt.php`:

```php
define('JWT_SECRET', 'REPLACE_WITH_LONG_RANDOM_STRING_32_CHARS');
define('JWT_EXPIRY', 60 * 60 * 24 * 30); // 30 days

function jwt_encode(array $payload): string {
    $header  = base64url_encode(json_encode(['alg'=>'HS256','typ'=>'JWT']));
    $payload['exp'] = time() + JWT_EXPIRY;
    $payload['iat'] = time();
    $body    = base64url_encode(json_encode($payload));
    $sig     = base64url_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$sig";
}

function jwt_decode(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $body, $sig] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(base64url_decode($body), true);
    if (!$payload || $payload['exp'] < time()) return null;
    return $payload;
}

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}
```

In `middleware/auth.php`:
```php
function requireAuth(): array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token  = str_replace('Bearer ', '', $header);
    $payload = jwt_decode($token);
    if (!$payload) { json_error('Não autorizado', 401); exit; }
    // Fetch user from DB, check not suspended
    $user = db_find_user_by_id($payload['user_id']);
    if (!$user || $user['suspended']) { json_error('Acesso negado', 403); exit; }
    return $user;
}
```

---

## 7. Front Controller (index.php + .htaccess)

**.htaccess** (in `/api/`):
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ index.php [QSA,L]
```

**index.php** — route dispatcher:
```php
<?php
require_once 'config/env.php';
require_once 'config/database.php';
require_once 'config/jwt.php';
require_once 'config/cors.php';
require_once 'helpers/response.php';

cors_headers(); // sets CORS headers

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = preg_replace('#^/api#', '', $uri); // strip /api prefix
$parts  = explode('/', trim($uri, '/'));

// Route dispatch
match(true) {
    // Auth
    $uri === '/auth/register' && $method === 'POST' => (require 'controllers/AuthController.php')->register(),
    $uri === '/auth/login'    && $method === 'POST' => (require 'controllers/AuthController.php')->login(),
    $uri === '/auth/me'       && $method === 'GET'  => (require 'controllers/AuthController.php')->me(),
    // ... (add all routes)
    default => json_error('Endpoint não encontrado', 404)
};
```

Use a simple array-based router that matches method + URI pattern. For dynamic segments like `/articles/{id}`, use regex matching.

---

## 8. CORS Configuration (config/cors.php)

```php
function cors_headers(): void {
    $allowed = [
        'https://girasightin.ao',
        'https://www.girasightin.ao',
        'http://localhost:5173', // dev
    ];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowed, true)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
}
```

---

## 9. File Uploads (helpers/upload.php)

```php
function handle_upload(string $field, string $dir, array $allowed_mime): ?string {
    if (!isset($_FILES[$field]) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) return null;
    $file = $_FILES[$field];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime  = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    if (!in_array($mime, $allowed_mime)) json_error('Tipo de ficheiro não permitido', 422);
    $max = 50 * 1024 * 1024; // 50 MB
    if ($file['size'] > $max) json_error('Ficheiro demasiado grande', 422);
    $ext  = pathinfo($file['name'], PATHINFO_EXTENSION);
    $name = bin2hex(random_bytes(16)) . '.' . $ext;
    $path = __DIR__ . '/../uploads/' . $dir . '/' . $name;
    move_uploaded_file($file['tmp_name'], $path);
    return '/uploads/' . $dir . '/' . $name;
}

// Usage:
// $audio_src = handle_upload('audio', 'audio', ['audio/mpeg','audio/mp3','audio/wav']);
// $image     = handle_upload('image', 'images', ['image/jpeg','image/png','image/webp']);
```

---

## 10. Security Checklist

- [ ] **Password hashing:** Always use `password_hash($pwd, PASSWORD_BCRYPT, ['cost' => 12])` and `password_verify()`
- [ ] **SQL injection:** Use PDO prepared statements everywhere — NEVER concatenate user input into SQL
- [ ] **Input validation:** Validate and sanitise all inputs before use. Reject unexpected fields.
- [ ] **Rate limiting:** Add simple rate limiting on `/auth/login` (max 10 attempts/min per IP) using a `login_attempts` table or APCu
- [ ] **CORS:** Only allow your production domain and localhost in dev
- [ ] **JWT secret:** At least 32 random characters, stored only in `config/env.php` (never in git)
- [ ] **File uploads:** Validate MIME type by reading magic bytes (finfo), not file extension. Store outside webroot if possible, or use a random filename
- [ ] **HTTPS:** Enforce HTTPS via .htaccess `RewriteCond %{HTTPS} off`
- [ ] **Error handling:** Never expose PHP errors or stack traces in production. Use `ini_set('display_errors', 0)`
- [ ] **API keys:** Store `ANTHROPIC_API_KEY` in `env.php`, never commit to git

---

## 11. Hostinger Deployment Steps

1. **Upload backend** to `/public_html/api/` (or a subdomain `api.girasightin.ao` pointing to `/public_html/api/`)
2. **Create MySQL database** in Hostinger hPanel → Databases → MySQL Databases
3. **Run the SQL schema** via phpMyAdmin
4. **Edit `config/env.php`** with real DB credentials and JWT secret
5. **Set folder permissions:** `uploads/` → 755, PHP files → 644
6. **Enable `mod_rewrite`** — Hostinger shared hosting has it enabled by default
7. **Install SSL** — Hostinger hPanel → SSL → Install free Let's Encrypt
8. **Build React frontend:** `npm run build` — upload `/dist/` to `/public_html/` (or root)
9. **Add `public_html/.htaccess`** for React Router SPA fallback:
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_URI} !^/api/
   RewriteRule ^ index.html [L]
   ```

---

## 12. Frontend Modifications (PWA + API Integration)

### 12.1 Environment Variables

Create `.env.production`:
```
VITE_API_URL=https://api.girasightin.ao
```
Create `.env.development`:
```
VITE_API_URL=http://localhost:8000/api
```

### 12.2 API Client (src/lib/apiClient.ts)

Create a typed fetch wrapper:
```typescript
const BASE_URL = import.meta.env.VITE_API_URL;

function getToken(): string | null {
  return localStorage.getItem('girasightin_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? 'Erro desconhecido');
  return json.data as T;
}

export const api = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',  body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'POST', body: form, headers: {} }), // no Content-Type for FormData
};
```

### 12.3 AuthContext Changes

Replace mock login/register with real API calls:
```typescript
const login = async (email: string, password: string) => {
  const data = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
  localStorage.setItem('girasightin_token', data.token);
  localStorage.setItem('girasightin_user', JSON.stringify(data.user));
  setUser(data.user);
};

const register = async (name: string, email: string, password: string) => {
  const data = await api.post<{ token: string; user: User }>('/auth/register', {
    name, email, password, terms_accepted: true
  });
  localStorage.setItem('girasightin_token', data.token);
  localStorage.setItem('girasightin_user', JSON.stringify(data.user));
  setUser(data.user);
};

const logout = () => {
  localStorage.removeItem('girasightin_token');
  localStorage.removeItem('girasightin_user');
  setUser(null);
};
```

### 12.4 Data Fetching Pattern

Replace all mock data imports with `useEffect` + `api.get()`. Example for Articles list:
```typescript
const [articles, setArticles] = useState<Article[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  api.get<Article[]>('/articles')
    .then(setArticles)
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
}, []);
```

Show a spinner while loading, error message on failure.

### 12.5 PWA Setup

**public/manifest.json:**
```json
{
  "name": "GiraSightin",
  "short_name": "GiraSightin",
  "description": "Jornalismo cívico angolano",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f97316",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

**index.html** — add in `<head>`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#f97316">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="GiraSightin">
```

**public/sw.js** — basic service worker (cache-first for static assets, network-first for API):
```javascript
const CACHE = 'girasightin-v1';
const STATIC = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)))
);

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/')) {
    // Network first for API calls
    e.respondWith(fetch(e.request).catch(() => new Response('{"success":false,"error":"Sem ligação"}', {
      headers: { 'Content-Type': 'application/json' }
    })));
  } else {
    // Cache first for static assets
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
```

**Register the service worker in `src/main.tsx`:**
```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 12.6 Pages to Refactor (full list)

| Page | API calls needed |
|------|-----------------|
| `Home.tsx` | `GET /articles?limit=5`, `GET /debates?limit=3` |
| `Articles.tsx` | `GET /articles?category=&page=` |
| `ArticleDetail.tsx` | `GET /articles/{id}` |
| `Debates.tsx` | `GET /debates?category=&page=` |
| `DebateDetail.tsx` | `GET /debates/{id}`, `POST /debates/{id}/comments`, `POST /comments/{id}/like` |
| `AIChat.tsx` | `POST /weza` |
| `Profile.tsx` | `GET /auth/me`, `PUT /users/profile`, `POST /users/apply-researcher` |
| `ResearcherHome.tsx` | `GET /researcher/articles?limit=3`, `GET /admin/stats` (own subset) |
| `MyContent.tsx` | `GET /researcher/articles`, `GET /researcher/debates`, `DELETE /researcher/articles/{id}`, `DELETE /researcher/debates/{id}` |
| `PublishArticle.tsx` | `POST /researcher/articles` (multipart), `PUT /researcher/articles/{id}` |
| `PublishDebate.tsx` | `POST /researcher/debates` |
| `ResearcherProfile.tsx` | `GET /auth/me`, `PUT /users/profile` |
| `AdminHome.tsx` | `GET /admin/stats`, `GET /admin/articles?status=em_revisao&limit=3`, `GET /admin/debates?status=em_revisao&limit=3` |
| `ManageUsers.tsx` | `GET /admin/users`, `PUT /admin/users/{id}`, `DELETE /admin/users/{id}` |
| `ManageArticles.tsx` | `GET /admin/articles`, `PUT /admin/articles/{id}/approve`, `PUT /admin/articles/{id}/reject` |
| `ManageDebates.tsx` | `GET /admin/debates`, `PUT /admin/debates/{id}/approve`, `PUT /admin/debates/{id}/reject` |

---

## 13. Categories Reference

The following categories are valid for articles and debates:
```
Economia, Política, Saúde, Educação, Direito, Infraestruturas,
Diplomacia, Soberania Alimentar, Protecção Social,
Média & Comunicação, Ciência & Tecnologia,
Emprego, Energia, Justiça, Agricultura
```

Store in a `categories` table or as a PHP constant — your choice.

---

## 14. MVP Scope — What to NOT build yet

- Email notifications (mark as TODO comment)
- Push notifications
- Real-time comments (polling every 30s is fine for MVP)
- Password reset flow (can be added after MVP)
- Social login (Google/Facebook)
- Full-text search (use LIKE queries for MVP)
- Payments or subscriptions

---

## 15. Deliverables Expected

1. **Complete PHP backend** — all files organised per the folder structure above, all endpoints implemented
2. **MySQL schema** — the exact SQL from section 3
3. **Modified React frontend** — all pages refactored to use `apiClient.ts` instead of mock data; no import from `../../data/` mock files remaining
4. **PWA files** — `manifest.json`, `sw.js`, updated `index.html`
5. **`.env.example`** file documenting all required environment variables
6. **Hostinger deployment README** — step-by-step with exact hPanel paths

---

*GiraSightin — Jornalismo cívico para Angola*
