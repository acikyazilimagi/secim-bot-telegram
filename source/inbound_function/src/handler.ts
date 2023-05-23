import { Context } from "aws-lambda";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { LambdaFunctionEvent } from "./application/lambdaFunctionEvent";
import { TelegramMessage } from "./application/telegramMessage";
import { v4 as uuidv4 } from "uuid";

export const handler = async (event: LambdaFunctionEvent, context: Context) => {
  // const failedMessageIds: string[] = [];

  // event.Records.forEach(record => {
  //   try {
  //     const bodyMessage = Buffer.from(record.body, "base64").toString(
  //       "binary"
  //     );
  //     handleRecord(bodyMessage, context);
  //   } catch (error) {
  //     console.log(error);
  //     failedMessageIds.push(record.messageId);
  //   }
  // });

  // return {
  //   // https://www.serverless.com/blog/improved-sqs-batch-error-handling-with-aws-lambda
  //   // https://docs.aws.amazon.com/prescriptive-guidance/latest/lambda-event-filtering-partial-batch-responses-for-sqs/best-practices-partial-batch-responses.html
  //   // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
  //   batchItemFailures: failedMessageIds.map(id => {
  //     return {
  //       itemIdentifier: id
  //     }
  //   })
  // }
  try {
    const bodyMessage = Buffer.from(event.Records[0].body, "base64").toString(
      "binary"
    );
    handleRecord(bodyMessage, context);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const handleRecord = async (bodyMessage: string, context: Context) => {
  console.log(bodyMessage);
  const sqsClient = new SQSClient({ region: process.env.AWSRegion });
  const telegramMessage: TelegramMessage = JSON.parse(bodyMessage);
  const outgoingMessage = handleMessage(telegramMessage);
  if (outgoingMessage) {
    console.log(outgoingMessage);
    const awsAccountID = context.invokedFunctionArn.split(":")[4];
    const queueUrl = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${awsAccountID}/${process.env.OutboundQueueName}`;
    console.log(queueUrl);
    const params = {
      MessageGroupId: `${telegramMessage.message.chat.id}`,
      MessageDeduplicationId: uuidv4(),
      MessageBody: JSON.stringify({
        chatid: telegramMessage.message.chat.id,
        message: outgoingMessage,
      }),
      QueueUrl: queueUrl,
    };
    const outboundSqsMessage = new SendMessageCommand(params);
    console.log(outboundSqsMessage);
    const data = await sqsClient.send(outboundSqsMessage);
    console.log(data);
  };
};

function handleMessage(telegramMessage: TelegramMessage) {
  switch (telegramMessage.message.text) {
    case "/start":
      return welcomeMessage(telegramMessage);
    case "/map":
      return mapMessage(telegramMessage);
    case "/info":
      return infoMessage(telegramMessage);
    default:
      return null;
  }
};

function welcomeMessage(telegramMessage: TelegramMessage) {
  const message = [
    "Merhaba, Müşahit Haritası Telegram Botuna Hoşgeldiniz!",
    "Tanıtım 2.Satır",
    "ĞÜŞİÖÇIğüşiöçı"
  ];

  return message.reduce((acc, item) => {
    return acc + item;
  });
};

function mapMessage(telegramMessage: TelegramMessage) {
  const message = [
    "[Müşahit Haritası için tıklayınız.](https://www.google.com)"
  ];
  return message.join(" ");
};

function infoMessage(telegramMessage: TelegramMessage) {
  const message = [
    "Seçim surecinde gözlemci iseniz seçim bölgesine gitmeden lütfen yaninizda erzak ve mümkunse powerbank de götürün, Sayim süreçleri Sabah: 06:00 ya kadar sürebiliyor ve bazen partisel gida operasyonlari gecike biliyor.",
    "Ayni sandigin sayimina en fazla 3 kez itiraz edilebilir. Bkz Madde (Ysk Maddesi) PDF Linki:",
    "Onceki seçimde sandik basinda 5 adet parti sandik sorumlusu var iken bu sayi 2 ye düstü bundan ötürü gözlemciler seçim seffaligi adina ok kritik önem tasiyor."
  ];
  return message.join(" ");
};