const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { list, add, remove, ids } = require('../controllers/savedController');

router.use(protect);
router.get('/', list);
router.get('/ids', ids);
router.post('/', add);
router.delete('/:hnId', remove);

module.exports = router;
