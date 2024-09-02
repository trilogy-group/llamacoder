import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const ddbClient = {
    put: async (tableName: string, item: Record<string, any>) => {
        const command = new PutCommand({ TableName: tableName, Item: item });
        return ddbDocClient.send(command);
    },

    get: async (tableName: string, key: { PK: string; SK: string }) => {
        const command = new GetCommand({ TableName: tableName, Key: key });
        return ddbDocClient.send(command);
    },

    query: async (tableName: string, keyConditionExpression: string, expressionAttributeValues: Record<string, any>) => {
        const command = new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
        });
        return ddbDocClient.send(command);
    },

    delete: async (tableName: string, key: { PK: string; SK: string }) => {
        const command = new DeleteCommand({ TableName: tableName, Key: key });
        return ddbDocClient.send(command);
    },

    update: async (
        tableName: string,
        key: { PK: string; SK: string },
        updateExpression: string,
        expressionAttributeValues: Record<string, any>,
        expressionAttributeNames?: Record<string, string>
    ) => {
        const command = new UpdateCommand({
            TableName: tableName,
            Key: key,
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
        });
        return ddbDocClient.send(command);
    },
};
