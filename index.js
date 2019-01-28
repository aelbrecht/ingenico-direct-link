const rp = require('request-promise');
const sha1 = require('sha1');
const xml2js = require('xml2js');

/**
 * @param order - Order related parameters
 * @param order.orderId - Merchant order ID
 * @param order.amount - Amount of the payment x100
 * @param order.currency - Currency code of the payment
 * @param order.cardNumber - Card number of the debit- or credit-card
 * @param order.cardExpire - Expire date in form MM/YY or MMYY
 * @param order.description - Optional comment/reason for transaction
 * @param order.CVC - CVC code
 * @param order.operation - Operation code, see Ingenico docs
 * @param order.ECI - Electronic Commerce Indicator, see Ingenico docs
 * @param order.COF - Credential-on-file initiator, see Ingenico docs
 * @param customer - Optional customer fields
 * @param customer.name - First and last name
 * @param customer.email - Email of customer
 * @param customer.address - Street and number
 * @param customer.town - Town or city
 * @param customer.zip - Zip code
 * @param customer.country - Country code
 * @param customer.phone - Phone number
 * @param customer.remoteAddress - Optional remote address for verification
 * @param options - Platform options
 * @param options.pspId
 * @param options.userId
 * @param options.password
 * @param options.shaIn - optional
 * @param options.url - production or test API address
 * @returns {Promise<{payId,errorCode,status,orderId}>}
 */
const transaction = (order, customer, options) => {

    if (customer === undefined)
        customer = {};

    if (!options.pspId || !options.userId || !options.password || !options.url) {
        throw "Invalid options.";
    }

    if (!order.orderId || !order.amount || !order.currency || !order.cardNumber || !order.cardExpire || !order.CVC || !order.operation)
        throw "Invalid order";

    let form = {
        PSPID: options.pspId,
        USERID: options.userId,
        PSWD: options.password,
        ORDERID: order.orderId,
        AMOUNT: order.amount,
        CURRENCY: order.currency,
        CARDNO: order.cardNumber,
        ED: order.cardExpire,
        COM: order.description,
        CVC: order.CVC,
        OPERATION: order.operation,
        ECI: order.ECI,
        COF_INITIATOR: order.COF,
        CN: customer.name,
        EMAIL: customer.email,
        OWNERADDRESS: customer.address,
        OWNERZIP: customer.zip,
        OWNERTOWN: customer.town,
        OWNERCTY: customer.country,
        OWNERTELNO: customer.phone,
        REMOTE_ADDR: customer.remoteAddress ? customer.remoteAddress : "NONE"
    };

    function generateShaSign(form) {
        let kvPairs = [];
        for (let key in form) {
            if (!form.hasOwnProperty(key))
                continue;
            if (form[key] === undefined || (typeof (form[key]) === "string" && form[key].length === 0))
                continue;
            kvPairs.push(key.toUpperCase() + "=" + form[key] + options.shaIn);
        }
        return sha1(kvPairs.sort().join(""));
    }

    form.SHASIGN = generateShaSign(form);

    return new Promise((resolve, reject) => {
        rp({
            method: 'POST',
            uri: options.url,
            form: form,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        }).then(function (body) {
            xml2js.parseString(body, (err, res) => {
                if (err)
                    reject(err);
                res = res["ncresponse"]["$"];
                resolve({
                    errorCode: res.NCERROR,
                    status: parseInt(res.STATUS),
                    orderId: res.orderID,
                    payId: res.PAYID
                });
            });
        }).catch(err => reject(err));
    })
};

module.exports = transaction;