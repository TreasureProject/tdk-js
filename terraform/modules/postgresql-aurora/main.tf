
################################################################################
# RDS Aurora Module
################################################################################
locals {
  name           = "${var.identifier}-db"
  db_secret_name = "${var.identifier}-db"
  tags = {
    Terraform = "True"
    Database  = local.name
  }
}

resource "random_password" "master_password" {
  length           = 25
  special          = true
  override_special = "!#$_"
}

module "aurora" {
  depends_on                     = [random_password.master_password]
  source                         = "terraform-aws-modules/rds-aurora/aws"
  version                        = "v9.3.1"
  name                           = local.name
  vpc_id                         = var.vpc_id
  subnets                        = var.subnet_ids
  engine                         = "aurora-postgresql"
  engine_version                 = var.engine_version
  master_username                = var.master_username
  master_password                = random_password.master_password.result
  storage_type                   = var.storage_type
  instances                      = var.instances
  storage_encrypted              = var.storage_encrypted
  performance_insights_enabled   = var.performance_insights_enabled
  database_name                  = var.database_name
  apply_immediately              = var.apply_immediately
  skip_final_snapshot            = var.skip_final_snapshot
  create_security_group          = var.create_security_group
  create_db_parameter_group      = var.create_db_parameter_group
  create_db_subnet_group         = var.create_db_subnet_group
  manage_master_user_password    = var.manage_master_user_password
  db_subnet_group_name           = local.name
  db_parameter_group_name        = local.name
  db_parameter_group_family      = var.db_parameter_group_family
  db_parameter_group_description = "${local.name} DB parameter group"
  vpc_security_group_ids         = [aws_security_group.aurora_instance_security_group.id]
  create_monitoring_role         = var.create_monitoring_role
  monitoring_interval            = var.monitoring_interval
  tags                           = local.tags
}
