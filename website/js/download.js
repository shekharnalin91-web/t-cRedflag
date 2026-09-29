document.addEventListener('DOMContentLoaded', () => {
  const downloadWinBtn = document.getElementById('downloadWinBtn');
  const downloadExtBtn = document.getElementById('downloadExtBtn');

  if (downloadWinBtn) {
    downloadWinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Real file download trigger
      const zipFileName = 'tc_red_flag_guard_v2.4.0_windows.zip';
      const downloadUrl = zipFileName; // Relative path inside website/

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Create Toast Notification
      showDownloadToast('✓ Download Started: ' + zipFileName);
    });
  }

  if (downloadExtBtn) {
    downloadExtBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Also download the extension zip bundle
      const zipFileName = 'tc_red_flag_guard_v2.4.0_windows.zip';
      const link = document.createElement('a');
      link.href = zipFileName;
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const installGuide = document.querySelector('.install-section');
      if (installGuide) {
        installGuide.scrollIntoView({ behavior: 'smooth' });
      }

      showDownloadToast('✓ Downloaded Extension Zip Package');
    });
  }

  function showDownloadToast(message) {
    let toast = document.getElementById('downloadToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'downloadToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #00ff88;
        color: #000;
        padding: 14px 24px;
        border-radius: 10px;
        font-weight: 800;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 10px 30px rgba(0, 255, 136, 0.4);
        z-index: 9999;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 4000);
  }
});
