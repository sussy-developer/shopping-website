const fs = require('fs');
const file = 'src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/fetch\("\/api\//g, 'fetch(import.meta.env.VITE_API_URL + "/api/');
content = content.replace(/fetch\(`\/api\//g, 'fetch(`${import.meta.env.VITE_API_URL}/api/');

fs.writeFileSync(file, content);
console.log("Replaced successfully!");
