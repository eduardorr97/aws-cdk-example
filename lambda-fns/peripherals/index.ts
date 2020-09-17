import { sendRes, read, create, update, prepareUpdateExpression, remove } from '../service.tool'

exports.handler = async (event: any) => {
    const params = {
        TableName: process.env.AWS_DYNAMODB_TABLE_NAME
    }

    switch (event.httpMethod) {
        case "POST":
            return await toCreate(event, params)
        case "GET":
            return await toRead(event, params);
        case "PUT":
            return await toUpdate(event, params)
        case "DELETE":
            return await toRemove(event, params)
        default:
            return sendRes(501, "No http method")
    }
}

const toRead = async (event: any, params: any) => {
    console.log("get peripheral request:", JSON.stringify(event, undefined, 2));

    let id = event?.queryStringParameters?.peripheralId
    if (!id) {
        return sendRes(501, 'Bad request, no peripheralId found.')
    }

    params.Key = {
        id
    }

    return await read(params)
}



const toCreate = async (event: any, params: any) => {
    console.log("insert peripheral request:", JSON.stringify(event, undefined, 2));

    let body = event.body && JSON.parse(event.body) || {}
    let peripheral = body.peripheral

    if (!peripheral) {
        return sendRes(501, 'Bad request, no peripheral found.')
    }

    peripheral.id = peripheral.id || (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
    peripheral.createdAt = new Date().getTime()

    params.Item = Object.assign({}, peripheral)
    params.Key = {
        id: peripheral.id
    }

    return await create(params)
}


const toRemove = async (event: any, params: any) => {
    console.log("remove peripheral request:", JSON.stringify(event, undefined, 2));

    let id = event?.queryStringParameters?.id
    if (!id) {
        return sendRes(501, 'Bad request, no peripheralId found.')
    }

    params.Key = {
        id
    }

    return await remove(params)
}



const toUpdate = async (event: any, params: any) => {
    console.log("update peripheral request:", JSON.stringify(event, undefined, 2));

    let body = event.body && JSON.parse(event.body) || {}
    let peripheral = body.peripheral

    if (!peripheral) {
        return sendRes(501, 'Bad request, no peripheral found.')
    }

    peripheral.updatedAt = new Date().getTime()

    params.Item = Object.assign({}, peripheral)
    params.Key = {
        id: peripheral.id
    }

    const updateExpression = prepareUpdateExpression(params)

    return await update(updateExpression)
}