import { Context } from "aws-lambda";
import { LambdaFunctionEvent } from "./application/lambdaFunctionEvent";
import { TelegramMessage } from "./application/telegramMessage";
import * as AWS from "aws-sdk";
import axios from "axios";

export const handler = async (event: LambdaFunctionEvent, context: Context) => {
  try {
    const message: TelegramMessage = JSON.parse(event.Records[0].body);

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

    const messageText = message.text;
    const messageReplyMarkup = message.reply_markup;
    console.log({ messageText, messageReplyMarkup });
    if (messageText) {
      const encodedMessageText = encodeURIComponent(messageText);
      var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${message.chat_id
        }&parse_mode=Markdown&text=${encodedMessageText}`;
      if (messageReplyMarkup) {
        const encodedReplyMarkup = encodeURIComponent(messageReplyMarkup);
        url = url.concat(`&reply_markup=${encodedReplyMarkup}`);
      }

      const { status } = await axios.get(url);
      console.log({ status });
    }

  } catch (error) {
    console.log({ error });
    throw error;
  }
};
