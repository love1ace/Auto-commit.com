const express = require('express');
const router = express.Router();
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const dotenv = require('dotenv');
const { graphql } = require('@octokit/graphql');

dotenv.config();

let Octokit;

async function loadOctokit() {
  if (!Octokit) {
    const { Octokit: OctokitModule } = await import('@octokit/rest');
    Octokit = OctokitModule;
  }
}

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "https://auto-commit.com/auth/github/callback",
  scope: ['repo'] // 필요한 권한 추가
}, async (accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken;

  // 리포지토리 존재 여부 확인 및 생성
  await loadOctokit();
  const octokit = new Octokit({ auth: accessToken });
  const githubId = profile.username;
  const repoName = 'Auto-commit.com';
  try {
    await octokit.repos.get({
      owner: githubId,
      repo: repoName,
    });
    console.log('Repository exists');
  } catch (error) {
    if (error.status === 404) {
      try {
        const { data: newRepo } = await octokit.repos.createForAuthenticatedUser({
          name: repoName,
          private: false,  // 여기서 리포지토리를 퍼블릭으로 생성
        });
        console.log('Repository created:', newRepo.clone_url);
      } catch (createError) {
        console.error('Error creating repository:', createError);
        return done(createError, null);
      }
    } else {
      console.error('Error getting repository:', error);
      return done(error, null);
    }
  }

  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

router.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());

router.get('/github', passport.authenticate('github', { scope: ['repo'] }));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) { return next(err); }
      res.clearCookie('connect.sid');
      res.json({ logoutSuccess: true });
    });
  });
});

router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

router.get('/contributions', async (req, res) => {
  if (!req.isAuthenticated() || !req.user || !req.user.accessToken) {
    return res.status(401).json({ error: 'Unauthorized: No access token provided.' });
  }

  const query = `
  {
    user(login: "${req.user.username}") {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }`;

  try {
    const data = await graphql(query, {
      headers: {
        authorization: `Bearer ${req.user.accessToken}`,
      },
    });
    res.json(data.user.contributionsCollection.contributionCalendar.weeks);
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).send('Error fetching contributions');
  }
});

module.exports = router;