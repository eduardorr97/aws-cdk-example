const { DynamoDB } = require('aws-sdk');

export const read = async (params: any) => {
    const dynamo = new DynamoDB();
    try {
        const result = await dynamo.get(params).promise()
        return sendRes(200, JSON.stringify(result))
    } catch (error) {
        return sendRes(error.statusCode, JSON.stringify(error))
    }
}

export const create = async (params: any) => {
    const dynamo = new DynamoDB();
    try {
        const result = await dynamo.put(params).promise()
        return sendRes(200, JSON.stringify(result))
    } catch (error) {
        return sendRes(error.statusCode, JSON.stringify(error))
    }
}

export const update = async (updateParams: any) => {
    const dynamo = new DynamoDB();
    try {
        const result = await dynamo.update(updateParams).promise()
        return sendRes(200, JSON.stringify(result))
    } catch (error) {
        return sendRes(error.statusCode, JSON.stringify(error))
    }
}

export const remove = async (params: any) => {
    const dynamo = new DynamoDB();
    try {
        const result = await dynamo.delete(params).promise()
        return sendRes(200, JSON.stringify(result))
    } catch (error) {
        return sendRes(error.statusCode, JSON.stringify(error))
    }
}

export const sendRes = (status: number, body: string) => {
    const response = {
        statusCode: status,
        headers: {
            "Content-Type": "text/html"
        },
        body: body
    };
    return response;
};

export const prepareUpdateExpression = (params: any) => {
    try {
        let item = params.Item
        delete item.id
        let vbl = "x";
        let adder = "y";
        let updateexp = 'set ';
        let itemKeys = Object.keys(item);
        let expattvalues = {};

        for (let i = 0; i < itemKeys.length; i++) {
            vbl = vbl + adder;

            if ((itemKeys.length - 1) == i)
                updateexp += itemKeys[i] + ' = :' + vbl;
            else
                updateexp += itemKeys[i] + ' = :' + vbl + ", ";

            expattvalues[":" + vbl] = item[itemKeys[i]];
        }

        return {
            TableName: params.TableName,
            Key: params.Key,
            UpdateExpression: updateexp,
            ExpressionAttributeValues: expattvalues,
            ReturnValues: 'ALL_NEW'
        };
    } catch (error) {
        return sendRes(error.statusCode, JSON.stringify(error))
    }
}