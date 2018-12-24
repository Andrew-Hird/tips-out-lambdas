const AWS = require('aws-sdk');

AWS.config.update({region: 'ap-southeast-2'});

const documentClient = new AWS.DynamoDB.DocumentClient();

const ratesTable = 'rates';

exports.handler = async (event) => {
    try {
        const res = await getRates();
        console.log('Success getting rates');

        const body = res.Item ? res.Item : {'error': 'rates not available at this time'};

        const response = {
            statusCode: 200,
            body: JSON.stringify(body),
        };
        return response;
    } catch (e) {
        console.log('An error occurred', e);
    }
};

async function getRates() {
    console.log('Getting rates');
    const params = {
        TableName: ratesTable,
        Key: {
            base: 'USD'
        }
    };

    return documentClient.get(params).promise();
}
