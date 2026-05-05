const res = await fetch('https://poki.com/');
console.log('X-Frame-Options:', res.headers.get('x-frame-options'));
console.log('CSP:', res.headers.get('content-security-policy'));
