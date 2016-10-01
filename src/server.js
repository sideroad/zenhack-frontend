import {server} from 'koiki';
import Express from 'express';
import config from './config';
import fs from 'fs-extra';
import favicon from 'serve-favicon';
import compression from 'compression';
import path from 'path';
import Html from './containers/Html';
import http from 'http';
import recursive from 'recursive-readdir';
import uris from './uris';
import routes from './routes';
import bodyParser from 'body-parser';
import modules from './modules';
import PrettyError from 'pretty-error';
import 'isomorphic-fetch';

const i18n = {};
const app = new Express();
const pretty = new PrettyError();

app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'static', 'images', 'favicon.png')));

app.use(Express.static(path.join(__dirname, '..', 'static')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

recursive( __dirname + '/../i18n', (err, files) => {
  files.map(file => {
    console.log('### loading lang files');
    const messages = fs.readJsonSync( file, {throws: false});
    const lang = path.basename(file, '.json');
    i18n[lang] = messages;
  });
});

app.use('/apis/*', (req, res) => {
  const base = ( config.api.port === 443 ? 'https' : 'http' ) +
               '://' +
               config.api.host +
               ( config.api.port === 80 || config.api.port === 443
                 ? ''
                 : ':' + config.api.port);
  const url = base + (req.originalUrl.replace(/^\/apis/, ''));
  console.log('# proxing', url, req.method, req.body);
  fetch(
    url,
    {
      ...req,
      body: req.method === 'POST' ? JSON.stringify(req.body) : ''
    })
    .then(
      _res => _res
                .json()
                .then(
                  json => console.log(json) || res.json(json),
                  _err => console.log(_err) || res.json(_err)
                ),
      _err => console.log(_err) || res.json(_err)
    ).catch(
      err => console.log(err) || res.json(err)
    );
});

server({
  app,
  uris: {
    root: uris.pages.root
  },
  urls: uris.resources,
  i18n,
  reducers: {
    ...modules
  },
  Html,
  routes,
  handlers: {
    error: error => {
      console.error('ROUTER ERROR:', pretty.render(error));
    }
  }
});

app.get('/', (req, res)=>{
  res.redirect(uris.pages.defaults);
});


if (config.port) {

  new http.Server(app).listen(config.port, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> ✅  %s is running, talking to API server.', config.app.title);
    console.info('==> 💻  Open http://%s:%s in a browser to view the app.', config.host, config.port);
  });
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
