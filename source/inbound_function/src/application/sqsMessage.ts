import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export interface SqsMessage {
    params?:
    { 
        QueueUrl: string; 
        MessageBody: string; 
        MessageGroupId: string; 
        MessageDeduplicationId: string; 
    } 
}

export const sendToSqs = async (response: SqsMessage, region: string | undefined) => {
    if (response.params) {
      const outboundSqsMessage = await new SendMessageCommand(response.params);
  
      console.log(JSON.stringify(response));
      console.log(JSON.stringify({ outboundSqsMessage }));
  
      const sqsClient = await new SQSClient({ region });
  
      return await sqsClient.send(outboundSqsMessage).then(
        (res) => {
          console.log("Succes SQS", res)
        }
      ).catch(
        (err) => {
          console.log("Error SQS", err)
        }
      )
    }
  }