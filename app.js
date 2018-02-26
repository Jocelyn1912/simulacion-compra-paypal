// Configurando servidor
const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

// Configuración del cliente
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AdR48mtPs5CD-FD8GE2wIuh2ysXRmGkHH67Rl823IcOc0y95o2oCSW6cujuIIxZWjoYuDW6cyTcj6MrC',
  'client_secret': 'EDkH3_MOqTf68J4Jwo3T9Wts5GMh0MEzzFKaMUbb9fGWkbEhnKyFbRfIVkVb40ZVn2UoasM4WojItNxX'
});

const app = express();

app.set('view engine', 'ejs');

// Renderizar una plantilla de vista
app.get('/', (req, res) => res.render('index'));

// Creando ruta de pago que recibirá el formulario enviado
app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "25.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Hat for the best team ever."
    }]
};

// Pasando el objeta json que nos dará un pago de vuelta
paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
    throw error;
  } else {
    for(let i = 0 ; i < payment.links.length; i ++){
      if(payment.links[i].rel === 'approval_url'){
        res.redirect(payment.links[i].href);
      }
    }
  //console.log("Create Payment Response");
  //console.log(payment);
  //res.send('test');
}
});

});

// Creando la identidad del pagador y del pago
app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions":[{
      "amount": {
        "currency": "USD",
        "total":"25.00"
      }
    }]
  };

  // Ejecutar el pago de paypal
  paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send('Success');
    }
  });
});

// Ruta de cancelación
app.get('/cancel', (req, res) => res.send('Cancelled'));

// Iniciando nuestro servidor
app.listen(3000, () => console.log('Servel Started'));