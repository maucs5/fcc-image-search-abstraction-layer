var express = require('express');
var app = express();

app.get('/api/whoami', (req, res) => {
    res.send();
});

app.listen(process.env.PORT || 8000);
