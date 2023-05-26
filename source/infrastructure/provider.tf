terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.6"
    }
  }

  required_version = ">= 0.14.9"
}

provider "aws" {
  alias   = "test"
  profile = "test"
  region  = "eu-west-1"
}
provider "aws" {
  alias   = "dev"
  profile = "dev"
  region  = "eu-central-1"
}

provider "aws" {
  alias   = "prod"
  profile = "prod"
  region  = "eu-central-1"
}



