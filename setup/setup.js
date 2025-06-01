const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const setup = async () => {
  let client;
  
  try {
    console.log('🚀 Начинаем настройку базы данных MongoDB...');
    
    // Подключение к MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('company_db');
    
    console.log('✅ Подключение к MongoDB успешно!');
    
    // Очистка существующих коллекций (опционально)
    const collections = ['users', 'employees', 'projects', 'departments'];
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).drop();
        console.log(`🗑️ Коллекция ${collectionName} очищена`);
      } catch (error) {
        console.log(`ℹ️ Коллекция ${collectionName} не существовала`);
      }
    }
    
    // 1. Создание пользователей с разными уровнями доступа
    console.log('\n👥 Создание пользователей...');
    
    const users = [
      {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        permissions: ['admin', 'read', 'write'],
        description: 'Полный доступ ко всем операциям'
      },
      {
        username: 'manager',
        password: await bcrypt.hash('manager123', 10),
        permissions: ['read', 'write'],
        description: 'Чтение и изменение данных'
      },
      {
        username: 'viewer',
        password: await bcrypt.hash('viewer123', 10),
        permissions: ['read'],
        description: 'Только чтение данных'
      }
    ];
    
    await db.collection('users').insertMany(users);
    console.log('✅ Пользователи созданы:');
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.description})`);
    });
    
    // 2. Создание отделов
    console.log('\n🏢 Создание отделов...');
    
    const departments = [
      {
        name: 'IT',
        description: 'Отдел информационных технологий',
        location: 'Москва',
        budget: 2000000
      },
      {
        name: 'HR',
        description: 'Отдел кадров',
        location: 'Москва',
        budget: 800000
      },
      {
        name: 'Финансы',
        description: 'Финансовый отдел',
        location: 'Санкт-Петербург',
        budget: 1500000
      },
      {
        name: 'Маркетинг',
        description: 'Отдел маркетинга',
        location: 'Москва',
        budget: 1200000
      }
    ];
    
    await db.collection('departments').insertMany(departments);
    console.log('✅ Отделы созданы');
    
    // 3. Создание сотрудников
    console.log('\n👨‍💼 Создание сотрудников...');
    
    const employees = [
      {
        name: 'Иван Петров',
        position: 'Senior Developer',
        department: 'IT',
        salary: 120000,
        email: 'ivan.petrov@company.com',
        phone: '+7-900-123-4567',
        hireDate: new Date('2020-03-15'),
        skills: ['JavaScript', 'Node.js', 'MongoDB']
      },
      {
        name: 'Мария Сидорова',
        position: 'Project Manager',
        department: 'IT',
        salary: 100000,
        email: 'maria.sidorova@company.com',
        phone: '+7-900-234-5678',
        hireDate: new Date('2019-06-20'),
        skills: ['Project Management', 'Agile', 'Scrum']
      },
      {
        name: 'Алексей Козлов',
        position: 'HR Manager',
        department: 'HR',
        salary: 85000,
        email: 'alexey.kozlov@company.com',
        phone: '+7-900-345-6789',
        hireDate: new Date('2021-01-10'),
        skills: ['Recruitment', 'Training', 'Employee Relations']
      },
      {
        name: 'Елена Васильева',
        position: 'Financial Analyst',
        department: 'Финансы',
        salary: 90000,
        email: 'elena.vasilieva@company.com',
        phone: '+7-900-456-7890',
        hireDate: new Date('2020-09-05'),
        skills: ['Financial Analysis', 'Excel', 'Reporting']
      },
      {
        name: 'Дмитрий Николаев',
        position: 'Marketing Specialist',
        department: 'Маркетинг',
        salary: 75000,
        email: 'dmitry.nikolaev@company.com',
        phone: '+7-900-567-8901',
        hireDate: new Date('2022-02-28'),
        skills: ['Digital Marketing', 'SEO', 'Content Creation']
      },
      {
        name: 'Анна Смирнова',
        position: 'Junior Developer',
        department: 'IT',
        salary: 60000,
        email: 'anna.smirnova@company.com',
        phone: '+7-900-678-9012',
        hireDate: new Date('2023-01-15'),
        skills: ['HTML', 'CSS', 'JavaScript']
      }
    ];
    
    await db.collection('employees').insertMany(employees);
    console.log('✅ Сотрудники созданы');
    
    // 4. Создание проектов
    console.log('\n📊 Создание проектов...');
    
    const projects = [
      {
        name: 'Система управления персоналом',
        description: 'Разработка внутренней системы для управления сотрудниками',
        status: 'В работе',
        budget: 500000,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        team: ['Иван Петров', 'Мария Сидорова', 'Анна Смирнова'],
        department: 'IT'
      },
      {
        name: 'Маркетинговая кампания Q2',
        description: 'Запуск рекламной кампании на второй квартал',
        status: 'Завершен',
        budget: 300000,
        startDate: new Date('2023-04-01'),
        endDate: new Date('2023-06-30'),
        team: ['Дмитрий Николаев'],
        department: 'Маркетинг'
      },
      {
        name: 'Обучение новых сотрудников',
        description: 'Программа адаптации и обучения новых сотрудников',
        status: 'Планируется',
        budget: 150000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        team: ['Алексей Козлов'],
        department: 'HR'
      },
      {
        name: 'Финансовая отчетность Q4',
        description: 'Подготовка квартальной финансовой отчетности',
        status: 'В работе',
        budget: 100000,
        startDate: new Date('2023-10-01'),
        endDate: new Date('2023-12-31'),
        team: ['Елена Васильева'],
        department: 'Финансы'
      }
    ];
    
    await db.collection('projects').insertMany(projects);
    console.log('✅ Проекты созданы');
    
    // 5. Создание индексов для оптимизации поиска
    console.log('\n🔍 Создание индексов...');
    
    // Индексы для сотрудников
    await db.collection('employees').createIndex({ name: 1 });
    await db.collection('employees').createIndex({ department: 1 });
    await db.collection('employees').createIndex({ position: 1 });
    await db.collection('employees').createIndex({ salary: 1 });
    await db.collection('employees').createIndex({ email: 1 }, { unique: true });
    
    // Индексы для проектов
    await db.collection('projects').createIndex({ name: 1 });
    await db.collection('projects').createIndex({ status: 1 });
    await db.collection('projects').createIndex({ department: 1 });
    await db.collection('projects').createIndex({ startDate: 1, endDate: 1 });
    
    // Индексы для отделов
    await db.collection('departments').createIndex({ name: 1 }, { unique: true });
    await db.collection('departments').createIndex({ location: 1 });
    
    // Индексы для пользователей
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    
    console.log('✅ Индексы созданы для оптимизации поиска');
    
    // 6. Статистика созданных данных
    console.log('\n📈 Статистика созданных данных:');
    console.log(`   👥 Пользователей: ${await db.collection('users').countDocuments()}`);
    console.log(`   👨‍💼 Сотрудников: ${await db.collection('employees').countDocuments()}`);
    console.log(`   📊 Проектов: ${await db.collection('projects').countDocuments()}`);
    console.log(`   🏢 Отделов: ${await db.collection('departments').countDocuments()}`);
    
    console.log('\n🎉 Настройка базы данных завершена успешно!');
    console.log('\n📝 Данные для входа:');
    console.log('   👑 Администратор: admin / admin123');
    console.log('   🔧 Менеджер: manager / manager123'); 
    console.log('   👁️ Читатель: viewer / viewer123');
    
  } catch (error) {
    console.error('❌ Ошибка при настройке базы данных:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Соединение с базой данных закрыто');
    }
  }
};

setup(); 