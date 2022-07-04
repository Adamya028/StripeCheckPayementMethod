const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const stripe = require("stripe")(
  "sk_test_51LFusKJ4GbNGhfs4HwxJg4Ysowtk8IVwiwqB6cizNFZcW5IPqTsCupaRkCrJTqGqjiCTop06O2UNNEaeOw1qxSpz008lZKhEt9"
);

const endpointSecret = 'whsec_11LCNyzLKPckgn5YI0w6KP6IKtZC7vb1';


const port = 3000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))

app.use(cors())

app.post('/pay', async (req, res) => {
    const {email} = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 7500,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: {integration_check: 'accept_a_payment'},
        receipt_email: email,
      });
    

      res.json({'client_secret': paymentIntent['client_secret']})
})

app.post('/source', async (req, res) => {
  const {email} = req.body;
  try {
    const source = await stripe.sources.create(
      {
        type: "ach_credit_transfer",
        currency: "usd",
        owner: {
          email: email,
        },
        
            amount:4242
        
        // clientSecret: "pi_3LGMyNJ4GbNGhfs41m6iYH2N_secret_XFr1emApmw37wtZhsfPIhgoeW",
      }
    );

    const customer = await stripe.customers.create({
            email: email,
            // default_source:source.id
            payment_method: 'pm_card_visa',
  invoice_settings: {default_payment_method: 'pm_card_visa'},
          });
        //   console.log(customer)
  } catch (er) {
    console.log(er);
  }


})

app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  }
  catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle the event
  switch (event.type) {
    case 'source.transaction.created': {
        const id = event.data.object.id
        const status = event.data.object.status
        console.log(`New source created for with id ${id}! with  status  ${status}`)
        break;
      }
    case 'source.transaction.updated': {
        const data = event['data']
        console.log(`source hook data for ${data}!`)
        break;
      }
    case 'payment_intent.succeeded': {
      const object = event['data']['object']
      console.log(`PaymentIntent was successful for ${object}!`)
      break;
    }
    default:
      // Unexpected event type
      return res.status(400).end();
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({received: true});
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))