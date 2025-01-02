function setupCharts() {
    // Focus Practice Chart
    const focusCtx = document.getElementById('focus-practice-chart').getContext('2d');
    const focusChart = new Chart(focusCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'VR',
                    borderColor: '#646cff',
                    data: []
                },
                {
                    label: 'DM',
                    borderColor: '#ef4444',
                    data: []
                },
                {
                    label: 'QR',
                    borderColor: '#22c55e',
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 300,
                    max: 900
                }
            }
        }
    });

    // Full Mock Chart
    const mockCtx = document.getElementById('full-mock-chart').getContext('2d');
    const mockChart = new Chart(mockCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Score',
                borderColor: '#646cff',
                data: [],
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const value = context.parsed.y;
                            if (value !== null) {
                                label += value;
                            }
                            const scoreIndex = context.dataIndex;
                            const score = getScores().filter(s => s.type === 'full')[scoreIndex];
                            if (score) {
                                return [
                                    label,
                                    `Name: ${score.name}`,
                                    `Platform: ${score.platform}`,
                                    `VR: ${score.scaled.VR}`,
                                    `DM: ${score.scaled.DM}`,
                                    `QR: ${score.scaled.QR}`
                                ];
                            }
                            return label;
                        }
                    }
                }
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 900,
                    max: 2700
                }
            }
        }
    });

    // Consistency Chart
    const consistencyCtx = document.getElementById('consistency-chart').getContext('2d');
    const consistencyChart = new Chart(consistencyCtx, {
        type: 'pie',
        data: {
            labels: ['VR', 'DM', 'QR'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#646cff', '#ef4444', '#22c55e']
            }]
        },
        options: {
            responsive: true
        }
    });

    return { focusChart, mockChart, consistencyChart };
}