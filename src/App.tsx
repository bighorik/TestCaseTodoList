import './App.css'

import { useState } from 'react'

// Типы данных для задачи
interface TodoItem {
  id: string
  title: string
  dueDate: string
  priority: number // 1-5 (от не срочно до очень срочно)
  description: string
  color: string
  completed: boolean
}


function App() {
  // Состояние для списка задач
  const [todos, setTodos] = useState<TodoItem[]>([])
  // Состояние для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Состояние для новой задачи
  const [newTodo, setNewTodo] = useState<Omit<TodoItem, 'id'>>({
    title: '',
    dueDate: '',
    priority: 3,
    description: '',
    color: '#ffffff',
    completed: false
  })
  // Состояние для подтверждения удаления
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, id: string | null }>({ show: false, id: null })
  // Состояние для вкладок
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all')

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewTodo(prev => ({
      ...prev,
      [name]: name === 'priority' ? parseInt(value) : value
    }))
  }

  // Генерация случайного цвета
  const generateRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Открытие модального окна
  const openModal = () => {
    setIsModalOpen(true)
    // Сброс формы при открытии
    setNewTodo({
      title: '',
      dueDate: '',
      priority: 3,
      description: '',
      color: generateRandomColor(),
      completed: false
    })
  }

  // Закрытие модального окна
  const closeModal = () => {
    setIsModalOpen(false)
  }

  // Состояние для хранения ошибок валидации
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!newTodo.title.trim()) {
      newErrors.title = 'Поле "Название" обязательно для заполнения'
    } else if (newTodo.title.trim().length < 5) {
      newErrors.title = 'Поле "Название" должно содержать не менее 5 символов'
    }

    if (!newTodo.dueDate) {
      newErrors.dueDate = 'Поле "Крайний срок выполнения" обязательно для заполнения'
    } else {
      const selectedDate = new Date(newTodo.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.dueDate = 'Дата не может быть раньше текущей даты'
      }
    }

    // Проверка описания на использование только кириллицы и спец-символов
    if (newTodo.description && !/^[а-яА-ЯёЁ\s\-\.\,\!\?\(\)\[\]\{\}\:\;\'\"]+$/.test(newTodo.description)) {
      newErrors.description = 'Поле "Описание" может содержать только кириллические буквы и спец-символы'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Добавление новой задачи
  const addTodo = () => {
    if (!validateForm()) return

    const todo: TodoItem = {
      ...newTodo,
      id: Date.now().toString()
    }

    setTodos([...todos, todo])
    closeModal()
    // Сброс ошибок после успешного добавления
    setErrors({})
  }

  // Очистка ошибок при изменении поля
  const clearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  // Подтверждение удаления задачи
  const confirmDelete = (id: string) => {
    setDeleteConfirm({ show: true, id })
  }

  // Удаление задачи
  const deleteTodo = () => {
    if (deleteConfirm.id) {
      setTodos(todos.filter(todo => todo.id !== deleteConfirm.id))
      setDeleteConfirm({ show: false, id: null })
    }
  }

  // Отмена удаления
  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null })
  }

  // Получение текста срочности по числу
  const getPriorityText = (priority: number) => {
    const priorities = ['Не срочно', 'Срочно', 'Очень срочно']
    return priorities[priority - 1] || 'Не срочно'
  }

  // Фильтрация задач по вкладке
  const filteredTodos = todos.filter(todo => {
    if (activeTab === 'pending') return !todo.completed
    if (activeTab === 'completed') return todo.completed
    return true // 'all'
  }).sort((a, b) => {
    const dateA = new Date(a.dueDate) as any;
    const dateB = new Date(b.dueDate) as any;
    return dateA - dateB;
  });

  // Переключение статуса задачи (выполнено/не выполнено)
  const toggleCompleted = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo List</h1>
        <button className="add-btn" onClick={openModal}>
          Добавить задачу
        </button>
      </header>

      {/* Вкладки */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Все задачи
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Не выполненные
        </button>
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Выполненные
        </button>
      </div>

      {/* Модальное окно добавления задачи */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onMouseUp={(e) => e.stopPropagation()}>
            <h2>Добавить новую задачу</h2>
            <div className="form-group">
              <label htmlFor="title">Название:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newTodo.title}
                onChange={(e) => {
                  handleInputChange(e)
                  clearError('title')
                }}
                placeholder="Введите название задачи"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Крайний срок выполнения:</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={newTodo.dueDate}
                onChange={(e) => {
                  handleInputChange(e)
                  clearError('dueDate')
                }}
                className={errors.dueDate ? 'error' : ''}
              />
              {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="priority">Срочность:</label>
              <select
                id="priority"
                name="priority"
                value={newTodo.priority}
                onChange={handleInputChange}
              >
                <option value="1">Не срочно</option>
                <option value="2">Срочно</option>
                <option value="3">Очень срочно</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Описание:</label>
              <textarea
                id="description"
                name="description"
                value={newTodo.description}
                onChange={(e) => {
                  handleInputChange(e)
                  clearError('description')
                }}
                className={errors.dueDate ? 'error' : ''}
                placeholder="Введите описание задачи"
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="color">Цвет подсветки:</label>
              <input
                type="color"
                id="color"
                name="color"
                value={newTodo.color}
                onChange={handleInputChange}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeModal}>Отмена</button>
              <button className="btn-add" onClick={addTodo}>Добавить задачу</button>
            </div>
          </div>
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      {deleteConfirm.show && (
        <div className="confirm-overlay">
          <div className="confirm-content">
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить эту задачу?</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={cancelDelete}>Отмена</button>
              <button className="btn-delete" onClick={deleteTodo}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      {/* Список задач */}
      <main className="todo-list">
        {filteredTodos.length === 0 ? (
          <p className="empty-message">Нет задач. Добавьте первую задачу!</p>
        ) : (
          filteredTodos.map(todo => (
            <div
              key={todo.id}
              className="todo-item"
              style={{ borderLeft: `5px solid ${todo.color}` }}
            >
              <div className="todo-header">
                <h3>{todo.title}</h3>
                <span className={`priority-badge priority-${todo.priority}`}>
                  {getPriorityText(todo.priority)}
                </span>
              </div>

              <div className="todo-details">
                <p><strong>Крайний срок:</strong> {todo.dueDate || 'Не указан'}</p>
                <p><strong>Описание:</strong> {todo.description || 'Нет описания'}</p>
              </div>

              <div className="todo-actions">
                {!todo.completed ? (
                  <button
                    className="complete-btn"
                    onClick={() => toggleCompleted(todo.id)}
                  >
                    Выполнить
                  </button>
                ) : (
                  <button
                    className="undo-btn"
                    onClick={() => toggleCompleted(todo.id)}
                  >
                    Отменить выполнение
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => confirmDelete(todo.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}

export default App
