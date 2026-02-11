const express = require('express');
const router = express.Router();
const { getIdentities, addIdentity, updateIdentity, deleteIdentity } = require('../controllers/customerIdentityController');

router.get('/list', getIdentities);
router.post('/add', addIdentity);
router.put('/update/:id', updateIdentity);
router.delete('/delete/:id', deleteIdentity);

module.exports = router;
