const router = require('express').Router();
const makePayment = require('../controllers/makePayment');
const paystackWebhook = require('../controllers/paystackWebhook');

router.route("/make-payment/:paymentId").post(makePayment);
router.route("/webhook").post(paystackWebhook);
module.exports = router;