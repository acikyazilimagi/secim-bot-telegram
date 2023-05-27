import { Context } from "aws-lambda";
import { LambdaFunctionEvent } from "./application/lambdaFunctionEvent";
import { TelegramMessage } from "./application/telegramMessage";
import * as AWS from "aws-sdk";
import axios from "axios";
import { read } from "fs";

export const handler = async (event: LambdaFunctionEvent, context: Context) => {
  const failedMessageIds: string[] = [];
  const token = await readToken();

  for (const record of event.Records) {
    try {
      console.log({ record });
      console.log(`Processing ${record.messageId}`);
      await handleRecord(record.body, token).then(
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

async function handleRecord(body: string, token: string) {
  try {

    const message: TelegramMessage = JSON.parse(body);
    const messageText = message.text;
    const messageReplyMarkup = message.reply_markup;
    console.log({ messageText, messageReplyMarkup });
    if (messageText) {
      const encodedMessageText = encodeURIComponent(messageText);
      var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${message.chat_id}&parse_mode=MarkdownV2&text=${encodedMessageText}`;
      if (messageReplyMarkup) {
        const encodedReplyMarkup = encodeURIComponent(messageReplyMarkup);
        url = url.concat(`&reply_markup=${encodedReplyMarkup}`);
      }
      const { status } = await axios.get(url);
      console.log({ status });
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function readToken() {
  const secretManagerClient = new AWS.SecretsManager({
    region: process.env.AWS_REGION,
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

