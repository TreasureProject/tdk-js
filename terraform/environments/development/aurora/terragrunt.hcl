# Include the root `terragrunt.hcl` configuration. The root configuration contains settings that are common across all
# components and environments, such as how to configure remote state.
include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../modules/postgresql-aurora"
}

locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
}

inputs = {
  identifier     = local.environment_vars.locals.identifier
  engine_version = local.environment_vars.locals.engine_version
  vpc_id         = local.environment_vars.locals.vpc_id
  vpc_cidr       = local.environment_vars.locals.vpc_cidr
  subnet_ids     = local.environment_vars.locals.private_subnet_ids
  instances      = local.environment_vars.locals.instances
  database_name  = local.environment_vars.locals.database_name
}