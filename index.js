import express from 'express';
import { nanoid } from 'nanoid';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}

app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

app.get('/', (req,res) => {
    res.sendFile(__dirname + "/index.html");
})

app.post('/url-shortener', (req,res) => {
    
    if (!isValidUrl(req.body.url)) {
        res.status(400).json({
            success: 'false',
            message: "Invalid URL, please validate the URL sent in request body",
        })
    }

    const longURL = req.body.url;
    const shortURL = nanoid(8);

    if (fs.existsSync('urlsData.json')) {
        try {
            const strData = fs.readFileSync('urlsData.json', { encoding: 'utf-8' });
            const urlsDataObj = JSON.parse(strData);
                        
            urlsDataObj[shortURL] = longURL;
            fs.writeFileSync('urlsData.json', JSON.stringify(urlsDataObj));
            res.json({
                success: true,
                data: `http://localhost:8080/${shortURL}`,
            });
 
        } catch (err) {
            console.error(err);
        }
    } else {
        const urlsDataObj = {};
        urlsDataObj[shortURL] = longURL;
        fs.writeFileSync('urlsData.json', JSON.stringify(urlsDataObj));
        res.json({
            success: true,
            data: `http://localhost:8080/${shortURL}`,
        });
    }

})

app.get('/:shorturl', (req,res) => {
    const shortURL = req.params.shorturl;
    try {
        const strData = fs.readFileSync('urlsData.json', { encoding: 'utf-8' });
        const urlsDataObj = JSON.parse(strData);
        if (urlsDataObj[shortURL] !== undefined) {
            res.redirect(urlsDataObj[shortURL]);
        } else {
            res.status(400).json({
                success: 'false',
                data: undefined
            })
        }
    } catch (err) {
        console.error(err);
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})


