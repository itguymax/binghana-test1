var express = require('express');
var router = express.Router();
const Angels = require('../model/Angels')
const paypal = require("paypal-rest-sdk");
const transporter = require("../config/email")
const uuidv4 = require("uuid/v4");


router.route("/success").get(async (req, res) => {
  let errors = [];
  const paymentId = req.query.paymentId;
  const payerId = req.query.PayerID;
  const execute_payment_json = {
    payer_id: `${payerId}`
  };
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    async (error, payment) => {
      if (error) {
        console.log(error);
        res.redirect(process.env.CANCEL_URL);
      }
      try {
        const { payer, transactions } = payment;
        const { payer_info } = payer;
        const { email, shipping_address, payer_id} = payer_info;
        const { recipient_name, country_code } = shipping_address;
        console.log("Get Payment Response");
        console.log(JSON.stringify(payment));
        const angelData = {
          name: recipient_name,
          profile_url: null,
          amount: "300",
          email,
          address: null,
          id: uuidv4()
        };
        const angel = await Angels.create(angelData);

        if (angel) { // send and email once the danation has been save in DB
          const mailOptions = {
            to: `"Binghana LTD" <t.kmyta@gmail.com>`,
            from: `"TEST EMAIL" <${process.env.EMAIL_USERNAME}>`,
            subject: `SUCCESSFUL DONATION`,
            text: `${recipient_name} from ${country_code} just donate ${transactions[0].amount.total} ${transactions[0].amount.currency}`
          };
          await transporter.verify();
          await transporter.sendMail(mailOptions);
        }
      } catch (error) {
        console.error(JSON.stringify(error));
        errors.push({text: 'Something went wrong'})
        res.render("index", { errors });
      }
    }
  );
});

router.route("/cancel").get((req, res) => {
  let errors = [];
  errors.push({ text: "Something went wrong" });
  res.render("index", { errors });
});

router.route('/pay').post(
  (req, res) => {
    const amount = req.body.donation_amount + '.00'
    let errors =[]
    if(!amount){ // check for empty field
      errors.push({text: 'Please Enter donation amount'})
    }
    if(parseInt(amount) < 1000){ // check for amount > than 1000
      errors.push({text: 'Please donation amount should be above 1000'})
    }
    
    if (errors.length > 0) return res.render('index', {errors});
   
    
    console.log('req',req.body)
    
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal"
      },
      redirect_urls: {
        return_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: "Don",
                sku: "001",
                price: `${amount}`,
                currency: "USD",
                quantity: 1
              }
            ]
          },
          amount: {
            currency: "USD",
            total: `${amount}`
          },
          description: "réfection du Pont de l'enfance à Sa'a"
        }
      ]
    };
    paypal.payment.create(create_payment_json, function(error, payment) {
      if (error) {
        throw error;
      } else {
       for( let i = 0; i < payment.links.length;i++){
         if(payment.links[i].rel === 'approval_url'){
           res.redirect(payment.links[i].href);
         }
       }
      }
    });
  }
)

module.exports = router;
