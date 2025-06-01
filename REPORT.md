# 📊 Отчет по проекту "Система управления компанией"

## 📋 Общая информация

**Название проекта:** MongoDB Project - Система управления компанией  
**Технологии:** Node.js, Express.js, MongoDB, HTML5, CSS3, JavaScript, Bootstrap 5  
**Тип приложения:** Веб-приложение с REST API  
**Репозиторий:** https://github.com/saqreed/MongoProjext.git

## ✅ Выполнение требований задания

### 1. База данных и коллекции ✅

**Создана БД:** `company_db` с 4 коллекциями:
- `users` - пользователи системы
- `employees` - сотрудники компании  
- `projects` - проекты компании
- `departments` - отделы компании

### 2. Пользовательский графический интерфейс ✅

**Реализовано:** Современное веб-приложение с полным CRUD функционалом

### 3. Три уровня пользователей ✅

| Пользователь | Логин | Пароль | Права доступа |
|--------------|-------|--------|---------------|
| **admin** | admin | admin123 | Полный доступ (CRUD) |
| **manager** | manager | manager123 | Чтение + изменение |
| **viewer** | viewer | viewer123 | Только чтение |

### 4. Продуманные индексы ✅

**Созданы индексы для оптимизации поиска по часто используемым полям**

### 5. Отчетные формы ✅

**Агрегация:** 3 отчета с функциями агрегации  
**Простые запросы:** Поиск и фильтрация данных

---

## 🖥️ Интерфейс приложения

### 📸 Скриншоты интерфейса (для отчета нужно сделать):

1. **Страница входа** - `http://localhost:3000`
2. **Панель управления** - главная страница после входа
3. **Раздел "Сотрудники"** - таблица с данными и поиском
4. **Добавление сотрудника** - модальное окно
5. **Раздел "Проекты"** - карточки проектов
6. **Раздел "Отделы"** - карточки отделов
7. **Раздел "Отчеты"** - 3 отчета с агрегацией

---

## 🔧 Бэкенд - API Endpoints и код

### 1. Аутентификация

#### POST `/api/auth/login` - Вход в систему

```javascript
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.collection('users').findOne({ username });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, permissions: user.permissions },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { username: user.username, permissions: user.permissions } });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
```

**Функциональность:**
- Проверка учетных данных
- Хеширование паролей с bcrypt
- Генерация JWT токена
- Возврат пользователя и токена

---

### 2. CRUD операции для сотрудников

#### GET `/api/employees` - Получение всех сотрудников

```javascript
app.get('/api/employees', authenticateToken, checkPermission('read'), async (req, res) => {
  try {
    const employees = await db.collection('employees').find({}).toArray();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения сотрудников' });
  }
});
```

#### POST `/api/employees` - Добавление сотрудника

```javascript
app.post('/api/employees', authenticateToken, checkPermission('write'), async (req, res) => {
  try {
    const result = await db.collection('employees').insertOne(req.body);
    res.status(201).json({ message: 'Сотрудник добавлен', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка добавления сотрудника' });
  }
});
```

#### PUT `/api/employees/:id` - Обновление сотрудника

```javascript
app.put('/api/employees/:id', authenticateToken, checkPermission('write'), async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const result = await db.collection('employees').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.json({ message: 'Сотрудник обновлен', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления сотрудника' });
  }
});
```

#### DELETE `/api/employees/:id` - Удаление сотрудника

```javascript
app.delete('/api/employees/:id', authenticateToken, checkPermission('admin'), async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const result = await db.collection('employees').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Сотрудник удален', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления сотрудника' });
  }
});
```

---

### 3. CRUD операции для проектов

#### GET `/api/projects` - Получение всех проектов

```javascript
app.get('/api/projects', authenticateToken, checkPermission('read'), async (req, res) => {
  try {
    const projects = await db.collection('projects').find({}).toArray();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения проектов' });
  }
});
```

#### POST `/api/projects` - Добавление проекта

```javascript
app.post('/api/projects', authenticateToken, checkPermission('write'), async (req, res) => {
  try {
    const result = await db.collection('projects').insertOne(req.body);
    res.status(201).json({ message: 'Проект добавлен', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка добавления проекта' });
  }
});
```

#### PUT `/api/projects/:id` - Обновление проекта

```javascript
app.put('/api/projects/:id', authenticateToken, checkPermission('write'), async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.json({ message: 'Проект обновлен', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления проекта' });
  }
});
```

#### DELETE `/api/projects/:id` - Удаление проекта

```javascript
app.delete('/api/projects/:id', authenticateToken, checkPermission('admin'), async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const result = await db.collection('projects').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Проект удален', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления проекта' });
  }
});
```

---

### 4. CRUD операции для отделов

#### GET `/api/departments` - Получение всех отделов

```javascript
app.get('/api/departments', authenticateToken, checkPermission('read'), async (req, res) => {
  try {
    const departments = await db.collection('departments').find({}).toArray();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения отделов' });
  }
});
```

#### POST `/api/departments` - Добавление отдела

```javascript
app.post('/api/departments', authenticateToken, checkPermission('write'), async (req, res) => {
  try {
    const result = await db.collection('departments').insertOne(req.body);
    res.status(201).json({ message: 'Отдел добавлен', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка добавления отдела' });
  }
});
```

#### PUT `/api/departments/:id` - Обновление отдела

```javascript
app.put('/api/departments/:id', authenticateToken, checkPermission('write'), async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const result = await db.collection('departments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.json({ message: 'Отдел обновлен', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления отдела' });
  }
});
```

#### DELETE `/api/departments/:id` - Удаление отдела

```javascript
app.delete('/api/departments/:id', authenticateToken, checkPermission('admin'), async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const result = await db.collection('departments').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Отдел удален', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления отдела' });
  }
});
```

---

### 5. Отчеты с функциями агрегации

#### GET `/api/reports/employees-by-department` - Сотрудники по отделам

```javascript
app.get('/api/reports/employees-by-department', authenticateToken, checkPermission('read'), async (req, res) => {
  try {
    const report = await db.collection('employees').aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
          employees: { $push: { name: '$name', position: '$position' } }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка генерации отчета' });
  }
});
```

**Функциональность:**
- Группировка сотрудников по отделам
- Подсчет количества сотрудников в каждом отделе
- Расчет средней зарплаты по отделам
- Сортировка по количеству сотрудников

#### GET `/api/reports/projects-by-status` - Проекты по статусам

```javascript
app.get('/api/reports/projects-by-status', authenticateToken, checkPermission('read'), async (req, res) => {
  try {
    const report = await db.collection('projects').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          projects: { $push: { name: '$name', budget: '$budget' } }
        }
      }
    ]).toArray();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка генерации отчета' });
  }
});
```

**Функциональность:**
- Группировка проектов по статусам
- Подсчет количества проектов в каждом статусе
- Расчет общего бюджета по статусам
- Список проектов для каждого статуса

#### GET `/api/reports/salary-statistics` - Статистика зарплат

```javascript
app.get('/api/reports/salary-statistics', authenticateToken, checkPermission('read'), async (req, res) => {
  try {
    const report = await db.collection('employees').aggregate([
      {
        $group: {
          _id: null,
          avgSalary: { $avg: '$salary' },
          minSalary: { $min: '$salary' },
          maxSalary: { $max: '$salary' },
          totalEmployees: { $sum: 1 }
        }
      }
    ]).toArray();
    res.json(report[0] || {});
  } catch (error) {
    res.status(500).json({ error: 'Ошибка генерации отчета' });
  }
});
```

**Функциональность:**
- Расчет средней зарплаты
- Поиск минимальной зарплаты
- Поиск максимальной зарплаты
- Подсчет общего количества сотрудников

---

### 6. Простые запросы

#### GET `/api/search/employees` - Поиск сотрудников

```javascript
app.get('/api/search/employees', authenticateToken, checkPermission('read'), async (req, res) => {
  try {
    const { name, department, position } = req.query;
    let query = {};
    
    if (name) query.name = { $regex: name, $options: 'i' };
    if (department) query.department = department;
    if (position) query.position = { $regex: position, $options: 'i' };
    
    const employees = await db.collection('employees').find(query).toArray();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка поиска сотрудников' });
  }
});
```

**Функциональность:**
- Поиск по имени (регулярные выражения, нечувствительно к регистру)
- Фильтрация по отделу (точное совпадение)
- Поиск по должности (регулярные выражения)
- Комбинированный поиск по нескольким параметрам

---

## 🔐 Система безопасности

### Middleware для аутентификации

```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа отсутствует' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Недействительный токен' });
    req.user = user;
    next();
  });
};
```

### Middleware для проверки прав доступа

```javascript
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(requiredPermission) && !req.user.permissions.includes('admin')) {
      return res.status(403).json({ error: 'Недостаточно прав для выполнения операции' });
    }
    next();
  };
};
```

---

## 🗄️ Структура базы данных

### Индексы для оптимизации

**Коллекция employees:**
```javascript
await db.collection('employees').createIndex({ name: 1 });
await db.collection('employees').createIndex({ department: 1 });
await db.collection('employees').createIndex({ position: 1 });
await db.collection('employees').createIndex({ salary: 1 });
await db.collection('employees').createIndex({ email: 1 }, { unique: true });
```

**Коллекция projects:**
```javascript
await db.collection('projects').createIndex({ name: 1 });
await db.collection('projects').createIndex({ status: 1 });
await db.collection('projects').createIndex({ department: 1 });
await db.collection('projects').createIndex({ startDate: 1, endDate: 1 });
```

**Коллекция departments:**
```javascript
await db.collection('departments').createIndex({ name: 1 }, { unique: true });
await db.collection('departments').createIndex({ location: 1 });
```

**Коллекция users:**
```javascript
await db.collection('users').createIndex({ username: 1 }, { unique: true });
```

---

## 🎨 Фронтенд функции

### 1. Аутентификация

**Функция входа:**
```javascript
async function login(username, password) {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username, password }
    });
    
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showMainApp();
    loadDashboard();
  } catch (error) {
    showAlert('loginAlert', error.message, 'danger');
  }
}
```

### 2. Загрузка данных Dashboard

```javascript
async function loadDashboard() {
  try {
    const [employees, projects, departments, salaryStats] = await Promise.all([
      apiRequest('/employees'),
      apiRequest('/projects'),
      apiRequest('/departments'),
      apiRequest('/reports/salary-statistics')
    ]);
    
    document.getElementById('employeesCount').textContent = employees.length;
    document.getElementById('projectsCount').textContent = projects.length;
    document.getElementById('departmentsCount').textContent = departments.length;
    document.getElementById('avgSalary').textContent = salaryStats.avgSalary ? 
      Math.round(salaryStats.avgSalary).toLocaleString() + ' ₽' : '-';
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}
```

### 3. CRUD операции сотрудников

**Загрузка сотрудников:**
```javascript
async function loadEmployees() {
  const loading = document.getElementById('employeesLoading');
  const tableBody = document.getElementById('employeesTableBody');
  
  loading.style.display = 'block';
  
  try {
    const employees = await apiRequest('/employees');
    
    tableBody.innerHTML = employees.map(employee => `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <i class="fas fa-user-circle fa-2x text-primary me-2"></i>
            <div>
              <div class="fw-bold">${employee.name}</div>
              <small class="text-muted">${employee.email}</small>
            </div>
          </div>
        </td>
        <td><span class="badge bg-secondary">${employee.position}</span></td>
        <td>${employee.department}</td>
        <td class="fw-bold">${employee.salary.toLocaleString()} ₽</td>
        <td>${employee.email}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="editEmployee('${employee._id}')">
            <i class="fas fa-edit"></i>
          </button>
          ${currentUser.permissions.includes('admin') ? `
            <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee('${employee._id}')">
              <i class="fas fa-trash"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');
    
  } catch (error) {
    showAlert('employeesAlert', error.message, 'danger');
  } finally {
    loading.style.display = 'none';
  }
}
```

**Добавление сотрудника:**
```javascript
async function addEmployee() {
  const form = document.getElementById('addEmployeeForm');
  const formData = new FormData(form);
  
  const employee = {
    name: formData.get('name'),
    position: formData.get('position'),
    department: formData.get('department'),
    salary: parseInt(formData.get('salary')),
    email: formData.get('email'),
    phone: formData.get('phone'),
    skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()) : [],
    hireDate: new Date()
  };
  
  try {
    await apiRequest('/employees', {
      method: 'POST',
      body: employee
    });
    
    bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal')).hide();
    form.reset();
    loadEmployees();
    showToast('Сотрудник успешно добавлен!', 'success');
  } catch (error) {
    showAlert('employeeModalAlert', error.message, 'danger');
  }
}
```

### 4. Поиск и фильтрация

```javascript
async function searchEmployees() {
  const name = document.getElementById('searchEmployees').value;
  const department = document.getElementById('filterDepartment').value;
  const position = document.getElementById('filterPosition').value;
  
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  if (department) params.append('department', department);
  if (position) params.append('position', position);
  
  try {
    const employees = await apiRequest(`/search/employees?${params.toString()}`);
    // Обновление таблицы с результатами поиска
  } catch (error) {
    console.error('Error searching employees:', error);
  }
}