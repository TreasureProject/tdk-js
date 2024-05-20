locals {
  # Automatically load account-level variables
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))

  aws_profile = local.account_vars.locals.aws_profile_name
  region      = local.account_vars.locals.aws_region
}

terraform {
  extra_arguments "aws_profile" {
    commands = [
      "init",
      "apply",
      "refresh",
      "import",
      "plan",
      "taint",
      "untaint"
    ]

    env_vars = {
      AWS_PROFILE = "${local.aws_profile}"
    }
  }
}

remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite"
  }
  config = {
    region         = "us-east-1"
    dynamodb_table = "treasure-terraform-locks"
    encrypt        = true
    profile        = "prod"
    bucket         = "treasure-terraform-states"
    key            = "environments/${path_relative_to_include()}/terraform.tfstate"
  }
}
generate "provider" {
  path      = "providers.tf"
  if_exists = "overwrite"
  contents  = <<EOF
    terraform {
        required_providers {
            aws = {
              source = "hashicorp/aws"
              version = "5.48.0"
            }
            cloudflare = {
              source  = "cloudflare/cloudflare"
              version = "4.32.0"
            }
            null = {
              source  = "hashicorp/null"
              version = "3.2.2"
            }
       }
    }
    provider "aws" {
      profile = "${local.aws_profile}"
      region = "${local.region}"
    }
    
EOF
}
