const axios = require('axios');
const AWS = require('aws-sdk');

AWS.config.update({region: 'ap-southeast-2'});

const documentClient = new AWS.DynamoDB.DocumentClient();
const ratesTable = 'rates';
const ratesKey = process.env.RATES_KEY;

exports.handler = async (event) => {
    try {
        const rates = await fetchRates();
        console.log('Success fetching rates', {timestamp: rates.data.timestamp});

        await setRates(rates.data);
        console.log('Success setting rates');
    } catch (e) {
        console.log('An error occurred', e);
    }
};

async function fetchRates() {
    console.log('Fetching rates');
    const url = 'https://openexchangerates.org/api/latest.json';
    const params = {headers: {Authorization: `Token ${ratesKey}`}};
    return await axios.get(url, params);
}

async function setRates(rates) {
    console.log('Setting rates');
    const params = {
        TableName: ratesTable,
        Key:{
            "base": 'USD',
        },
        UpdateExpression: "set #t = :t, rates = :r",
        ExpressionAttributeValues:{
            ":t": rates.timestamp.toString(),
            ":r": rates.rates,
        },
        ExpressionAttributeNames: {
            "#t": "timestamp",
        }
    };

    return documentClient.update(params).promise();
}