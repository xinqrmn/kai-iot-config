import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {v4 as uuidv4} from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.post('/api/configs', async (req, res) => {
    try {
        const configData = req.body;

        if (!configData) {
            return res.status(400).json({error: 'No configuration found.'});
        }

        const configDir = path.join(__dirname, 'configs');
        await fs.mkdir(configDir, { recursive: true });

        const fileName = `config-${uuidv4()}.json`;
        const filePath = path.join(configDir, fileName);
        await fs.writeFile(filePath, JSON.stringify(configData, null, 2));
        res.json({
            status: 'success',
            path: filePath,
        })
    } catch (e) {
        console.error('Server error: ', e);
        res.status(500).json({error: e.message});
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});