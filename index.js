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
    let form = {
        PSPID: options.pspid,
        ORDERID: order.orderId,
        USERID: options.userId,
        PSWD: options.password,
        AMOUNT: order.amount,
        CURRENCY: order.currency,
        CARDNO: order.cardNumber,
        ED: order.cardExpire,
        COM: order.description,
        CN: customer.name,
        EMAIL: customer.email,
        CVC: order.cardCVC,
        OPERATION: order.operation,
        OWNERADDRESS: customer.address,
        OWNERZIP: customer.zip,
        OWNERTOWN: customer.town,
        OWNERCTY: customer.country,
        OWNERTELNO: customer.phone,
        REMOTE_ADDR: customer.remoteAddress,
        ECI: order.eci,
        COF_INITIATOR: order.cof,
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

    return new Promise((resolve, reject) => {
        rp({
            method: 'POST',
            uri: process.env.INGENICO_URL,
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