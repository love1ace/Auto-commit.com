const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const hpp = require('hpp');
const fs = require('fs');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const commitRoutes = require('./routes/commits');

const app = express();
const PORT = process.env.PORT || 3030;

const corsOptions = {
  origin: 'http://3.34.189.141:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === 'production') {
  // 로그 파일 생성
  const logDirectory = path.join(__dirname, 'logs');
  console.log(`Log directory: ${logDirectory}`);
  if (!fs.existsSync(logDirectory)) {
    console.log('Creating logs directory');
    fs.mkdirSync(logDirectory);
  }
  const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), {flags: 'a'});
  console.log(`Logging to: ${path.join(logDirectory, 'access.log')}`);

  app.use(hpp());
  app.use(helmet());

}

app.use('/auth', authRoutes);
app.use('/api/commits', commitRoutes);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('http://3.34.189.141:3000');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});