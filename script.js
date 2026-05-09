// script.js

// Initialize data
if (!localStorage.getItem('inspections')) {
    localStorage.setItem('inspections', JSON.stringify([]));
}

if (!localStorage.getItem('plots')) {
    const initialPlots = [
        { id: 'PLT001', company: 'TechCorp Industries', status: 'compliant', lastInspection: '2024-05-01', risk: 'low' },
        { id: 'PLT002', company: 'GreenEnergy Ltd', status: 'pending', lastInspection: '2024-04-15', risk: 'medium' },
        { id: 'PLT003', company: 'UrbanBuild Co', status: 'non-compliant', lastInspection: '2024-03-20', risk: 'high' },
        { id: 'PLT004', company: 'MetroConstructions', status: 'compliant', lastInspection: '2024-05-05', risk: 'low' },
        { id: 'PLT005', company: 'EcoFriendly Inc', status: 'pending', lastInspection: '2024-04-28', risk: 'medium' }
    ];
    localStorage.setItem('plots', JSON.stringify(initialPlots));
}

// Navigation
function navigateTo(page) {
    if (page === 'dashboard') {
        window.location.href = 'dashboard.html';
    } else if (page === 'inspection') {
        window.location.href = 'inspection.html';
    } else if (page === 'report') {
        window.location.href = 'report.html';
    }
}

function logout() {
    window.location.href = 'index.html';
}

// Login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Simple login check (in real app, this would be server-side)
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (username && password) {
                // Simulate login success
                window.location.href = 'dashboard.html';
            }
        });
    }

    // Dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboard();
    }

    // Inspection Form
    const inspectionForm = document.getElementById('inspectionForm');
    if (inspectionForm) {
        inspectionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitInspection();
        });

        // Image upload preview
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const preview = document.getElementById('imagePreview');
                        preview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // Reports
    if (window.location.pathname.includes('report.html')) {
        loadReports();
    }
});

function loadDashboard() {
    const plots = JSON.parse(localStorage.getItem('plots')) || [];
    const inspections = JSON.parse(localStorage.getItem('inspections')) || [];

    // Update analytics
    document.getElementById('totalPlots').textContent = plots.length;
    document.getElementById('completedInspections').textContent = inspections.length;
    document.getElementById('pendingInspections').textContent = plots.filter(p => p.status === 'pending').length;
    document.getElementById('highRiskAlerts').textContent = plots.filter(p => p.risk === 'high').length;

    // Load plots
    const plotsContainer = document.getElementById('plotsContainer');
    plotsContainer.innerHTML = '';
    plots.forEach(plot => {
        const plotCard = document.createElement('div');
        plotCard.className = 'plot-card';
        plotCard.innerHTML = `
            <h4>${plot.company}</h4>
            <p><strong>Plot ID:</strong> ${plot.id}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${plot.status}">${plot.status.charAt(0).toUpperCase() + plot.status.slice(1)}</span></p>
            <p><strong>Last Inspection:</strong> ${plot.lastInspection}</p>
            <p><strong>Risk:</strong> <span class="risk-badge risk-${plot.risk}">${plot.risk.charAt(0).toUpperCase() + plot.risk.slice(1)}</span></p>
        `;
        plotsContainer.appendChild(plotCard);
    });
}

function submitInspection() {
    const formData = new FormData(document.getElementById('inspectionForm'));
    const inspection = {
        inspectorName: formData.get('inspectorName'),
        plotId: formData.get('plotId'),
        constructionStatus: formData.get('constructionStatus'),
        remarks: formData.get('remarks'),
        geoLocation: document.getElementById('geoLocation').value,
        image: document.getElementById('imagePreview').querySelector('img') ? document.getElementById('imagePreview').querySelector('img').src : null,
        compliance: Array.from(document.querySelectorAll('input[name="compliance"]:checked')).map(cb => cb.value),
        date: new Date().toISOString().split('T')[0],
        id: Date.now()
    };

    // Simple risk analysis
    let risk = 'low';
    if (inspection.constructionStatus === 'delayed' || inspection.compliance.length < 4) {
        risk = inspection.conpliance.length < 2 ? 'high' : 'medium';
    }

    inspection.risk = risk;

    // Update plot status
    const plots = JSON.parse(localStorage.getItem('plots')) || [];
    const plotIndex = plots.findIndex(p => p.id === inspection.plotId);
    if (plotIndex !== -1) {
        plots[plotIndex].status = inspection.compliance.length === 4 ? 'compliant' : 'non-compliant';
        plots[plotIndex].lastInspection = inspection.date;
        plots[plotIndex].risk = risk;
        localStorage.setItem('plots', JSON.stringify(plots));
    }

    // Save inspection
    const inspections = JSON.parse(localStorage.getItem('inspections')) || [];
    inspections.push(inspection);
    localStorage.setItem('inspections', JSON.stringify(inspections));

    // Show modal
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';

    // Close modal
    const closeBtn = document.getElementsByClassName('close')[0];
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        window.location.href = 'dashboard.html';
    };

    // Reset form
    document.getElementById('inspectionForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            document.getElementById('geoLocation').value = `${lat}, ${lon}`;
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function loadReports() {
    const inspections = JSON.parse(localStorage.getItem('inspections')) || [];
    const reportsContainer = document.getElementById('reportsList');
    reportsContainer.innerHTML = '';

    inspections.forEach(inspection => {
        const reportCard = document.createElement('div');
        reportCard.className = 'report-card';
        reportCard.innerHTML = `
            <h3>Inspection Report - ${inspection.plotId}</h3>
            ${inspection.image ? `<div class="image-preview"><img src="${inspection.image}" alt="Inspection Image"></div>` : ''}
            <p><strong>Inspector:</strong> ${inspection.inspectorName}</p>
            <p><strong>Date:</strong> ${inspection.date}</p>
            <p><strong>Construction Status:</strong> ${inspection.constructionStatus}</p>
            <p><strong>Compliance:</strong> ${inspection.compliance.join(', ')}</p>
            <p><strong>Risk Level:</strong> <span class="risk-badge risk-${inspection.risk}">${inspection.risk.charAt(0).toUpperCase() + inspection.risk.slice(1)}</span></p>
            <p><strong>Remarks:</strong> ${inspection.remarks}</p>
            <p><strong>Geo-Location:</strong> ${inspection.geoLocation}</p>
        `;
        reportsContainer.appendChild(reportCard);
    });
}