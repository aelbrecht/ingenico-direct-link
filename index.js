const rp = require('request-promise');
const sha1 = require('sha1');
const xml2js = require('xml2js');

let orderId = "ord_example_" + (new Date()).getTime();
let amount = 1000;
let currency = "EUR";
let cardNumber = 4111111111111111;
let cardExpire = "01/21";
let description = "This is a test transactions.";
let cardCVC = 123;
let operation = "RES";
let eci = 1;
let cof = "MIT";

let customer = {
    name: "Rudolf Aelbrecht",
    email: "test@gmail.com",
    address: "teststreet 7",
    zip: 8200,
    town: "Oostende",
    country: "BE",
    phone: "+321212121212",
    remoteAddress: "NONE"
};

let form = {
    PSPID: process.env.INGENICO_PSPID,
    ORDERID: orderId,
    USERID: process.env.INGENICO_USERID,
    PSWD: process.env.INGENICO_PSWD,
    AMOUNT: amount,
    CURRENCY: currency,
    CARDNO: cardNumber,
    ED: cardExpire,
    COM: description,
    CN: customer.name,
    EMAIL: customer.email,
    CVC: cardCVC,
    OPERATION: operation,
    OWNERADDRESS: customer.address,
    OWNERZIP: customer.zip,
    OWNERTOWN: customer.town,
    OWNERCTY: customer.country,
    OWNERTELNO: customer.phone,
    REMOTE_ADDR: customer.remoteAddress,
    ECI: eci,
    COF_INITIATOR: cof,
};

function generateShaSign(form) {
    let kvPairs = [];
    for (let key in form) {
        if (!form.hasOwnProperty(key))
            continue;
        kvPairs.push(key.toUpperCase() + "=" + form[key] + process.env.INGENICO_SHAIN);
    }
    return sha1(kvPairs.sort().join(""));
}

form.SHASIGN = generateShaSign(form);

let options = {
    method: 'POST',
    uri: process.env.INGENICO_URL,
    formData: form,
    headers: {
        'content-type': 'application/x-www-form-urlencoded'
    }
};

rp(options)
    .then(function (body) {
        console.log(body);
        let result = xml2js.parseString(body, (err, res) => {
            console.log(res);
        });
    })
    .catch(function (err) {
        console.log(err);
    });