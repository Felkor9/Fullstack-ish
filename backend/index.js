const express = require('express'), path = require('path');

const app = express();

const port = process.env.PORT || 3000;

app.use(express.static(path.join(path.resolve(), 'dist')));

app.get('/api', (_request, response) => {
    response.send({ hejsan: 123 })
});


app.listen(port, () => {
    console.log(`Backend är igång på port ${port}`)
})
