document.addEventListener('DOMContentLoaded', function() {
    const logFileInput = document.getElementById('logFile');
    const manualLogInput = document.getElementById('manualLogInput');
    const loadLogsBtn = document.getElementById('loadLogsBtn');
    const generateLogsBtn = document.getElementById('generateLogsBtn');
    const filterRegexInput = document.getElementById('filterRegex');
    const filterBtn = document.getElementById('filterBtn');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    const logOutput = document.getElementById('logOutput');
    const lineCountSpan = document.getElementById('lineCount');
    const statsChartCanvas = document.getElementById('statsChart');
    
    let allLogs = []; // Массив для хранения всех загруженных логов
    let filteredLogs = []; // Массив для хранения отфильтрованных логов
    let statsChart = null; // Переменная для хранения графика статистики
    
    initEventListeners(); // Инициализация обработчиков
    
    // Функция инициализации обработчиков
    function initEventListeners() {
        loadLogsBtn.addEventListener('click', loadLogs); // Обработчик для загрузки логов
        generateLogsBtn.addEventListener('click', generateLogs); // Обработчик для генерации логов
        filterBtn.addEventListener('click', applyFilter); // Обработчик для применения фильтра
        resetFilterBtn.addEventListener('click', resetFilter); // Обработчик для сброса фильтра
    }
    
    // Функция загрузки логов из файла или из текстового поля
    function loadLogs() {
        const file = logFileInput.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                allLogs = e.target.result.split('\n'); // Разделяет логи на строки
                filteredLogs = [...allLogs]; // Копирует все логи в отфильтрованные
                displayLogs(); // Отображает загруженные логи
                updateStatistics(); // Обновляет статистику
            };
            reader.readAsText(file); // Читает файл как текст
        } else if (manualLogInput.value.trim()) {
            allLogs = manualLogInput.value.split('\n'); // Разделяет введенные логи
            filteredLogs = [...allLogs]; // Копирует все логи в отфильтрованные
            displayLogs(); // Отображает загруженные логи
            updateStatistics(); // Обновляет статистику
        } else {
            alert('Пожалуйста, загрузите файл или введите логи вручную'); // Сообщение об ошибке
        }
    }
    
    // Функция генерации случайных логов
    function generateLogs() {
        const logLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']; // Уровни логов
        const randomMessages = [
            'Operation completed successfully.',
            'User  logged in.',
            'File not found.',
            'Invalid input detected.',
            'Connection established.',
            'Data saved to database.',
            'Unexpected error occurred.',
            'Debugging information here.'
            // Можно написать кастомные логи
        ];
        
        const numberOfLogs = parseInt(document.getElementById('logCountInput').value) || 10; // Получаем количество логов
        let generatedLogs = []; // Массив для хранения сгенерированных логов
        
        for (let i = 0; i < numberOfLogs; i++) {
            const level = logLevels[Math.floor(Math.random() * logLevels.length)]; // Случайный уровень лога
            const message = randomMessages[Math.floor(Math.random() * randomMessages.length)]; // Случайное сообщение
            generatedLogs.push(`${level}: ${message}`); // Добавляем сгенерированный лог в массив
        }
        
        manualLogInput.value = generatedLogs.join('\n'); // Заполняем текстовое поле сгенерированными логами
    }
    
    // Функция применения фильтра к логам
    function applyFilter() {
        const regexPattern = filterRegexInput.value.trim(); // Получает выражение
        
        if (!regexPattern) {
            alert('Введите регулярное выражение'); // Сообщение об ошибке
            return;
        }
        
        try {
            const regex = new RegExp(regexPattern); // Создает выражение
            filteredLogs = allLogs.filter(line => regex.test(line)); // Фильтрует логи
            displayLogs(); // Отображает отфильтрованные логи
            updateStatistics(); // Обновляет статистику
        } catch (e) {
            alert('Ошибка в регулярном выражении: ' + e.message); // Сообщение об ошибке
        }
    }
    
    // Функция сброса фильтра
    function resetFilter() {
        filteredLogs = [...allLogs]; // Возвращает все логи
        filterRegexInput.value = ''; // Очищает поле выражения
        displayLogs(); // Отображает все логи
        updateStatistics(); // Обновляет статистику
    }
    
    // Функция отображения логов на странице
    function displayLogs() {
        logOutput.innerHTML = ''; // Очищает текущее содержимое
        
        if (filteredLogs.length === 0) {
            logOutput.textContent = 'Нет данных для отображения'; // Сообщение, если нет логов
            return;
        }
        
        filteredLogs.forEach(line => {
            const lineDiv = document.createElement('div'); // Создает новый элемент для строки лога
            lineDiv.className = 'log-line'; // Задает класс
            lineDiv.textContent = line; // Устанавливает текст
            logOutput.appendChild(lineDiv); // Добавляет элемент в вывод логов
        });
        
        lineCountSpan.textContent = filteredLogs.length; // Обновляет счетчик найденных строк
    }
    
    // Функция обновления статистики по уровням логов
    function updateStatistics() {
        if (filteredLogs.length === 0) {
            if (statsChart) {
                statsChart.destroy(); // Удаляет график, если нет данных
            }
            return;
        }
        
        const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']; // Уровни логов
        const stats = {}; // Объект для хранения статистики
        
        levels.forEach(level => {
            stats[level] = filteredLogs.filter(line => 
                line.toUpperCase().includes(level) // Подсчет количества логов для каждого уровня
            ).length;
        });
        
        const ctx = statsChartCanvas.getContext('2d'); // Получает контекст для рисования графика
        
        if (statsChart) {
            statsChart.destroy(); // Удаляет предыдущий график, если он существует
        }
        
        // Создание нового графика
        statsChart = new Chart(ctx, {
            type: 'bar', // Тип графика
            data: {
                labels: levels, // Метки для оси X
                datasets: [{
                    label: 'Уровни логов', // Название набора данных
                    data: levels.map(level => stats[level]), // Данные для графика
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1 // Толщина границ столбцов
                }]
            },
            options: {
                responsive: true, // Адаптивность графика
                maintainAspectRatio: false, // Поддержка соотношения сторон
                scales: {
                    y: {
                        beginAtZero: true // Начинаем ось Y с нуля
                    }
                },
                plugins: {
                    title: {
                        display: true, // Отображение заголовка
                        text: 'Статистика по уровням логов' // Текст заголовка
                    }
                }
            }
        });
    }
});