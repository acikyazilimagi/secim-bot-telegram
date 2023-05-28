#Creates the download queue.
resource "aws_sqs_queue" "download_queue_deadletter" {
  name       = local.download_queue_deadletter_name
  fifo_queue = true
}
resource "aws_sqs_queue" "download_queue" {
  name                        = local.download_queue_name
  fifo_queue                  = true
  content_based_deduplication = false
  visibility_timeout_seconds  = 100
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.download_queue_deadletter.arn
    maxReceiveCount     = 10
  })
}

#Creates the role to be assumed by the Lambda function.
resource "aws_iam_role" "download_lambda_execution_role" {
  name = local.download_lambda_execution_role_name

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

#Get the download lambda function code and zip it in the build directory.
data "archive_file" "lambda_download_zip" {
  type = "zip"

  source_dir  = "${local.build_directory}/download_function/dist/"
  output_path = "${local.build_directory}/build/download_function.zip"
}

#Get the download lamnda function zip and uploadt it to S3.
resource "aws_s3_object" "lambda_download_s3" {
  bucket = var.s3_deployment_bucket

  key    = "download_function.zip"
  source = data.archive_file.lambda_download_zip.output_path

  etag = filemd5(data.archive_file.lambda_download_zip.output_path)
}

#Create the download lambda function.
resource "aws_lambda_function" "lambda_download_function" {
  function_name = local.download_lambda_function_name

  s3_bucket = var.s3_deployment_bucket
  s3_key    = aws_s3_object.lambda_download_s3.key

  runtime = "nodejs16.x"
  handler = "handler.handler"

  timeout = 60

  source_code_hash = data.archive_file.lambda_download_zip.output_base64sha256

  role = aws_iam_role.download_lambda_execution_role.arn

  environment {
    variables = {
      TelegramBotToken  = var.secrets_manager_id,
      DownloadBucket    = var.s3_download_bucket,
      OutboundQueueName = local.outbound_queue_name
    }
  }
}

#Attach the AWSLambdaBasicExecutionRole to the created role.
resource "aws_iam_role_policy_attachment" "download_lambda_execution_role_Policy_LambdaBasicExecution" {
  role       = aws_iam_role.download_lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

#Create the policy allowing to post and read messages to the inbound and download queue.
resource "aws_iam_policy" "aws_lambda_sqs_download_policy" {

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
              "sqs:SendMessage",
              "sqs:DeleteMessage",
              "sqs:ChangeMessageVisibility",
              "sqs:ReceiveMessage",
              "sqs:PurgeQueue",
              "sqs:GetQueueAttributes"
            ],
            "Resource": ["${aws_sqs_queue.outbound_queue.arn}", "${aws_sqs_queue.download_queue.arn}"]
        },
        {
            "Effect": "Allow",
            "Action": [
              "s3:*",
              "s3-object-lambda:*"
            ],
            "Resource": ["arn:aws:s3:::${var.s3_download_bucket}/*"]
        }
    ]
}
EOF

  depends_on = [
    aws_sqs_queue.outbound_queue,
    aws_sqs_queue.download_queue
  ]
}

#Attach the created policy to the created role.
resource "aws_iam_role_policy_attachment" "download_lambda_execution_role_Policy_sqs" {
  role       = aws_iam_role.download_lambda_execution_role.name
  policy_arn = aws_iam_policy.aws_lambda_sqs_download_policy.arn
}

#Sets the inbound SQS as a lamnda trigger.
resource "aws_lambda_event_source_mapping" "event_source_mapping_download" {
  event_source_arn        = aws_sqs_queue.download_queue.arn
  enabled                 = true
  function_name           = aws_lambda_function.lambda_download_function.arn
  batch_size              = 10
  function_response_types = ["ReportBatchItemFailures"]

  depends_on = [
    aws_iam_role_policy_attachment.download_lambda_execution_role_Policy_sqs
  ]
}



#Attach the created policy to the created role.
resource "aws_iam_role_policy_attachment" "download_lambda_execution_role_Policy_secrets" {
  role       = aws_iam_role.download_lambda_execution_role.name
  policy_arn = aws_iam_policy.aws_lambda_secrets_policy.arn
}