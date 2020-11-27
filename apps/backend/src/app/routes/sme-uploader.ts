import * as express from 'express';
import * as path from 'path';

const smeUploaderRouter = express.Router();
// todo handle via libs
smeUploaderRouter.get('*.*', express.static(path.join(__dirname, '/../../sme-uploader/demo/')));

smeUploaderRouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/../../sme-uploader/demo/index.html'));
});

export { smeUploaderRouter };
