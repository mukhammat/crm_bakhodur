# CRM Bakhodur - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints (except `/auth/*`) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Auth Endpoints

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "string",
  "password": "string",
  "name": "string",
  "roleId": number,
  "registerKey": "string"  // optional
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response:
{
  "token": "string",
  "user": { ... }
}
```

---

## 👥 Users Endpoints

### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
Roles: MANAGER, ADMIN

Query params:
  ?roleId=number  // optional filter
```

### Update User
```http
PUT /api/users
Authorization: Bearer <token>
Roles: MANAGER, ADMIN
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "isActive": boolean
}
```

### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
Roles: ADMIN
```

---

## 📋 Tasks Endpoints

### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Roles: MANAGER, ADMIN
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "statusId": number,
  "dueDate": "ISO 8601 datetime string"  // optional
}
```

### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
Roles: MANAGER, ADMIN

Query params:
  ?statusId=number
  ?createdBy=uuid
  ?assignedTo=uuid
```

### Get Task by ID
```http
GET /api/tasks/:id
Authorization: Bearer <token>
Roles: MANAGER, ADMIN
```

### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Roles: MANAGER, ADMIN
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "statusId": number,
  "dueDate": "ISO 8601 datetime string"  // optional
}
```

### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
Roles: ADMIN
```

### Assign Task to User
```http
POST /api/tasks/assign-task-worker
Authorization: Bearer <token>
Roles: MANAGER, ADMIN
Content-Type: application/json

{
  "taskId": "uuid",
  "userId": "uuid"
}
```

### Unassign Task from User
```http
DELETE /api/tasks/unassign-task-from-worker/:id
Authorization: Bearer <token>
Roles: MANAGER, ADMIN
```

### Get Assignment Statistics
```http
GET /api/tasks/assignment-length/:id
Authorization: Bearer <token>
Roles: ADMIN

Response: { "rows": number }
```

---

## 🔑 User Roles Endpoints

### Generate Registration Key
```http
GET /api/user-roles/generate-key/:role
Authorization: Bearer <token>
Roles: ADMIN

Path params:
  :role - "MANAGER" | "WORKER"

Response:
{
  "data": {
    "key": "string"
  }
}
```

---

## 📊 Database Schema

### Users
- `id` (uuid, PK)
- `roleId` (int, FK -> user_roles)
- `email` (varchar, unique)
- `hash` (varchar)
- `name` (varchar)
- `isActive` (boolean)
- `telegramId` (int, unique, nullable)

### Tasks
- `id` (uuid, PK)
- `title` (varchar)
- `description` (text)
- `statusId` (int, FK -> task_statuses)
- `createdAt` (timestamp)
- `dueDate` (timestamp, nullable)
- `createdBy` (uuid, FK -> users)

### Task Assignments
- `id` (uuid, PK)
- `taskId` (uuid, FK -> tasks)
- `userId` (uuid, FK -> users)
- `assignedAt` (timestamp)

### Task Statuses
- `id` (int, PK)
- `title` (varchar, unique)

### User Roles
- `id` (int, PK)
- `title` (varchar, unique)

---

## 🔒 Role-Based Access Control

### Roles
1. **ADMIN** - Full access
2. **MANAGER** - Can manage tasks and users
3. **WORKER** - Limited access (via Telegram bot)

### Permissions Matrix

| Endpoint | ADMIN | MANAGER | WORKER |
|----------|-------|---------|--------|
| `/auth/*` | ✅ | ✅ | ✅ |
| `/users/me` | ✅ | ✅ | ✅ |
| `/users` | ✅ | ✅ | ❌ |
| `/users/:id` (DELETE) | ✅ | ❌ | ❌ |
| `/tasks/*` | ✅ | ✅ | ❌ |
| `/tasks/:id` (DELETE) | ✅ | ❌ | ❌ |
| `/user-roles/*` | ✅ | ❌ | ❌ |

---

## 📝 Notes

1. JWT tokens are returned on login and must be included in subsequent requests
2. User IDs are UUIDs (v4)
3. Task and User IDs are UUIDs
4. All timestamps are ISO 8601 format
5. CORS is enabled for all origins
6. Error responses follow format: `{ "error": "message" }`
7. Success responses typically include `{ "data": { ... } }` wrapper

