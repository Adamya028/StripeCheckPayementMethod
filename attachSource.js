const stripe = require("stripe")(
    "sk_test_51LFusKJ4GbNGhfs4HwxJg4Ysowtk8IVwiwqB6cizNFZcW5IPqTsCupaRkCrJTqGqjiCTop06O2UNNEaeOw1qxSpz008lZKhEt9"
  );
  
  async function createSource() {
    try {
      const source = await stripe.sources.create(
        {
          type: "paper_check",
          currency: "usd",
          owner: {
            email: "ujval@gmail.com",
          },
        }
      );
      console.log(source)
    } catch (er) {
      console.log(er);
    }
  }
  
  createSource();
  