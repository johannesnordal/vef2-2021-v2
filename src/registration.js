import express from 'express';
import { body, validationResult } from 'express-validator';
import { select, insert } from './db.js';

export const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';

const validations = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),

  body('nationalId')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),

  body('nationalId')
    .matches(new RegExp(nationalIdPattern))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
];

const sanitazions = [
  body('name').trim().escape(),
  body('nationalId').trim().escape(),
];

async function homePage(req, res) {
  const signatures = await select();
  const data = {
    name: '',
    nationalId: '',
    comment: '',
    errors: [],
    signatures,
  };
  return res.render('index', { title: 'Undirskriftarlisti', data });
}

async function showErrors(req, res, next) {
  const {
    body: {
      name = '',
      nationalId = '',
      comment = '',
      hide = '',
    } = {},
  } = req;

  const signatures = await select().catch((err) => console.error(err));

  const data = {
    name,
    nationalId,
    comment,
    hide,
    signatures,
  };

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const errors = validation.array();
    data.errors = errors;
    return res.render('index', { title: 'Undirskriftarlisti', data });
  }
  return next();
}

async function formPost(req, res) {
  const {
    body: {
      name = '',
      nationalId = '',
      comment = '',
      hide = '',
    } = {},
  } = req;

  let anonymous = false;
  if (hide === 'on') {
    anonymous = true;
  }

  const data = {
    name,
    nationalId,
    comment,
    anonymous,
  };

  await insert(data).then(() => {
    res.redirect('/');
  }).catch(() => {
    res.render('error', { title: 'Gat ekki skráð!' });
  });
}

router.get('/', homePage);
router.post('/register',
  validations, sanitazions, showErrors, catchErrors(formPost));
