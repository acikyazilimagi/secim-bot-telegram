import { Context } from "aws-lambda";
import { LambdaFunctionEvent } from "./application/lambdaFunctionEvent";
import { UpdateMessage, PhotoSize, InlineKeyboardButton, InlineKeyboardMarkup, CallbackQuery, Document, Message } from "./application/telegramMessage";
import { v4 as uuidv4 } from "uuid";
import { sendToSqs } from "./application/sqsMessage";


export const handler = async (event: LambdaFunctionEvent, context: Context) => {
  const failedMessageIds: string[] = [];
  const region = process.env.AWS_REGION || "";
  const awsAccountID = context.invokedFunctionArn.split(":")[4];

  for (const record of event.Records) {
    try {
      const bodyMessage = Buffer.from(record.body, "base64").toString("binary");
      console.log(`Processing ${record.messageId}`);

      const parsedBodyMessage = JSON.parse(bodyMessage)

      if (parsedBodyMessage.callback_query) {
        console.log("Proccesing Callback Query")
        await handleCallbackQuery(region, awsAccountID, bodyMessage).then(
          () => console.log(`Successfully processed ${record.messageId}`)
        ).catch(
          () => {
            console.log(`Failed message ${record.messageId}`);
            failedMessageIds.push(record.messageId);
          }
        );
      } else if (parsedBodyMessage.message) {
        console.log("this is message")
        await handleRecord(region, awsAccountID, bodyMessage).then(
          () => console.log(`Successfully processed ${record.messageId}`)
        ).catch(
          () => {
            console.log(`Failed message ${record.messageId}`);
            failedMessageIds.push(record.messageId);
          }
        );
      }

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
  }
};

const handleCallbackQuery = async (region: string, awsAccountID: string, bodyMessage: string) => {

  try {

    const data: {
      update_id: number
      callback_query: CallbackQuery
    } = JSON.parse(bodyMessage);
    console.log("callback querye hosgeldiniz")
    console.log(data)

    if (data.callback_query.data) {
      const callback_data = data.callback_query.data;
      console.log(`callback query Tanimlaniyor ${callback_data}}`)
      const region = process.env.AWS_REGION;
      const qname = process.env.OutboundQueueName;
      const queueUrl = `https://sqs.${region}.amazonaws.com/${awsAccountID}/${qname}`;
      const chat_id = data.callback_query.message.chat.id
      const outgoingMessage = prepareTextResponse(callback_data, chat_id);

      console.log(outgoingMessage)

      const body = {
        params: {
          QueueUrl: queueUrl,
          MessageBody: outgoingMessage,
          MessageGroupId: `${chat_id}`,
          MessageDeduplicationId: uuidv4(),
        }
      };

      await sendToSqs(body, region);

    }
  }
  catch (err) {
    console.log("callback query err ", err)
  }


}




const handleRecord = async (region: string, awsAccountID: string, bodyMessage: string) => {
  try {
    const updateMessage: UpdateMessage = JSON.parse(bodyMessage);
    const input = updateMessage.message?.text?.toLowerCase() || "";

    let response;

    if (input == "/start") {
      response = handleTextRequest("/start", awsAccountID, updateMessage);
      await sendToSqs(response, region);
      // response = handleTextRequest("/map", awsAccountID, updateMessage);
      // await sendToSqs(response, region);
      // response = handleTextRequest("/info", awsAccountID, updateMessage);
      // await sendToSqs(response, region);
      // response = handleTextRequest("/reminder", awsAccountID, updateMessage);
      // await sendToSqs(response, region);
    }



    if (updateMessage.message?.photo) {
      const photos: PhotoSize[] = updateMessage.message.photo;
      let photo: PhotoSize = photos[photos.length - 1];
      response = handlePhotoRequest(photo, awsAccountID, updateMessage);
      await sendToSqs(response, region);
    }

    if (updateMessage.message?.document) {
      const document: Document = updateMessage.message.document;
      console.log("document is sent.");
      if (document.mime_type?.startsWith("image")) {
        console.log("Sent document is image.");
        let photo: PhotoSize = {
          file_id: document.file_id,
          width: 0,
          height: 0,
          file_size: document.file_size,
          file_unique_id: document.file_unique_id
        }
        response = handlePhotoRequest(photo, awsAccountID, updateMessage);
        await sendToSqs(response, region);

      } else {
        response = handleTextRequest("/invalid_document_format", awsAccountID, updateMessage, false);
        await sendToSqs(response, region);
      }
    }

    const message: Message | undefined = updateMessage.message;
    if (message?.video || message?.video_note || message?.audio || message?.poll || message?.contact || message?.game || message?.voice) {
      response = handleTextRequest("/invalid_message_format", awsAccountID, updateMessage, false);
      await sendToSqs(response, region);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}




const handlePhotoRequest = (input: PhotoSize, awsAccountID: string, updateMessage: UpdateMessage) => {
  const region = process.env.AWS_REGION;
  const qname = process.env.DownloadQueueName;
  const queueUrl = `https://sqs.${region}.amazonaws.com/${awsAccountID}/${qname}`;
  const chat_id: number = updateMessage.message?.chat?.id || 0;
  const user_id: number = updateMessage.message?.from.id || 0;
  const outgoingMessage = {
    user_id: user_id,
    chat_id: chat_id,
    photo: input
  };

  if (outgoingMessage) {
    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(outgoingMessage),
      MessageGroupId: `${chat_id}`,
      MessageDeduplicationId: uuidv4(),
    };

    return {
      params,
    };
  }

  return {
  };
};

const handleTextRequest = (input: string, awsAccountID: string, updateMessage: UpdateMessage, include_buttons?: boolean) => {
  const region = process.env.AWS_REGION;
  const qname = process.env.OutboundQueueName;
  const queueUrl = `https://sqs.${region}.amazonaws.com/${awsAccountID}/${qname}`;
  const chat_id: number = updateMessage.message?.chat?.id || 0;
  const outgoingMessage = prepareTextResponse(input, chat_id, include_buttons);

  if (outgoingMessage) {
    const params = {
      QueueUrl: queueUrl,
      MessageBody: outgoingMessage,
      MessageGroupId: `${chat_id}`,
      MessageDeduplicationId: uuidv4(),
    };

    return {
      params,
    };
  }

  return {
  };
};

const buttons: Record<string, InlineKeyboardButton> = {
  "map": {
    text: "Eksik Oy Tutanakları Haritası",
    callback_data: "/map"
  },
  "info": {
    text: "Gözlemci için Bilgiler",
    callback_data: "/info"
  },
  "who_we_are": {
    text: "Biz Kimiz",
    callback_data: "/who_are_we"
  },
  "uploadphoto": {
    text: "Nasıl Tutanak Fotoğrafı Gönderebilirim?",
    callback_data: "/upload_photo",
  }
}

const messages: Record<string, string[]> = {
  "/start": [
    "*Oy Tutanak Telegram Botu * ",
    "Merhaba, *Oy Tutanak Telegram Botu*na hoşgeldiniz\\.",
    "Aşağıdaki butonlara tıklayarak oy tutanağı fotoğrafı gönderebilir, eksik oy tutanakları haritasını görebilir veya genel bilgi alabilirsiniz\\.",
  ],
  "/map": [
    "* Eksik Oy Tutanakları Haritası * ",
    "Eksik oy tutanakları haritası 28 Mayıs günü seçim yasaklarının kaldırılmasını takiben kullanıma açılacaktır\\. Ardından her 10 dakikada bir güncellenmeye başlayacaktır\\.\n",
    "Yakın çevrenizdeki oy tutanaklarını takip edebilirsiniz ve yakın çevrenizdeki eksik oy tutanaklarını sisteme gönderebilirsiniz\\.\n",
    "Eksik oy tutanakları haritasına  [secim\\.gonullu\\.io](https://secim\\.gonullu\\.io) adresinden ulaşabilirsiniz\\.",
  ],
  "/info": [
    "* Gözlemci için Bilgiler * ",
    "\\- Seçim sürecinde gözlemci iseniz, seçim bölgesine gitmeden önce lütfen yanınızda erzak ve mümkünse powerbank gibi yanınıza alabileceğiniz şeyler bulundurun\\. Sayım süreçleri sabah 06:00'ya kadar sürebilir ve bazen partiye özel gıda operasyonları gecikebilir\\.",
    "\\- Önceki seçimde sandık başında 5 adet parti sandık sorumlusu bulunurken, bu sayı 2'ye düştü\\. Bu nedenle, gözlemciler seçim şeffaflığı açısından son derece önemli hale gelmektedir\\.",
    "\\- Sonuç Tutanakları tüm tutanaklar sayıldıktan sonra imzanlanmalıdır\\.",
    "\\- Herhangi bir usulsüzlük tespit ettiğinizde Barolar Birliği'nin Gözlemciler İçin hazırladığı PDF'yi inceleyebilirsiniz\\. [PDF İÇİN TIKLAYIN](https://t\\.co/pfN8IJ3kNo)",
  ],
  "/who_are_we": [
    "* Biz Kimiz * ",
    "Bu Whatsapp Botu'nun sahibi Açık Yazılım ağıdır\\. Botun amacı, siyasilerden bağımsız ve şeffaf bir şekilde oy suistimalini engellemeyi hedeflemektedir\\.\n",
    "İletişim için:\n",
    "\\- Twitter: [https://twitter\\.com/acikyazilimagi](https://twitter\\.com/acikyazilimagi)",
    "\\- Discord:[https://discord\\.gg/itdepremyardim](https://discord\\.gg/itdepremyardim)\n",
  ],
  "/reminder": [
    "Gözlemci olarak ulaştığınız *ISLAK İMZALI* sonuç tutanak fotoğraflarını aşağıda gönderebilirsiniz\\.",
    "Haydi şimdi bir fotoğraf göndermeyi deneyin\\!"
  ],
  "/upload_photo": [
    "* Nasıl Tutanak Fotoğrafı Gönderebilirim\\? * ",
    "Göndermek istediğiniz *ISLAK İMZALI* sonuç tutanak fotoğrafını veya fotoğraflarını lütfen kameraya tam sığacak şekilde, kamera odaklandıktan sonra ve mümkünse iyi ışık alan bir yerde çekiniz\\.",
    "Ardından Telegram içinde alışık şekilde fotoğrafı veya fotoğrafları bize mesaj olarak gönderin\\.",
    "Gönderdiğiniz her fotoğraf sistemize başarıyla kaydedildikten sonra bir bilgilendirme cevabı alacksınız\\.",
    "Gönderdiginiz sonuç tutanaklarının ilgili yerlere iletilecektir\\.",
    "LÜTFEN *ISLAK İMZALI* SONUÇ TUTANAK FOTOĞRAFLARINIZI GÖNDERİN\\.",
  ],
  "/invalid_document_format": [
    "HATA: Paylaştığınız dosya tipi uygun değildir\\! Lütfen sadece fotoğraf dosyalarını paylaşınız\\. Fotoğraf dışındaki belge, video gibi dosyaları kabul ede*mi*yoruz\\."
  ],
  "/invalid_message_format": [
    "HATA: Paylaştığınız mesaj tipi uygun değildir\\! Lütfen sadece fotoğraf dosyalarını paylaşınız\\. Fotoğraf dışındaki belge, video gibi mesajları kabul ede*mi*yoruz\\."
  ],

};



function prepareTextResponse(input: string, chat_id: number, include_buttons: boolean = true) {

  // const input = updateMessage.message.text?.toLowerCase();
  console.log("Incoming prepare Text Context:", input)


  var text: string | null = null;
  var reply_markup: string | null = null;

  if (include_buttons) {
    const inlineKeyboard: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          buttons["map"],
        ],
        [
          buttons["info"],
        ],
        [
          buttons["who_we_are"],
        ],
        [
          buttons["uploadphoto"],
        ],
      ]
    }
    reply_markup = JSON.stringify(inlineKeyboard);
  }
  text = messages[input]?.join('\n');


  return JSON.stringify({
    chat_id: chat_id,
    text: text,
    reply_markup: reply_markup,
  })
}

