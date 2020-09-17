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
    console.log("get peripheral request:", JSON.stringify(event, undefined, 2));

    let uid = event?.queryStringParameters?.uid
    if (!uid) {
        return sendRes(501, 'Bad request, no peripheralId found.')
    }

    params.Key = {
        uid
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

    peripheral.uid = peripheral.uid || uuidv4()
    peripheral.createdAt = new Date().getTime()

    params.Item = Object.assign({}, peripheral)
    params.Key = {
        uid: peripheral.uid
    }

    return await create(params)
}


const toRemove = async (event: any, params: any) => {
    console.log("remove peripheral request:", JSON.stringify(event, undefined, 2));

    let uid = event?.queryStringParameters?.uid
    if (!uid) {
        return sendRes(501, 'Bad request, no peripheralId found.')
    }

    params.Key = {
        uid
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
        uid: peripheral.uid
    }

    const updateExpression = prepareUpdateExpression(params)

    return await update(updateExpression)
}