import express from 'express';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { router } from './registration.js';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

app.use(express.urlencoded({ extended: true }));

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

function isInvalid(field, errors) {
  return Boolean(errors.find((i) => i.param === field));
}

function getDate(timestamp) {
  const date = new Date(timestamp);
  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

app.locals.isInvalid = isInvalid;
app.locals.getDate = getDate;

app.use('/', router);
app.use('/register', router);

app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
