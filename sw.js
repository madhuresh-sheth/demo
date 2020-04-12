var cacheName = 'hello-pwa'; 
var filesToCache = [
'/',    
'/index.html',    
'/css/style.css',  
'/js/main.js'  ];  

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);
        })
    );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
    e.respondWith(caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
    }));
});

self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

self.addEventListener('notificationclick', function(event) {
    var notification = event.notification;
    var action = event.action;

    console.log(notification);

    if (action === 'confirm') {
        console.log('Confirm was chosen');

        notification.close();
    } else {
        console.log(action);
        event.waitUntil(
            clients.matchAll()
            .then(function(clis) {
                var client = clis.find(function(c) {
                    return c.visibilityState === 'visible';
                });

                if (client !== undefined) {
                    client.navigate(notification.data.url);
                    client.focus();
                } else {
                    clients.openWindow(notification.data.url);
                }
                notification.close();
            })
        );
    }
});

self.addEventListener('notificationclose', function(event) {
    console.log('Notification was closed', event);
});

self.addEventListener('push', function(event) {
    console.log('Push Notification received', event);

    var data = {
        title: '',
        body: '',
        openUrl: '/'
    };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    var options = {
        body: data.body,
        icon: 'images/favicon.ico',
        badge: 'images/favicon.ico',
        data: {
            url: data.openUrl || '/'
        }
    };

    if (data.title || data.content) {
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }

});
