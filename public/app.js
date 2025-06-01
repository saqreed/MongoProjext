// Глобальные переменные
let currentUser = null;
let authToken = null;

// Утилиты
const API_BASE = '/api';

// Функция для выполнения API запросов
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка сервера');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Функции аутентификации
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

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    
    // Очистка формы
    document.getElementById('loginForm').reset();
}

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Обновление информации о пользователе
    document.getElementById('currentUser').textContent = currentUser.username;
    document.getElementById('userRole').textContent = currentUser.permissions.join(', ');
    
    // Скрытие кнопок в зависимости от прав
    const hasWritePermission = currentUser.permissions.includes('write') || currentUser.permissions.includes('admin');
    document.getElementById('addEmployeeBtn').style.display = hasWritePermission ? 'inline-block' : 'none';
    document.getElementById('addProjectBtn').style.display = hasWritePermission ? 'inline-block' : 'none';
    document.getElementById('addDepartmentBtn').style.display = hasWritePermission ? 'inline-block' : 'none';
}

// Функции навигации
function showSection(sectionName) {
    // Скрыть все секции
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Показать выбранную секцию
    document.getElementById(sectionName).classList.remove('hidden');
    
    // Обновить активную ссылку в сайдбаре
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Загрузить данные для секции
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'employees':
            loadEmployees();
            loadDepartmentsForFilter();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'departments':
            loadDepartments();
            break;
        case 'reports':
            loadAllReports();
            break;
    }
}

// Функции для Dashboard
async function loadDashboard() {
    try {
        // Загрузка статистики
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
        
        // Обновление последних действий
        const recentActivity = document.getElementById('recentActivity');
        recentActivity.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>📊 Последние проекты:</h6>
                    ${projects.slice(0, 3).map(project => `
                        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <span>${project.name}</span>
                            <span class="badge bg-${getStatusColor(project.status)}">${project.status}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="col-md-6">
                    <h6>👥 Новые сотрудники:</h6>
                    ${employees.slice(-3).map(employee => `
                        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <span>${employee.name}</span>
                            <small class="text-muted">${employee.department}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Функции для сотрудников
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
                <td>
                    <span class="badge bg-secondary">${employee.position}</span>
                </td>
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

async function loadDepartmentsForFilter() {
    try {
        const departments = await apiRequest('/departments');
        const filterSelect = document.getElementById('filterDepartment');
        
        filterSelect.innerHTML = '<option value="">Все отделы</option>' +
            departments.map(dept => `<option value="${dept.name}">${dept.name}</option>`).join('');
        
        // Также заполнить dropdown в модальном окне
        const modalSelect = document.querySelector('#addEmployeeForm select[name="department"]');
        if (modalSelect) {
            modalSelect.innerHTML = '<option value="">Выберите отдел</option>' +
                departments.map(dept => `<option value="${dept.name}">${dept.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

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
        const tableBody = document.getElementById('employeesTableBody');
        
        if (employees.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Сотрудники не найдены</td></tr>';
            return;
        }
        
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
        console.error('Error searching employees:', error);
    }
}

function showAddEmployeeModal() {
    loadDepartmentsForFilter();
    const modal = new bootstrap.Modal(document.getElementById('addEmployeeModal'));
    modal.show();
}

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

// Функции для проектов
async function loadProjects() {
    const loading = document.getElementById('projectsLoading');
    const container = document.getElementById('projectsContainer');
    
    loading.style.display = 'block';
    
    try {
        const projects = await apiRequest('/projects');
        
        container.innerHTML = projects.map(project => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-${getStatusColor(project.status)} text-white">
                        <h5 class="card-title mb-0">${project.name}</h5>
                        <span class="badge bg-light text-dark">${project.status}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${project.description}</p>
                        <div class="mb-2">
                            <strong>Бюджет:</strong> ${project.budget.toLocaleString()} ₽
                        </div>
                        <div class="mb-2">
                            <strong>Отдел:</strong> ${project.department}
                        </div>
                        <div class="mb-2">
                            <strong>Команда:</strong> ${project.team.join(', ')}
                        </div>
                        <div class="text-muted small">
                            ${new Date(project.startDate).toLocaleDateString()} - 
                            ${new Date(project.endDate).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editProject('${project._id}')">
                            <i class="fas fa-edit"></i> Редактировать
                        </button>
                        ${currentUser.permissions.includes('admin') ? `
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteProject('${project._id}')">
                                <i class="fas fa-trash"></i> Удалить
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    } finally {
        loading.style.display = 'none';
    }
}

// Функции для отделов
async function loadDepartments() {
    const loading = document.getElementById('departmentsLoading');
    const container = document.getElementById('departmentsContainer');
    
    loading.style.display = 'block';
    
    try {
        const departments = await apiRequest('/departments');
        
        container.innerHTML = departments.map(dept => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-building me-2"></i>${dept.name}
                        </h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${dept.description}</p>
                        <div class="mb-2">
                            <strong>📍 Местоположение:</strong> ${dept.location}
                        </div>
                        <div class="mb-2">
                            <strong>💰 Бюджет:</strong> ${dept.budget.toLocaleString()} ₽
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editDepartment('${dept._id}')">
                            <i class="fas fa-edit"></i> Редактировать
                        </button>
                        ${currentUser.permissions.includes('admin') ? `
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteDepartment('${dept._id}')">
                                <i class="fas fa-trash"></i> Удалить
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading departments:', error);
    } finally {
        loading.style.display = 'none';
    }
}

// Функции для отчетов
async function loadAllReports() {
    try {
        // Отчет по сотрудникам по отделам
        const empByDeptReport = await apiRequest('/reports/employees-by-department');
        document.getElementById('employeesByDeptReport').innerHTML = empByDeptReport.map(item => `
            <div class="mb-3 p-3 bg-light rounded">
                <h6 class="text-primary">${item._id || 'Не указан'}</h6>
                <div class="row">
                    <div class="col-6">
                        <small class="text-muted">Сотрудников:</small>
                        <div class="fw-bold">${item.count}</div>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Средняя ЗП:</small>
                        <div class="fw-bold">${Math.round(item.avgSalary).toLocaleString()} ₽</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Отчет по проектам по статусам
        const projByStatusReport = await apiRequest('/reports/projects-by-status');
        document.getElementById('projectsByStatusReport').innerHTML = projByStatusReport.map(item => `
            <div class="mb-3 p-3 bg-light rounded">
                <h6 class="text-success">${item._id}</h6>
                <div class="row">
                    <div class="col-6">
                        <small class="text-muted">Проектов:</small>
                        <div class="fw-bold">${item.count}</div>
                    </div>
                    <div class="col-6">
                        <small class="text-muted">Общий бюджет:</small>
                        <div class="fw-bold">${item.totalBudget.toLocaleString()} ₽</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Статистика зарплат
        const salaryStats = await apiRequest('/reports/salary-statistics');
        document.getElementById('salaryStatsReport').innerHTML = `
            <div class="row">
                <div class="col-12 mb-3">
                    <div class="p-3 bg-light rounded">
                        <small class="text-muted">Средняя зарплата</small>
                        <div class="fw-bold h4 text-info">${Math.round(salaryStats.avgSalary || 0).toLocaleString()} ₽</div>
                    </div>
                </div>
                <div class="col-6 mb-2">
                    <div class="p-2 bg-light rounded">
                        <small class="text-muted">Минимум</small>
                        <div class="fw-bold">${(salaryStats.minSalary || 0).toLocaleString()} ₽</div>
                    </div>
                </div>
                <div class="col-6 mb-2">
                    <div class="p-2 bg-light rounded">
                        <small class="text-muted">Максимум</small>
                        <div class="fw-bold">${(salaryStats.maxSalary || 0).toLocaleString()} ₽</div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="p-2 bg-light rounded">
                        <small class="text-muted">Всего сотрудников</small>
                        <div class="fw-bold">${salaryStats.totalEmployees || 0}</div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

// Утилиты
function getStatusColor(status) {
    switch (status) {
        case 'Завершен': return 'success';
        case 'В работе': return 'primary';
        case 'Планируется': return 'warning';
        case 'Отменен': return 'danger';
        default: return 'secondary';
    }
}

function showAlert(elementId, message, type) {
    const alertElement = document.getElementById(elementId);
    alertElement.textContent = message;
    alertElement.className = `alert alert-${type}`;
    alertElement.classList.remove('hidden');
    
    setTimeout(() => {
        alertElement.classList.add('hidden');
    }, 5000);
}

function showToast(message, type = 'success') {
    // Создание toast уведомления
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    // Добавление в контейнер
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', function() {
    // Проверка сохраненной аутентификации
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showMainApp();
        loadDashboard();
    }
    
    // Обработка формы входа
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        login(username, password);
    });
    
    // Обработка навигации
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Автозаполнение для демонстрации
    document.getElementById('username').value = 'admin';
    document.getElementById('password').value = 'admin123';
});

// Заглушки для функций редактирования и удаления
function editEmployee(id) {
    showToast('Функция редактирования в разработке', 'info');
}

function deleteEmployee(id) {
    if (confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
        apiRequest(`/employees/${id}`, { method: 'DELETE' })
            .then(() => {
                showToast('Сотрудник удален', 'success');
                loadEmployees();
            })
            .catch(error => showToast(error.message, 'danger'));
    }
}

function editProject(id) {
    showToast('Функция редактирования в разработке', 'info');
}

function deleteProject(id) {
    if (confirm('Вы уверены, что хотите удалить этот проект?')) {
        apiRequest(`/projects/${id}`, { method: 'DELETE' })
            .then(() => {
                showToast('Проект удален', 'success');
                loadProjects();
            })
            .catch(error => showToast(error.message, 'danger'));
    }
}

function editDepartment(id) {
    showToast('Функция редактирования в разработке', 'info');
}

function deleteDepartment(id) {
    if (confirm('Вы уверены, что хотите удалить этот отдел?')) {
        apiRequest(`/departments/${id}`, { method: 'DELETE' })
            .then(() => {
                showToast('Отдел удален', 'success');
                loadDepartments();
            })
            .catch(error => showToast(error.message, 'danger'));
    }
}

function showAddProjectModal() {
    showToast('Модальное окно добавления проекта в разработке', 'info');
}

function showAddDepartmentModal() {
    showToast('Модальное окно добавления отдела в разработке', 'info');
} 