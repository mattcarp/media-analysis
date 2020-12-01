import * as express from 'express';
import * as path from 'path';

const smeUploaderRouter = express.Router();

smeUploaderRouter.get('*.*', express.static(path.join(__dirname, '../sme-uploader/')));

smeUploaderRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../sme-uploader/index.html'));
});

export { smeUploaderRouter };
