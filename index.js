// ... existing code ...

import express from 'express'; // Import Express
import { dubaiScrap } from './script.js';
const app = express(); // Create an Express application

const port = 3000;

app.get('/', (req, res) => { // Define a route for the root URL
    res.send('Hello World!'); // Send response
});

app.listen(port, () => { // Start the server
    console.log(`Server running at http://localhost:${port}/`);
    dubaiScrap()
});
