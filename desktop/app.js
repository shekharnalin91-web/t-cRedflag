document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tabs
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanels = document.querySelectorAll('.tab-panel');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.dataset.tab;
      
      navItems.forEach(i => i.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });

  // Mock Scan History Log Data
  const sampleLogs = [
    {
      time: 'Just now',
      domain: 'novacloud-demo.com',
      score: 18,
      riskLevel: 'CRITICAL',
      criticalFlags: 4,
      highFlags: 6,
      action: '🛡️ Popup Interception Triggered'
    },
    {
      time: '12 mins ago',
      domain: 'faststream-app.net',
      score: 42,
      riskLevel: 'HIGH',
      criticalFlags: 2,
      highFlags: 5,
      action: '⚠️ User Alerted (Arbitration & Data Sharing)'
    },
    {
      time: '1 hour ago',
      domain: 'socialnet-connect.io',
      score: 65,
      riskLevel: 'MEDIUM',
      criticalFlags: 0,
      highFlags: 3,
      action: 'ℹ️ Sub-Risk Metrics Flagged'
    },
    {
      time: 'Yesterday',
      domain: 'github.com',
      score: 94,
      riskLevel: 'SAFE',
      criticalFlags: 0,
      highFlags: 0,
      action: '🟢 Safe Verification Badge'
    },
    {
      time: '2 days ago',
      domain: 'quickpay-checkout.org',
      score: 28,
      riskLevel: 'HIGH',
      criticalFlags: 3,
      highFlags: 4,
      action: '🛡️ Popup Interception Triggered'
    }
  ];

  const historyTableBody = document.getElementById('historyTableBody');
  const recentAlertsList = document.getElementById('recentAlertsList');

  function renderLogs() {
    if (!historyTableBody) return;
    historyTableBody.innerHTML = '';
    
    sampleLogs.forEach(log => {
      const tr = document.createElement('tr');
      const scoreColor = log.score < 40 ? '#ff4757' : log.score < 70 ? '#ffa500' : '#00ff88';
      
      tr.innerHTML = `
        <td style="font-family:'JetBrains Mono'; font-size:0.8rem; color:#8898aa;">${log.time}</td>
        <td><strong>${log.domain}</strong></td>
        <td><span style="color:${scoreColor}; font-weight:bold; font-family:'JetBrains Mono';">${log.score}/100 (${log.riskLevel})</span></td>
        <td><span style="color:#ff4757; font-weight:bold;">${log.criticalFlags}</span></td>
        <td><span style="color:#ffa500; font-weight:bold;">${log.highFlags}</span></td>
        <td style="font-size:0.82rem;">${log.action}</td>
      `;
      historyTableBody.appendChild(tr);
    });

    if (!recentAlertsList) return;
    recentAlertsList.innerHTML = '';
    sampleLogs.slice(0, 3).forEach(log => {
      const div = document.createElement('div');
      div.className = 'alert-item';
      div.innerHTML = `
        <div>
          <strong>${log.domain}</strong>
          <p>${log.criticalFlags} Critical Red Flags • ${log.time}</p>
        </div>
        <span class="badge ${log.score < 40 ? 'badge-danger' : 'badge-warning'}" style="background:rgba(255,71,87,0.15); color:#ff4757; border:1px solid rgba(255,71,87,0.3);">
          ${log.riskLevel}
        </span>
      `;
      recentAlertsList.appendChild(div);
    });
  }

  // Interactive buttons
  const quickAuditBtn = document.getElementById('quickAuditBtn');
  if (quickAuditBtn) {
    quickAuditBtn.addEventListener('click', () => {
      quickAuditBtn.innerText = '⏳ Auditing Extension Link...';
      setTimeout(() => {
        quickAuditBtn.innerText = '✓ Audit Complete — All Shields Active';
        setTimeout(() => {
          quickAuditBtn.innerText = '⚡ Run Full System Audit';
        }, 2500);
      }, 1200);
    });
  }

  const exportHistoryBtn = document.getElementById('exportHistoryBtn');
  if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener('click', () => {
      let csvContent = "data:text/csv;charset=utf-8,Timestamp,Domain,SafetyScore,RiskLevel,CriticalFlags,HighFlags,ActionTaken\n";
      sampleLogs.forEach(l => {
        csvContent += `${l.time},${l.domain},${l.score},${l.riskLevel},${l.criticalFlags},${l.highFlags},"${l.action}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'tc_red_flag_guard_security_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  const clearLogBtn = document.getElementById('clearLogBtn');
  if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
      if (confirm('Clear all local desktop intercept logs?')) {
        sampleLogs.length = 0;
        renderLogs();
        document.getElementById('statDetectedCount').innerText = '0';
        document.getElementById('statBlockedCount').innerText = '0';
      }
    });
  }

  renderLogs();
});
