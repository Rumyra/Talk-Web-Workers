self.addEventListener('message', function(e) {
	console.log(e.data);
}, false);

self.postMessage('Hey main script');