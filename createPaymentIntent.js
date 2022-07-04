const stripe = require("stripe")(
    "sk_test_51LFusKJ4GbNGhfs4HwxJg4Ysowtk8IVwiwqB6cizNFZcW5IPqTsCupaRkCrJTqGqjiCTop06O2UNNEaeOw1qxSpz008lZKhEt9"
  );
  
  async function createPaymentIntent() {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1099,
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: {
              order_id: '6735',
            },
          });
      console.log(paymentIntent)
    } catch (er) {
      console.log(er);
    }
  }
  
  createPaymentIntent();
  