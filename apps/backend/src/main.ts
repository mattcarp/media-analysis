import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as path from 'path';

import {
  analysisRouter,
  blackRouter,
  extractFrameRouter,
  monoRouter,
  smeUploaderRouter,
} from './app/routes';

const app = express();

app.set('view engine', 'html');
app.set('etag', false);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, '
    + 'xa-file-to-concat, xa-black-position, xa-chunk-position');
  res.set('Cache-Control', 'no-store');
  next();
});

app.use(bodyParser.raw({ limit: '500mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// routes
app.use('/analysis', analysisRouter);
app.use('/black', blackRouter);
app.use('/mono', monoRouter);
app.use('/extract-frame', extractFrameRouter);
app.use('/sme-uploader', smeUploaderRouter);
// static files
app.get('*.*', express.static(path.join(__dirname, '../frontend/')));
// main route (angular app)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err: any = new Error('Not Found');
  err.status = 404;
  next(err);
});

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
