import Queue from 'bull';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from 'passport';
import ioredis from 'ioredis';
import { BullAdapter } from '@bull-board/api/dist/src/queueAdapters/bull';
import { createBullBoard } from '@bull-board/api/dist/src/index';
import { ExpressAdapter } from '@bull-board/express';
import { ensureLoggedIn } from 'connect-ensure-login';
import { Strategy as LocalStrategy } from 'passport-local';

const redisOptions = {
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  host: process.env.REDIS_HOST || 'localhost',
  password: process.env.REDIS_PASSWORD || '',
};

const redisClient = new ioredis(redisOptions);
const redisSubscriber = new ioredis(redisOptions);
const redisBClient = new ioredis(redisOptions);

const connectQueue = (name: string) => new Queue(name, { createClient: (type) => {
  switch (type) {
    case 'client':
      return redisClient;
    case 'subscriber':
      return redisSubscriber;
    case 'bclient':
      return redisBClient;
  }
}});

const run = async () => {
  passport.use(
    new LocalStrategy(function (username: string, password: string, cb: any) {
      if (username === process.env.USER || 'bull' && password === process.env.PASSWORD || 'board') {
        return cb(null, { user: 'bull-board' });
      }
      return cb(null, false);
    })
  );

  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  
  passport.deserializeUser((user: Express.User, cb) => {
    cb(null, user);
  });

  const app = express();
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(session({ secret: 'nc-secretB!^#', saveUninitialized: true, resave: true }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(passport.initialize({}));
  app.use(passport.session({
    pauseStream: false,
  }));

  app.get('/bull/login', (req, res) => {
    res.render('login', { invalid: req.query.invalid === 'true' });
  });

  app.post(
    '/bull/login',
    passport.authenticate('local', { failureRedirect: '/bull/login?invalid=true' }),
    (_req, res) => {
      res.redirect('/bull');
    }
  );

  const queueKeys = await redisClient.keys('bull:*:id');
  const queues = [];

  for (const queue of queueKeys) {
    const queueName = queue.replace('bull:', '').replace(':id', '');
    const bullQueue = connectQueue(queueName);
    queues.push(new BullAdapter(bullQueue));
  }
    

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/bull');

  createBullBoard({
    queues,
    serverAdapter: serverAdapter as any,
  });

  app.use('/bull', ensureLoggedIn({ redirectTo: '/bull/login' }), serverAdapter.getRouter());

  app.get('/', (_req, res) => {
    res.redirect('/bull');
  });

  app.listen(3001);
};

run().catch((e) => console.error(e));
