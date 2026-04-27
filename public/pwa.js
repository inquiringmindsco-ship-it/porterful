if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(
      function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);

        // Detect when a new service worker takes control and reload once
        // This ensures the PWA gets fresh code after a deploy
        let reloaded = false;
        navigator.serviceWorker.addEventListener('controllerchange', function() {
          if (!reloaded) {
            reloaded = true;
            console.log('Service worker updated — reloading to get fresh code');
            window.location.reload();
          }
        });
      },
      function(err) {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}

// Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button
  const installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
      });
    });
  }
});

// Track app installation
window.addEventListener('appinstalled', () => {
  console.log('Porterful was installed');
  // Track in analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'pwa_installed', {
      event_category: 'PWA',
      event_label: 'App Installed'
    });
  }
});