const rp = require('request-promise');
const sha1 = require('sha1');
const xml2js = require('xml2js');

/**
 *
 * @param order
 * @param customer
 * @param options
 * @returns {Promise<any>}
 */
const transaction = (order, customer, options) => {

    if (!options.pspId || !options.userId || !options.password) {
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
                resolve(res);
            });
        }).catch(err => reject(err));
    })
};

module.exports = transaction;