# Set common variables for the environment. This is automatically pulled in in the root terragrunt.hcl configuration to
# feed forward to the child modules.
locals {

  //////////////////
  //// Shared
  //////////////////

  environment        = "production"
  project_name       = "identity"
  region             = "us-east-1"
  vpc_id             = "vpc-0fc38067c89106d19"
  vpc_cidr           = "10.1.0.0/16"
  private_subnet_ids = ["subnet-0188da42ca87de29f", "subnet-0067bd76934a5a123", "subnet-085eaa7aa58476f7d", "subnet-0b9e4cad47b46a298"]
  public_subnet_ids  = ["subnet-0e6b30abd06c12017", "subnet-0c98f159030773c7e", "subnet-0ac2b8a4a1d8b58b3", "subnet-0da03025f0d5221d5", ]

  //////////////////
  //// Aurora
  //////////////////

  identifier     = "${local.environment}-${local.project_name}"
  engine_version = "16.2"
  database_name  = "identitydb" //DatabaseName `identity` cannot be used.  It is a reserved word for this engine. 
  instances = {
    1 = {
      instance_class          = "db.r7g.xlarge"
      publicly_accessible     = false
      db_parameter_group_name = "default.aurora-postgresql16"
    }
  }

  //////////////////
  //// ECS
  //////////////////

  ecs_prefix               = "${local.environment}-${local.project_name}"
  ssl_certificate_arn      = "arn:aws:acm:us-east-1:884078395586:certificate/62f6f766-c92e-4792-a26c-2edfff49194e"
  cloudflare_zone_id       = "43c53e4c8555e49c1a70efd4c949fb02" #treasure.lol
  cloudflare_proxy_enabled = true
  desired_count            = 3
  autoscaling_min_capacity = 3
  autoscaling_max_capacity = 9
  fargate_cpu              = "2048"
  fargate_memory           = "4096"
  task_cpu                 = "2048"
  task_memory              = "4096"
  dns_name                 = "tdk-api1"
  fargate_capacity_providers = {
    FARGATE = {
      default_capacity_provider_strategy = {
        weight = 100
        base   = 3
      }
    }
  }
  //////////////////
  //// Github OIDC
  //////////////////

  iam_role_prefix = "${local.environment}-${local.project_name}"
  github_project  = "TreasureProject/tdk-js" # gitHubOrg/gitHubRepo
}
