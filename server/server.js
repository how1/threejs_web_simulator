const path = require('path');
const express = require('express');
const app = express();
const publicPath = path.join(__dirname, '..', 'public');
const port = 3002;

app.use(express.static(publicPath));

app.get('*', (req, res) => {
	// res.sendFile(path.join(publicPath, 'index.html'));
	res.sendFile('public/index.html');
});

app.listen(port, () => {
	console.log('server is up!');
});
