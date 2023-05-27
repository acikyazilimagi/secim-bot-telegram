#Get the authorizer lambda function code and zip it in the build directory.
data "archive_file" "authorizer_function_zip" {
  type = "zip"

  source_dir  = "${local.build_directory}/authorizer_function/dist"
  output_path = "${local.build_directory}/build/authorizer_function.zip"
}

#Get the authorizer lamnda function zip and uploadt it to S3.
resource "aws_s3_object" "authorizer_function_s3" {
  bucket = var.s3_deployment_bucket

  key    = "authorizer_function.zip"
  source = data.archive_file.authorizer_function_zip.output_path

  etag = filemd5(data.archive_file.authorizer_function_zip.output_path)
}

#Create the role to be assumed by the authorizer lambda function.
resource "aws_iam_role" "authorizer_function_lambda_execution_role" {
  name = local.authorizer_lambda_execution_role_name

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

#Create the authorizer lambda function.
resource "aws_lambda_function" "authorizer_lambda_function" {
  function_name = local.authorizer_lambda_function_name

  s3_bucket = var.s3_deployment_bucket
  s3_key    = aws_s3_object.authorizer_function_s3.key

  runtime = "nodejs16.x"
  handler = "index.handler"

  timeout = 60

  source_code_hash = data.archive_file.authorizer_function_zip.output_base64sha256

  role = aws_iam_role.authorizer_function_lambda_execution_role.arn

  environment {
    variables = {
      TelegramBotToken = var.secrets_manager_id,
    }
  }
}

#Attach the created policy to the created role.
resource "aws_iam_role_policy_attachment" "authorizer_lambda_execution_role_Policy_secrets" {
  role       = aws_iam_role.authorizer_function_lambda_execution_role.name
  policy_arn = aws_iam_policy.aws_lambda_secrets_policy.arn
}
