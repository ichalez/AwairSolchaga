// Awair Local API Service
class AwairAPI {
    constructor(deviceIP) {
        this.deviceIP = deviceIP;
        this.baseURL = `http://${deviceIP}`;
        this.historicalData = []; // Store data locally for charts
        this.maxHistoricalPoints = 288; // 24 hours at 5-min intervals
    }

    async request(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    async getLatestData() {
        const data = await this.request('/air-data/latest');

        // Add to historical data for charts
        if (data && data.timestamp) {
            this.historicalData.push(data);
            // Keep only last 288 points (24 hours)
            if (this.historicalData.length > this.maxHistoricalPoints) {
                this.historicalData.shift();
            }
        }

        return data;
    }

    getHistoricalData() {
        // Return stored historical data
        return this.historicalData;
    }
}

// App State
let api = null;
let refreshInterval = null;
let charts = {
    tempHumid: null,
    airQuality: null
};

// Configuration
const DEVICE_IP = '192.168.68.103'; // Awair device IP
const REFRESH_INTERVAL = 10000; // 10 seconds (Local API updates every 10s)

// DOM Elements
const elements = {
    app: document.getElementById('app'),
    refreshBtn: document.getElementById('refreshBtn'),
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    dashboardContent: document.getElementById('dashboardContent'),
    scoreNumber: document.getElementById('scoreNumber'),
    scoreLabel: document.getElementById('scoreLabel'),
    lastUpdate: document.getElementById('lastUpdate'),
    tempValue: document.getElementById('tempValue'),
    tempStatus: document.getElementById('tempStatus'),
    humidValue: document.getElementById('humidValue'),
    humidStatus: document.getElementById('humidStatus'),
    co2Value: document.getElementById('co2Value'),
    co2Status: document.getElementById('co2Status'),
    vocValue: document.getElementById('vocValue'),
    vocStatus: document.getElementById('vocStatus'),
    pm25Value: document.getElementById('pm25Value'),
    pm25Status: document.getElementById('pm25Status')
};

// Utility Functions
function getAirQualityStatus(type, value) {
    const thresholds = {
        temp: { good: [18, 24], moderate: [15, 28] },
        humid: { good: [30, 60], moderate: [20, 70] },
        co2: { good: [0, 600], moderate: [600, 1000] },
        voc: { good: [0, 333], moderate: [333, 1000] },
        pm25: { good: [0, 15], moderate: [15, 35] }
    };

    const t = thresholds[type];
    if (!t) return 'good';

    if (value >= t.good[0] && value <= t.good[1]) return 'good';
    if (value >= t.moderate[0] && value <= t.moderate[1]) return 'moderate';
    return 'unhealthy';
}

function getStatusText(status) {
    const texts = {
        good: 'Excelente',
        moderate: 'Moderado',
        unhealthy: 'Malo'
    };
    return texts[status] || 'Desconocido';
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
    });
}

function getScoreLabel(score) {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Moderado';
    if (score >= 20) return 'Malo';
    return 'Muy Malo';
}

function updateScoreGauge(score) {
    const gauge = document.getElementById('gaugeProgress');
    const circumference = 251.2;
    const offset = circumference - (score / 100) * circumference;

    gauge.style.strokeDashoffset = offset;
    gauge.style.transition = 'stroke-dashoffset 1s ease';
}

// UI Update Functions
function updateMetrics(data) {
    // Local API returns flat object: {temp: 16.28, humid: 52.74, co2: 696, voc: 4389, pm25: 8, score: 66, timestamp: "..."}

    // Temperature
    if (data.temp !== undefined) {
        elements.tempValue.textContent = data.temp.toFixed(1);
        const status = getAirQualityStatus('temp', data.temp);
        elements.tempStatus.textContent = getStatusText(status);
        elements.tempStatus.className = `metric-status ${status}`;
    }

    // Humidity
    if (data.humid !== undefined) {
        elements.humidValue.textContent = Math.round(data.humid);
        const status = getAirQualityStatus('humid', data.humid);
        elements.humidStatus.textContent = getStatusText(status);
        elements.humidStatus.className = `metric-status ${status}`;
    }

    // CO2
    if (data.co2 !== undefined) {
        elements.co2Value.textContent = Math.round(data.co2);
        const status = getAirQualityStatus('co2', data.co2);
        elements.co2Status.textContent = getStatusText(status);
        elements.co2Status.className = `metric-status ${status}`;
    }

    // VOC
    if (data.voc !== undefined) {
        elements.vocValue.textContent = Math.round(data.voc);
        const status = getAirQualityStatus('voc', data.voc);
        elements.vocStatus.textContent = getStatusText(status);
        elements.vocStatus.className = `metric-status ${status}`;
    }

    // PM2.5
    if (data.pm25 !== undefined) {
        elements.pm25Value.textContent = data.pm25.toFixed(1);
        const status = getAirQualityStatus('pm25', data.pm25);
        elements.pm25Status.textContent = getStatusText(status);
        elements.pm25Status.className = `metric-status ${status}`;
    }

    // Awair Score (provided by device)
    if (data.score !== undefined) {
        elements.scoreNumber.textContent = data.score;
        elements.scoreLabel.textContent = getScoreLabel(data.score);
        updateScoreGauge(data.score);
    }

    // Last Update
    if (data.timestamp) {
        elements.lastUpdate.textContent = formatTimestamp(data.timestamp);
    }
}

function createCharts(historicalData) {
    const labels = historicalData.map(d => {
        const date = new Date(d.timestamp);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    });

    // Local API data is flat: {temp: 16.28, humid: 52.74, ...}
    const temps = historicalData.map(d => d.temp);
    const humids = historicalData.map(d => d.humid);
    const co2s = historicalData.map(d => d.co2);
    const vocs = historicalData.map(d => d.voc);
    const pm25s = historicalData.map(d => d.pm25);

    // Temperature & Humidity Chart
    const tempHumidCtx = document.getElementById('tempHumidChart').getContext('2d');
    if (charts.tempHumid) charts.tempHumid.destroy();

    charts.tempHumid = new Chart(tempHumidCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperatura (°C)',
                    data: temps,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Humedad (%)',
                    data: humids,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#a0a0b8'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#6b6b8a',
                        maxTicksLimit: 12
                    },
                    grid: {
                        color: 'rgba(99, 102, 241, 0.1)'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        color: '#f59e0b'
                    },
                    grid: {
                        color: 'rgba(99, 102, 241, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        color: '#3b82f6'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });

    // Air Quality Chart
    const airQualityCtx = document.getElementById('airQualityChart').getContext('2d');
    if (charts.airQuality) charts.airQuality.destroy();

    charts.airQuality = new Chart(airQualityCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'CO₂ (ppm)',
                    data: co2s,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'VOCs (ppb)',
                    data: vocs,
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: 'PM2.5 (µg/m³)',
                    data: pm25s,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y2'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#a0a0b8'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#6b6b8a',
                        maxTicksLimit: 12
                    },
                    grid: {
                        color: 'rgba(99, 102, 241, 0.1)'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        color: '#8b5cf6'
                    },
                    grid: {
                        color: 'rgba(99, 102, 241, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        color: '#ec4899'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                y2: {
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        color: '#10b981'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Data Loading Functions
async function loadData() {
    try {
        showLoading();

        // Load latest data from Local API
        const latestData = await api.getLatestData();
        if (!latestData) {
            throw new Error('No se pudieron obtener datos del dispositivo.');
        }

        updateMetrics(latestData);

        // Load historical data (accumulated locally)
        const historicalData = api.getHistoricalData();
        if (historicalData.length > 0) {
            createCharts(historicalData);
        }

        showDashboard();
    } catch (error) {
        showError(error.message);
    }
}

// UI State Functions
function showLoading() {
    elements.loadingState.style.display = 'flex';
    elements.errorState.style.display = 'none';
    elements.dashboardContent.style.display = 'none';
}

function showError(message) {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'flex';
    elements.dashboardContent.style.display = 'none';
    elements.errorMessage.textContent = message;
}

function showDashboard() {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.dashboardContent.style.display = 'block';
}

// Event Handlers
elements.refreshBtn.addEventListener('click', () => {
    loadData();
});

elements.retryBtn.addEventListener('click', () => {
    loadData();
});

// Initialize App
function init() {
    // Initialize Local API with device IP
    api = new AwairAPI(DEVICE_IP);

    // Start loading data
    loadData();

    // Auto-refresh every 10 seconds
    refreshInterval = setInterval(loadData, REFRESH_INTERVAL);
}

// Start the app
init();
