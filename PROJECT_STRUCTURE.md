# 📁 Структура проекта "Система управления компанией"

## 🗂️ Общая структура

```
MongoProjext/
├── 📄 server.js              # Главный сервер приложения
├── 📄 package.json           # Зависимости и скрипты
├── 📄 .env                   # Переменные окружения
├── 📄 .gitignore            # Исключения для Git
├── 📄 README.md             # Основная документация (270 строк)
├── 📄 INSTRUCTIONS.md       # Краткие инструкции
├── 📄 REPORT.md             # Подробный отчет по проекту
├── 📄 SCREENSHOT_GUIDE.md   # Инструкция для скриншотов
├── 📄 PROJECT_STRUCTURE.md  # Данный файл
├── 📁 setup/
│   └── 📄 setup.js          # Скрипт инициализации БД
└── 📁 public/
    ├── 📄 index.html        # Веб-интерфейс
    └── 📄 app.js           # Клиентский JavaScript
```

## 📋 Описание файлов

### 🚀 Серверная часть

#### `server.js` (330 строк)
**Описание:** Основной файл сервера на Node.js + Express.js  
**Функции:**
- REST API с 18 endpoints
- JWT аутентификация
- CRUD операции для всех сущностей
- 3 отчета с агрегацией MongoDB
- Простые запросы поиска
- Система безопасности с проверкой прав доступа

**Ключевые технологии:**
```javascript
// Основные зависимости
const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
```

**API Endpoints:**
- `POST /api/auth/login` - Аутентификация
- `GET/POST/PUT/DELETE /api/employees` - CRUD сотрудников  
- `GET/POST/PUT/DELETE /api/projects` - CRUD проектов
- `GET/POST/PUT/DELETE /api/departments` - CRUD отделов
- `GET /api/reports/*` - 3 отчета с агрегацией
- `GET /api/search/employees` - Поиск сотрудников

### 🗄️ База данных

#### `setup/setup.js` (180 строк)
**Описание:** Скрипт инициализации базы данных  
**Функции:**
- Создание 4 коллекций: users, employees, projects, departments
- Создание 12 индексов для оптимизации
- Заполнение тестовыми данными
- Хеширование паролей пользователей

**Создаваемые данные:**
- 3 пользователя с разными правами доступа
- 6 сотрудников в 4 отделах
- 4 проекта с разными статусами
- 4 отдела компании

**Индексы для оптимизации:**
```javascript
// Индексы employees
{ name: 1, department: 1, position: 1, salary: 1, email: 1 }

// Индексы projects  
{ name: 1, status: 1, department: 1, startDate: 1, endDate: 1 }

// Индексы departments
{ name: 1, location: 1 }

// Индексы users
{ username: 1 }
```

### 🎨 Клиентская часть

#### `public/index.html` (520 строк)
**Описание:** Современный веб-интерфейс с Bootstrap 5  
**Компоненты:**
- Страница входа с анимациями
- Панель управления (Dashboard)
- Разделы: Сотрудники, Проекты, Отделы, Отчеты
- Модальные окна для CRUD операций
- Адаптивный дизайн для мобильных устройств

**Технологии дизайна:**
- Bootstrap 5.3.0
- Font Awesome 6.0.0
- CSS3 анимации и transitions
- Градиентные фоны
- Карточки с тенями и hover эффектами

#### `public/app.js` (850 строк)
**Описание:** Клиентский JavaScript для всего функционала  
**Основные функции:**

**Аутентификация:**
```javascript
async function login(username, password)     // Вход в систему
function logout()                           // Выход
function checkAuth()                        // Проверка токена
```

**CRUD Сотрудники:**
```javascript  
async function loadEmployees()              // Загрузка списка
async function addEmployee()                // Добавление
async function editEmployee(id)             // Редактирование  
async function deleteEmployee(id)           // Удаление
async function searchEmployees()            // Поиск
```

**CRUD Проекты:**
```javascript
async function loadProjects()               // Загрузка карточек
async function addProject()                 // Добавление
async function editProject(id)              // Редактирование
async function deleteProject(id)            // Удаление
```

**CRUD Отделы:**
```javascript  
async function loadDepartments()            // Загрузка карточек
async function addDepartment()              // Добавление
async function editDepartment(id)           // Редактирование
async function deleteDepartment(id)         // Удаление
```

**Отчеты:**
```javascript
async function loadReports()                // Загрузка всех отчетов
async function loadEmployeesByDepartment()  // Сотрудники по отделам
async function loadProjectsByStatus()       // Проекты по статусам  
async function loadSalaryStatistics()       // Статистика зарплат
```

**Утилиты:**
```javascript
async function apiRequest(endpoint, options) // HTTP запросы
function showAlert(id, message, type)        // Уведомления
function showToast(message, type)            // Toast сообщения
```

### ⚙️ Конфигурация

#### `package.json`
**Зависимости:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongodb": "^6.3.0", 
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1"
  }
}
```

**Скрипты:**
```json
{
  "scripts": {
    "start": "node server.js",
    "setup": "node setup/setup.js",
    "dev": "nodemon server.js"
  }
}
```

#### `.env`
**Переменные окружения:**
```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=company_db
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
```

#### `.gitignore`
**Исключения для Git:**
- node_modules/
- Логи и временные файлы
- .env файлы
- IDE настройки
- Системные файлы

### 📚 Документация

#### `README.md` (270 строк)
**Содержание:**
- Подробное описание проекта
- Инструкции по установке и запуску
- Документация API с примерами
- Описание функций веб-интерфейса
- Информация о безопасности
- Структура базы данных
- Требования и зависимости

#### `INSTRUCTIONS.md` (50 строк)
**Краткие инструкции:**
- Быстрый старт проекта
- Основные команды
- Данные для входа

#### `REPORT.md` (570 строк)
**Подробный отчет:**
- Выполнение всех требований задания
- Код всех API endpoints
- Описание функций фронтенда
- Система безопасности
- Структура базы данных с индексами
- Статистика проекта

#### `SCREENSHOT_GUIDE.md` (120 строк)
**Инструкция для скриншотов:**
- Список необходимых скриншотов
- Пошаговые инструкции
- Рекомендации по качеству
- Именование файлов

## 📊 Статистика кода

| Компонент | Файлы | Строки кода | Описание |
|-----------|-------|-------------|----------|
| **Backend** | 2 | 510 | server.js + setup.js |
| **Frontend** | 2 | 1,370 | index.html + app.js |
| **Документация** | 5 | 1,200+ | README, отчеты, инструкции |
| **Конфигурация** | 3 | 60 | package.json, .env, .gitignore |
| **ИТОГО** | 12 | 3,140+ | Полный проект |

## 🎯 Ключевые особенности

### ✅ Выполнение требований:
- [x] База данных с 4+ коллекциями
- [x] Пользовательский графический интерфейс 
- [x] 3 уровня пользователей с разными правами
- [x] Продуманные индексы (12 индексов)
- [x] 3+ отчетные формы с агрегацией
- [x] Простые запросы поиска

### 🔧 Технические особенности:
- REST API с 18 endpoints
- JWT аутентификация
- Хеширование паролей bcrypt
- Адаптивный дизайн Bootstrap 5
- Оптимизированные MongoDB запросы
- Система прав доступа
- Современный ES6+ JavaScript

### 🎨 UX/UI особенности:
- Современный материальный дизайн
- Анимации и transitions
- Toast уведомления
- Адаптивность для мобильных
- Интуитивная навигация
- Загрузочные индикаторы

## 🚀 Готовность к production

Проект готов к развертыванию в production окружении:
- ✅ Безопасность (JWT, хеширование паролей)
- ✅ Оптимизация (индексы MongoDB)
- ✅ Документация (подробная)
- ✅ Обработка ошибок
- ✅ Адаптивный дизайн
- ✅ Git репозиторий

**GitHub:** https://github.com/saqreed/MongoProjext.git 