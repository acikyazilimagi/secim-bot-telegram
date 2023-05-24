import { Context } from "aws-lambda";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { LambdaFunctionEvent } from "./application/lambdaFunctionEvent";
import { TelegramMessage } from "./application/telegramMessage";
import { InlineKeyboardMarkup, InlineKeyboardButton, KeyboardButton } from "./application/telegramReply";
import { v4 as uuidv4 } from "uuid";

export const handler = async (event: LambdaFunctionEvent, context: Context) => {
  try {
    const region = process.env.AWS_REGION;
    const bodyMessage = Buffer.from(event.Records[0].body, "base64").toString("binary");
    const response = handleRequest(bodyMessage, context);

    if (response.params) {
      const outboundSqsMessage = new SendMessageCommand(response.params);

      console.log(JSON.stringify(response));
      console.log(JSON.stringify({ outboundSqsMessage }));

      const sqsClient = new SQSClient({ region });

      try {
        const result = await sqsClient.send(outboundSqsMessage);
        console.log("Success");
        console.log(JSON.stringify(result));
      } catch (err) {
        console.error("Error", err);
        throw err;
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

interface RequestResponse {
  telegramMessage: TelegramMessage;
  queueUrl: string;
  params?: SendMessageCommand["input"];
}

const handleRequest = (bodyMessage: string, context: Context) => {
  const region = process.env.AWS_REGION;
  const qname = process.env.OutboundQueueName;
  const awsAccountID = context.invokedFunctionArn.split(":")[4];
  const queueUrl = `https://sqs.${region}.amazonaws.com/${awsAccountID}/${qname}`;

  const telegramMessage: TelegramMessage = JSON.parse(bodyMessage);
  const outgoingMessage = handleMessage(telegramMessage);

  if (outgoingMessage) {
    const params = {
      QueueUrl: queueUrl,
      MessageBody: outgoingMessage,
      MessageGroupId: `${telegramMessage.message.chat.id}`,
      MessageDeduplicationId: uuidv4(),
    };

    return {
      telegramMessage,
      queueUrl,
      params,
    };
  }

  return {
    telegramMessage,
    queueUrl,
  };
};

const messages: Record<string, string[]> = {
  "/start": [
    "Merhaba, Güvenli Oy Telegram Botuna Mesaj Attınız.Oy Güvenliği Telegram Botu 27 Mayıs 00:00 tarihine kadar deaktif kalacaktır.27 mayıs tarihinden sonra oy tutanakların gerekli yerlere hızlıca ulaşması için tutanak gönderme fonksiyonu açılacaktır. Kısaca türkiyenin her yerinden kolayca tüm tutanakları Telegram aracılığı ile gönderebilceksiniz. Bu süreç boyunca alttaki  butonlara tıklayarak eksik olan müşahitlikleri haritadan görebilir ve gönüllü olabilirsiniz veya gözlemci iseniz genel ipuçları için butona tıklaya bilirsiniz.Her etkileşiminiz için KVKK’mızı kabul etmiş bulunursunuz. [KVKK’mızın PDF Linki](https://www.google.com/)",
  ],
  "/map": ["(www.internetaderesi.com) adresinde seçim süreci boyunca eksik olan müşahit bölgelerini görebilirsiniz. Buralardan eksik bölgelerde gönüllü olup vatandaşlık görevinizi yerine getirebilirsiniz."],
  "/info": [
    "Seçim sürecinde gözlemci iseniz seçim bölgesine gitmeden lütfen yanınızda erzak ve mümkünse powerbank de götürün, Sayım süreçleri Sabah: 06:00 ya kadar sürebiliyor ve bazen partisel gıda operasyonları gecike biliyor",
    "Aynı sandığın sayımına en fazla 3 kez itiraz edilebilir. Bkz Madde (Ysk Maddesi) PDF Linki :",
    "Önceki seçimde sandık başında 5 adet parti sandık sorumlusu var iken bu sayı 2 ye düştü bundan ötürü gözlemciler seçim şeffalığı adına çok kritik önem taşıyor.",
  ],
};

const buttons: Record<string, InlineKeyboardButton> = {
  "musahit": {
    text: "Müşahit Haritası",
    url: "https://www.musahitharita.com/",
  },
  "gozlemci": {
    text: "Gözlemcilik Haritası",
    url: "https://www.gozlemciharita.com/",
  },
}

function handleMessage(telegramMessage: TelegramMessage) {
  const input = telegramMessage.message.text?.toLowerCase();
  var text: string | null = null;
  var reply_markup: string | null = null;
  switch (input) {
    case "/start":
      const inlineKeyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
          [
            buttons["musahit"],
          ],
          [
            buttons["gozlemci"],
          ]
        ]
      }
      reply_markup = JSON.stringify(inlineKeyboard);

    default:
      text = messages[input]?.join(" ");
      break;
  }

  return JSON.stringify({
    chat_id: telegramMessage.message.chat.id,
    text: text,
    reply_markup: reply_markup,
  })
}

