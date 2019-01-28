const fs = require('fs');

var lineReader = require('readline').createInterface({
    input: fs.createReadStream('hs_giftcards_1548663852.csv')
});

let buffer = "";

lineReader.on('line', function (line) {
    let parts = line.split(";");
    let creationParts = parts[7].split(" ")[0].split("/");
    let expireDate = creationParts[0] + "/" + creationParts[1] + "/" + (parseInt(creationParts[2]) + 1);
    let expireDateObj = new Date(parseInt(creationParts[2]) + 1, parseInt(creationParts[1]) - 1, parseInt(creationParts[0]));
    parts.push(expireDate);
    if (expireDateObj.getTime() < (new Date()).getTime())
        parts.push("EXPIRED");
    else
        parts.push("valid");
    parts[1] = parseInt(parts[1]) / 100 + "EUR";
    parts[2] = parseInt(parts[2]) / 100 + "EUR";
    buffer += parts.join(";") + "\n";
});

lineReader.on("close", () => {
    fs.writeFileSync("hs_gift_cards_" + (new Date).getTime(), buffer);
});