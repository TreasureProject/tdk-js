# Include the root `terragrunt.hcl` configuration. The root configuration contains settings that are common across all
# components and environments, such as how to configure remote state.
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../modules/ecs-fargate"
}

locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
}

inputs = {
  vpc_id                   = local.environment_vars.locals.vpc_id
  public_subnets           = local.environment_vars.locals.public_subnet_ids
  private_subnets          = local.environment_vars.locals.private_subnet_ids
  ecs_prefix               = local.environment_vars.locals.ecs_prefix
  region                   = local.environment_vars.locals.region
  aurora_secret_name       = dependency.aurora.outputs.aurora_secret_name
  ssl_certificate_arn      = local.environment_vars.locals.ssl_certificate_arn
  cloudflare_zone_id       = local.environment_vars.locals.cloudflare_zone_id
  desired_count            = local.environment_vars.locals.desired_count
  autoscaling_min_capacity = local.environment_vars.locals.autoscaling_min_capacity
  autoscaling_max_capacity = local.environment_vars.locals.autoscaling_max_capacity
  dns_name                 = local.environment_vars.locals.dns_name
  cloudflare_proxy_enabled = local.environment_vars.locals.cloudflare_proxy_enabled
  fargate_cpu              = local.environment_vars.locals.fargate_cpu
  fargate_memory           = local.environment_vars.locals.fargate_memory
  task_cpu                 = local.environment_vars.locals.task_cpu
  task_memory              = local.environment_vars.locals.task_memory

}

dependency "aurora" {
  config_path = "../aurora"
  mock_outputs = {
    aurora_secret_name = "${local.environment_vars.locals.identifier}-db"
  }
}