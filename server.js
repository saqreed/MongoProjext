const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // ограничение до 100 запросов за окно
});
app.use(limiter);

// MongoDB подключение
let db;
MongoClient.connect(process.env.MONGODB_URI)
  .then(client => {
    console.log('Подключение к MongoDB успешно!');
    db = client.db('company_db');
  })
  .catch(error => console.error('Ошибка подключения к MongoDB:', error));

// Middleware для проверки JWT токена
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

// Middleware для проверки прав доступа
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(requiredPermission) && !req.user.permissions.includes('admin')) {
      return res.status(403).json({ error: 'Недостаточно прав для выполнения операции' });
    }
    next();
  };
};

// API Routes

// Аутентификация
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

// CRUD для сотрудников
app.get('/api/employees', authenticateToken, checkPermission('read'), async (req, res) => {
  try {
    const employees = await db.collection('employees').find({}).toArray();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения сотрудников' });
  }
});

app.post('/api/employees', authenticateToken, checkPermission('write'), async (req, res) => {
  try {
    const result = await db.collection('employees').insertOne(req.body);
    res.status(201).json({ message: 'Сотрудник добавлен', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка добавления сотрудника' });
  }
});

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

app.delete('/api/employees/:id', authenticateToken, checkPermission('admin'), async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    
    // Получаем информацию о сотруднике перед удалением
    const employeeToDelete = await db.collection('employees').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!employeeToDelete) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }
    
    // Проверяем, участвует ли сотрудник в активных проектах
    const activeProjects = await db.collection('projects').find({
      $or: [
        { manager: employeeToDelete.name },
        { team: { $in: [employeeToDelete.name] } }
      ],
      status: { $in: ['Планируется', 'В работе'] }
    }).toArray();
    
    if (activeProjects.length > 0) {
      return res.status(400).json({ 
        error: `Нельзя удалить сотрудника "${employeeToDelete.name}". Он участвует в ${activeProjects.length} активных проект(ах): ${activeProjects.map(p => p.name).join(', ')}.`,
        activeProjectsCount: activeProjects.length,
        activeProjects: activeProjects.map(p => p.name)
      });
    }
    
    const result = await db.collection('employees').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Сотрудник удален', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления сотрудника' });
  }
});

// CRUD для проектов
app.get('/api/projects', authenticateToken, checkPermission('read'), async (req, res) => {
  try {
    const projects = await db.collection('projects').find({}).toArray();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения проектов' });
  }
});

app.post('/api/projects', authenticateToken, checkPermission('write'), async (req, res) => {
  try {
    const result = await db.collection('projects').insertOne(req.body);
    res.status(201).json({ message: 'Проект добавлен', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка добавления проекта' });
  }
});

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

app.delete('/api/projects/:id', authenticateToken, checkPermission('admin'), async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    
    // Получаем информацию о проекте перед удалением
    const projectToDelete = await db.collection('projects').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!projectToDelete) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    // Проверяем, является ли проект активным (нельзя удалять активные проекты)
    if (projectToDelete.status === 'В работе' || projectToDelete.status === 'Планируется') {
      return res.status(400).json({ 
        error: `Нельзя удалить проект "${projectToDelete.name}" со статусом "${projectToDelete.status}". Завершите или отмените проект перед удалением.`,
        currentStatus: projectToDelete.status
      });
    }
    
    const result = await db.collection('projects').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Проект удален', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления проекта' });
  }
});

// CRUD для отделов
app.get('/api/departments', authenticateToken, checkPermission('read'), async (req, res) => {
  try {
    const departments = await db.collection('departments').find({}).toArray();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения отделов' });
  }
});

app.post('/api/departments', authenticateToken, checkPermission('write'), async (req, res) => {
  try {
    const result = await db.collection('departments').insertOne(req.body);
    res.status(201).json({ message: 'Отдел добавлен', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка добавления отдела' });
  }
});

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

app.delete('/api/departments/:id', authenticateToken, checkPermission('admin'), async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    
    // Получаем информацию об отделе перед удалением
    const departmentToDelete = await db.collection('departments').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!departmentToDelete) {
      return res.status(404).json({ error: 'Отдел не найден' });
    }
    
    // Проверяем, есть ли сотрудники в этом отделе
    const employeesInDept = await db.collection('employees').countDocuments({ 
      department: departmentToDelete.name 
    });
    
    if (employeesInDept > 0) {
      return res.status(400).json({ 
        error: `Нельзя удалить отдел "${departmentToDelete.name}". В нем работает ${employeesInDept} сотрудник(ов).`,
        employeesCount: employeesInDept
      });
    }
    
    // Проверяем, есть ли проекты в этом отделе
    const projectsInDept = await db.collection('projects').countDocuments({ 
      department: departmentToDelete.name 
    });
    
    if (projectsInDept > 0) {
      return res.status(400).json({ 
        error: `Нельзя удалить отдел "${departmentToDelete.name}". В нем ${projectsInDept} активных проект(ов).`,
        projectsCount: projectsInDept
      });
    }
    
    const result = await db.collection('departments').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Отдел удален', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления отдела' });
  }
});

// Отчеты с агрегацией
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

// Простые запросы
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

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Откройте браузер по адресу: http://localhost:${PORT}`);
});

module.exports = app; 