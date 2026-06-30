const router = require('express').Router();
const hn = require('../controllers/hnController');

router.get('/feed/:feed', hn.getFeed);
router.get('/story/:id', hn.getStory);
router.get('/item/:id', hn.getItem);
router.get('/user/:username', hn.getUser);
router.get('/cache/stats', hn.getStats);
router.post('/cache/clear', hn.clearCache);

module.exports = router;
