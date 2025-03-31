// Script principal pour l'interface utilisateur du serveur MCP Blogger

// Connexion Socket.IO
const socket = io();

// Éléments DOM
const serverStatus = document.getElementById('server-status');
const serverMode = document.getElementById('server-mode');
const serverUptime = document.getElementById('server-uptime');
const connectionCount = document.getElementById('connection-count');
const requestCount = document.getElementById('request-count');
const successRate = document.getElementById('success-rate');
const connectionsTable = document.getElementById('connections-table');
const toolsList = document.getElementById('tools-list');
const logsContent = document.getElementById('logs-content');

// Boutons
const restartServerBtn = document.getElementById('restart-server');
const refreshDataBtn = document.getElementById('refresh-data');
const clearLogsBtn = document.getElementById('clear-logs');

// Graphique d'utilisation des outils
let toolsChart;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initToolsChart();
    setupEventListeners();
});

// Initialiser le graphique d'utilisation des outils
function initToolsChart() {
    const ctx = document.getElementById('tools-chart').getContext('2d');
    toolsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Nombre d\'appels',
                data: [],
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    // Événements Socket.IO
    socket.on('status', updateStatus);
    socket.on('connections', updateConnections);
    socket.on('stats', updateStats);
    socket.on('logs', appendLog);

    // Événements de boutons
    restartServerBtn.addEventListener('click', restartServer);
    refreshDataBtn.addEventListener('click', refreshData);
    clearLogsBtn.addEventListener('click', clearLogs);

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            
            // Implémentation simple de navigation, à améliorer si nécessaire
            if (targetId === 'dashboard') {
                window.scrollTo(0, 0);
            } else {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Mettre à jour l'affichage du statut
function updateStatus(status) {
    // Mettre à jour le badge de statut
    serverStatus.textContent = status.running ? 'En ligne' : 'Hors ligne';
    serverStatus.className = `badge ${status.running ? 'bg-success' : 'bg-danger'}`;
    
    // Mettre à jour le mode
    serverMode.textContent = status.mode;
    
    // Mettre à jour le temps de fonctionnement
    if (status.startTime) {
        const startTime = new Date(status.startTime);
        serverUptime.textContent = formatDateTime(startTime);
    } else {
        serverUptime.textContent = '--';
    }
    
    // Mettre à jour la liste des outils
    updateToolsList(status.tools);
    
    // Ajouter une animation pour indiquer la mise à jour
    highlightElement(serverStatus.parentElement.parentElement);
}

// Mettre à jour l'affichage des connexions
function updateConnections(connections) {
    // Mettre à jour le compteur
    connectionCount.textContent = connections.length;
    highlightElement(connectionCount);
    
    // Vider et reconstruire le tableau
    connectionsTable.innerHTML = '';
    
    if (connections.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">Aucune connexion active</td>';
        connectionsTable.appendChild(row);
    } else {
        connections.forEach(conn => {
            const row = document.createElement('tr');
            
            const connectedAt = new Date(conn.connectedAt);
            const lastActivity = new Date(conn.lastActivity);
            
            row.innerHTML = `
                <td>${conn.id}</td>
                <td>${conn.ip || 'N/A'}</td>
                <td>${formatDateTime(connectedAt)}</td>
                <td>${formatDateTime(lastActivity)}</td>
                <td>${conn.requestCount}</td>
                <td>
                    <button class="btn btn-sm btn-danger disconnect-btn" data-id="${conn.id}">
                        <i class="bi bi-x-circle"></i> Déconnecter
                    </button>
                </td>
            `;
            connectionsTable.appendChild(row);
        });
        
        // Ajouter des écouteurs pour les boutons de déconnexion
        document.querySelectorAll('.disconnect-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const clientId = btn.getAttribute('data-id');
                disconnectClient(clientId);
            });
        });
    }
}

// Mettre à jour les statistiques
function updateStats(stats) {
    // Mettre à jour le compteur de requêtes
    requestCount.textContent = stats.totalRequests;
    highlightElement(requestCount);
    
    // Calculer et mettre à jour le taux de succès
    const rate = stats.totalRequests > 0 
        ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) 
        : 0;
    successRate.textContent = `${rate}%`;
    highlightElement(successRate);
    
    // Mettre à jour le graphique d'utilisation des outils
    updateToolsChart(stats.toolUsage);
}

// Mettre à jour le graphique d'utilisation des outils
function updateToolsChart(toolUsage) {
    const tools = Object.keys(toolUsage);
    const counts = tools.map(tool => toolUsage[tool]);
    
    toolsChart.data.labels = tools;
    toolsChart.data.datasets[0].data = counts;
    toolsChart.update();
}

// Mettre à jour la liste des outils disponibles
function updateToolsList(tools) {
    toolsList.innerHTML = '';
    
    if (tools.length === 0) {
        const item = document.createElement('li');
        item.className = 'list-group-item text-center';
        item.textContent = 'Aucun outil disponible';
        toolsList.appendChild(item);
    } else {
        tools.forEach(tool => {
            const item = document.createElement('li');
            item.className = 'list-group-item';
            item.innerHTML = `
                <div>
                    <span class="tool-name">${tool}</span>
                </div>
                <span class="badge bg-primary">MCP</span>
            `;
            toolsList.appendChild(item);
        });
    }
}

// Ajouter un message aux journaux
function appendLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    if (logsContent.textContent === 'Aucun journal disponible') {
        logsContent.textContent = logEntry;
    } else {
        logsContent.textContent += logEntry;
    }
    
    // Faire défiler vers le bas pour voir les derniers journaux
    logsContent.scrollTop = logsContent.scrollHeight;
}

// Actions
function restartServer() {
    if (confirm('Êtes-vous sûr de vouloir redémarrer le serveur ?')) {
        socket.emit('restart-server');
        appendLog('Demande de redémarrage du serveur envoyée.');
    }
}

function refreshData() {
    socket.emit('refresh-data');
    appendLog('Actualisation des données demandée.');
}

function clearLogs() {
    logsContent.textContent = 'Aucun journal disponible';
}

function disconnectClient(clientId) {
    if (confirm(`Êtes-vous sûr de vouloir déconnecter le client ${clientId} ?`)) {
        socket.emit('disconnect-client', clientId);
        appendLog(`Demande de déconnexion du client ${clientId} envoyée.`);
    }
}

// Utilitaires
function formatDateTime(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

function highlightElement(element) {
    element.classList.add('highlight');
    setTimeout(() => {
        element.classList.remove('highlight');
    }, 1500);
}
