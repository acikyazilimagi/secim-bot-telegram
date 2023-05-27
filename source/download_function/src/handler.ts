import { Context } from "aws-lambda";
import { LambdaFunctionEvent } from "./application/lambdaFunctionEvent";
import { PhotoSize } from "./application/telegramMessage";
import * as AWS from "aws-sdk";
import axios, { AxiosResponse } from "axios";
import { v4 as uuidv4 } from "uuid";
import path = require('path');
import { sendToSqs } from "./application/sqsMessage";
const fetch = require('node-fetch').default
export const handler = async (event: LambdaFunctionEvent, context: Context) => {
  const failedMessageIds: string[] = [];
  const token = await readToken();
  const awsAccountID = context.invokedFunctionArn.split(":")[4];

  for (const record of event.Records) {
    try {
      console.log({ record });
      console.log(`Processing ${record.messageId}`);
      await handleRecord(record.body, token, awsAccountID).then(
        () => console.log(`Successfully processed ${record.messageId}`)
      ).catch(
        () => {
          console.log(`Failed message ${record.messageId}`);
          failedMessageIds.push(record.messageId);
        }
      );
    } catch (error) {
      console.error(error);
      failedMessageIds.push(record.messageId);
    }
  };

  console.log({ failedMessageIds });

  return {
    // https://www.serverless.com/blog/improved-sqs-batch-error-handling-with-aws-lambda
    // https://docs.aws.amazon.com/prescriptive-guidance/latest/lambda-event-filtering-partial-batch-responses-for-sqs/best-practices-partial-batch-responses.html
    // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
    batchItemFailures: failedMessageIds.map(id => {
      return {
        itemIdentifier: id
      }
    })
  };
};

type DownloadRequest = {
  user_id: number,
  chat_id: number,
  photo: PhotoSize
}

type TelegramGetFileResponse
  = {
    ok: boolean,
    result: {
      file_id: string,
      file_unique_id: string,
      file_size: number,
      file_path: string
    }
  }

async function handleRecord(body: string, token: string, awsAccountID: string) {
  try {

    const message: DownloadRequest = JSON.parse(body);
    const user_id = message.user_id;
    const chat_id = message.chat_id;
    const photo = message.photo;
    console.log({ photo, chat_id });

    let url = `https://api.telegram.org/bot${token}/getFile?file_id=${photo.file_id}`;

    console.log(`Calling Telegram GetFile: ${url}`);

    const { result } = await fetch(url).then((res: any) => {
      console.log({ res });
      return res.json()
    }).then((res: any) => {
      console.log(res)
      return res as TelegramGetFileResponse
    })

    const file_ext: string = path.extname(result.file_path);
    url = `https://api.telegram.org/file/bot${token}/${result.file_path}`
    console.log(`Calling Buffer GetPhoto: ${url}`)


    const photoBuffer = await axios.get<any, AxiosResponse<ArrayBuffer>>(url, {
      responseType: "arraybuffer",
    }).then((res) => {
      return Buffer.from(res.data)
    })


    console.log("SEND TO S3")
    const s3photoBucket = new AWS.S3({
      region: process.env.AWS_REGION
    })

    const prefix: number = user_id % 100;
    const uploadedImage = await s3photoBucket.upload({
      Bucket: process.env.DownloadBucket as string,
      Key: `${prefix}/${user_id}_${uuidv4()}${file_ext}`,
      Body: photoBuffer,
      ContentType: "application/octet-stream"
    }).promise()

    const response = handleTextResponse(user_id, chat_id, awsAccountID);
    await sendToSqs(response, process.env.AWS_REGION);
  } catch (error) {
    console.error(error);
    throw error;
  }
}


const handleTextResponse = (user_id: number, chat_id: number, awsAccountID: string) => {
  const region = process.env.AWS_REGION;
  const qname = process.env.OutboundQueueName;
  const queueUrl = `https://sqs.${region}.amazonaws.com/${awsAccountID}/${qname}`;
  const outgoingMessage = {
    chat_id: chat_id,
    text: `Teşekkürler\\! Gönderdiğiniz fotoğraf başarıyla sistemimize kaydedildi\\!`,
  };


  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(outgoingMessage),
    MessageGroupId: `${chat_id}`,
    MessageDeduplicationId: uuidv4(),
  };

  return {
    params,
  };

};

async function readToken() {
  const secretManagerClient = new AWS.SecretsManager({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.accsessKey,
    secretAccessKey: process.env.accsessSecret,
  });
  const secret = await secretManagerClient
    .getSecretValue({
      SecretId: process.env.TelegramBotToken || "TelegramBotToken",
    })
    .promise();
  if (!secret.SecretString) {
    throw new Error("No telegram Key");
  }

  const token = JSON.parse(secret.SecretString).token;
  return token;
}




