// Initialize charts
const charts = setupCharts();

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

// Navigation
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetPage = btn.dataset.page;
        
        navButtons.forEach(b => b.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(targetPage).classList.add('active');
        
        updateCharts();
        updateScoreLog();
    });
});

// Test type selector
const testTypeButtons = document.querySelectorAll('.test-type-btn');
testTypeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        testTypeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Platform selector
const platformButtons = document.querySelectorAll('.platform-btn');
platformButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        platformButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Score form submission
const scoreForm = document.getElementById('score-form');
scoreForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const testType = document.querySelector('.test-type-btn.active').dataset.type;
    const platform = document.querySelector('.platform-btn.active').dataset.platform;
    const name = document.getElementById('mock-name').value;
    const date = document.getElementById('test-date').value;
    const scores = {
        VR: {
            raw: parseInt(document.getElementById('vr-score').value),
            total: parseInt(document.getElementById('vr-total').value)
        },
        DM: {
            raw: parseInt(document.getElementById('dm-score').value),
            total: parseInt(document.getElementById('dm-total').value)
        },
        QR: {
            raw: parseInt(document.getElementById('qr-score').value),
            total: parseInt(document.getElementById('qr-total').value)
        }
    };

    // Calculate scaled scores
    const scaledScores = {
        VR: calculateScaledScore(scores.VR.raw, scores.VR.total, 'VR'),
        DM: calculateScaledScore(scores.DM.raw, scores.DM.total, 'DM'),
        QR: calculateScaledScore(scores.QR.raw, scores.QR.total, 'QR')
    };

    // Save score
    saveScore({
        date,
        type: testType,
        platform,
        name,
        raw: scores,
        scaled: scaledScores
    });

    // Reset form
    document.getElementById('mock-name').value = '';
    document.getElementById('test-date').value = new Date().toISOString().split('T')[0]; // Reset to today's date
    document.getElementById('vr-score').value = '';
    document.getElementById('vr-total').value = '';
    document.getElementById('dm-score').value = '';
    document.getElementById('dm-total').value = '';
    document.getElementById('qr-score').value = '';
    document.getElementById('qr-total').value = '';

    updateCharts();
    updateRecentScores();
    updateCalendar();
    updateScoreLog();
});

// Set default date to today
document.getElementById('test-date').value = new Date().toISOString().split('T')[0];

// Local storage functions
function saveScore(score) {
    const scores = getScores();
    scores.push(score);
    localStorage.setItem('ucat_scores', JSON.stringify(scores));
}

function getScores() {
    return JSON.parse(localStorage.getItem('ucat_scores') || '[]');
}

// Update functions
function updateCharts() {
    const scores = getScores();
    
    // Update Focus Practice Chart
    const focusScores = scores.filter(s => s.type === 'focus');
    charts.focusChart.data.labels = focusScores.map(s => s.date);
    charts.focusChart.data.datasets[0].data = focusScores.map(s => s.scaled.VR);
    charts.focusChart.data.datasets[1].data = focusScores.map(s => s.scaled.DM);
    charts.focusChart.data.datasets[2].data = focusScores.map(s => s.scaled.QR);
    charts.focusChart.update();

    // Update Full Mock Chart
    const mockScores = scores.filter(s => s.type === 'full');
    charts.mockChart.data.labels = mockScores.map(s => s.date);
    charts.mockChart.data.datasets[0].data = mockScores.map(s => 
        s.scaled.VR + s.scaled.DM + s.scaled.QR
    );
    charts.mockChart.update();

    // Update Consistency Chart
    const totalQuestions = {
        VR: scores.reduce((sum, s) => sum + s.raw.VR.total, 0),
        DM: scores.reduce((sum, s) => sum + s.raw.DM.total, 0),
        QR: scores.reduce((sum, s) => sum + s.raw.QR.total, 0)
    };
    
    charts.consistencyChart.data.datasets[0].data = [
        totalQuestions.VR,
        totalQuestions.DM,
        totalQuestions.QR
    ];
    charts.consistencyChart.update();
}

function updateRecentScores() {
    const scoresList = document.querySelector('.scores-list');
    const scores = getScores().slice(-5).reverse(); // Get the last 5 scores and reverse the order
  
    scoresList.innerHTML = ''; // Clear the list
  
    scores.forEach(score => {
        const scoreEntry = document.createElement('div');
        scoreEntry.classList.add('score-entry');
    
        const scoreEntryData = document.createElement('div');
        scoreEntryData.classList.add('score-entry-data');
    
        let title = document.createElement('p');
        title.textContent = `${score.date} - ${score.type === 'focus' ? 'Focus Practice' : 'Full Mock'}`;
        scoreEntryData.appendChild(title);
    
        if (score.name) {
            let name = document.createElement('p');
            name.textContent = `Name: ${score.name}`;
            scoreEntryData.appendChild(name);
        }
    
        if (score.platform) {
            let platform = document.createElement('p');
            platform.textContent = `Platform: ${score.platform}`;
            scoreEntryData.appendChild(platform);
        }
    
        scoreEntry.appendChild(scoreEntryData);
    
        const scoreEntryScores = document.createElement('div');
        scoreEntryScores.classList.add('score-entry-scores');
    
        let scoresText = document.createElement('p');
        scoresText.textContent = `VR: ${score.scaled.VR} | DM: ${score.scaled.DM} | QR: ${score.scaled.QR}`;
        scoreEntryScores.appendChild(scoresText);
    
        scoreEntry.appendChild(scoreEntryScores);
        scoresList.appendChild(scoreEntry);
    });
  }

function updateCalendar() {
    const calendarView = document.getElementById('calendar-view');
    const scores = getScores();
    const practiceDates = new Set(scores.map(s => s.date));
    
    // Get date range
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 1);
    
    calendarView.innerHTML = '';
    
    // Generate calendar days
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayEl = document.createElement('div');
        dayEl.className = `calendar-day${practiceDates.has(dateStr) ? ' has-practice' : ''}`;
        dayEl.textContent = d.getDate();
        calendarView.appendChild(dayEl);
    }
}

function updateScoreLog() {
    const logBody = document.getElementById('log-body');
    const scores = getScores();
    const sortBy = document.getElementById('sort-by').value;
    const order = document.getElementById('order').value;
  
    // Sort scores
    scores.sort((a, b) => {
        let aVal, bVal;
        if (sortBy === 'date') {
            aVal = new Date(a.date);
            bVal = new Date(b.date);
        } else {
            aVal = a.scaled[sortBy];
            bVal = b.scaled[sortBy];
        }
  
        if (order === 'asc') {
            return aVal - bVal;
        } else {
            return bVal - aVal;
        }
    });
  
    logBody.innerHTML = '';
    scores.forEach(score => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${score.date}</td>
            <td>${score.type === 'focus' ? 'Focus Practice' : 'Full Mock'}</td>
            <td>${score.platform || ''}</td>
            <td>${score.name || ''}</td>
            <td>${score.scaled.VR}</td>
            <td>${score.scaled.DM}</td>
            <td>${score.scaled.QR}</td>
        `;
        logBody.appendChild(row);
    });
}
  
// Event listeners for sorting and ordering
document.getElementById('sort-by').addEventListener('change', updateScoreLog);
document.getElementById('order').addEventListener('change', updateScoreLog);

// Initial updates
updateCharts();
updateRecentScores();
updateCalendar();
updateScoreLog();