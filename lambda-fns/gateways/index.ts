import { sendRes, read, create, update, prepareUpdateExpression, remove } from '../service.tool'
import { v4 as uuidv4 } from 'uuid';

exports.handler = async (event: any) => {
    const params = {
        TableName: process.env.TABLE_NAME
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
    console.log("get gateway request:", JSON.stringify(event, undefined, 2));

    let serial = event?.queryStringParameters?.gatewayId
    if (!serial) {
        return sendRes(501, 'Bad request, no gatewayId found.')
    }

    params.Key = {
        serial
    }

    return await read(params)
}



const toCreate = async (event: any, params: any) => {
    console.log("insert gateway request:", JSON.stringify(event, undefined, 2));

    let body = event.body && JSON.parse(event.body) || {}
    let gateway = body.gateway

    if (!gateway) {
        return sendRes(501, 'Bad request, no gateway found.')
    }

    gateway.serial = gateway.serial || uuidv4()
    gateway.createdAt = new Date().getTime()

    params.Item = Object.assign({}, gateway)
    params.Key = {
        serial: gateway.serial
    }

    return await create(params)
}


const toRemove = async (event: any, params: any) => {
    console.log("remove gateway request:", JSON.stringify(event, undefined, 2));

    let serial = event?.queryStringParameters?.serial
    if (!serial) {
        return sendRes(501, 'Bad request, no gatewayId found.')
    }

    params.Key = {
        serial
    }

    return await remove(params)
}



const toUpdate = async (event: any, params: any) => {
    console.log("update gateway request:", JSON.stringify(event, undefined, 2));

    let body = event.body && JSON.parse(event.body) || {}
    let gateway = body.gateway

    if (!gateway) {
        return sendRes(501, 'Bad request, no gateway found.')
    }

    gateway.updatedAt = new Date().getTime()

    params.Item = Object.assign({}, gateway)
    params.Key = {
        serial: gateway.serial
    }

    const updateExpression = prepareUpdateExpression(params)

    return await update(updateExpression)
}