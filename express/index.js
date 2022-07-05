const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config()
const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const port = 4000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(cors());

// Test payment by card React
app.post("/payment", async (req, res) => {
  let { amount, id } = req.body;
  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      description: "Find Verdict",
      payment_method: id,
      confirm: true,
    });
    console.log("Payment", payment);
    res.json({
      message: "Payment successful",
      success: true,
    });
  } catch (error) {
    console.log("Error", error);
    res.json({
      message: "Payment failed",
      success: false,
    });
  }
});


//Api to create a invoice
app.post("/invoice", async (req, res) => {
  const { email,amount } = req.body;
  try {
    //create a customer with the given email
    const customer = await stripe.customers.create({
      email: email,
    });
    //create a source
    const source = await stripe.sources.create(
      {
        type: "ach_credit_transfer",
        currency: "usd",
        owner: {
          email: email,
        },
      }
    );
    // attach the source to the customer
    stripe.customers.createSource(
      customer.id,
      {
        source: source.id,
      }
    );

    // create a product and its related price for invoice
    const product = await stripe.products.create({
      name: "Gold Special",
    });
    const price = await stripe.prices.create({
      unit_amount: amount,
      currency: "usd",
      product: product.id,
    });

    // create a invoice items for the customer
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customer.id,
      price: price.id,
    });

    //create invoice with the products in invoice items
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method:"send_invoice",
      days_until_due:10
    });
  

    //finalise the invoice
    const finalInvoice = await stripe.invoices.finalizeInvoice(
      invoice.id
    );

    //send Invoice to customer
    const Sendinvoice = await stripe.invoices.sendInvoice(
      invoice.id
    );
    // console.log(Sendinvoice);
    res.json({
      "hosted_invoice_url": Sendinvoice.hosted_invoice_url,
      "invoice_pdf":Sendinvoice.invoice_pdf
    });
  } catch (er) {
    console.log(er);
  }
});

app.post("/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle the event
  switch (event.type) {
    case "source.transaction.created": {
      const id = event.data.object.id;
      const status = event.data.object.status;
      console.log(
        `New source created for with id ${id}! with  status  ${status}`
      );
      break;
    }
    case "source.transaction.updated": {
      const data = event["data"];
      console.log(`source hook data for ${data}!`);
      break;
    }
    case "payment_intent.succeeded": {
      const object = event["data"]["object"];
      console.log(`PaymentIntent was successful for ${object}!`);
      break;
    }
    case "customer.created": {
      console.log(`customer created`);
      break;
    }
    case "invoiceitem.created": {
      
      console.log(`invoiceitem created`);
      break;
    }
    case "invoice.finalized": {
      
      console.log(`invoice finalized !`);
      break;
    }
    case "invoice.created": {
      
      console.log(`invoice created `);
      break;
    }
    case "invoice.sent": {
      console.log(`invoice send `);
      break;
    }
    default:
      // Unexpected event type
      return res.status(400).end();
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
