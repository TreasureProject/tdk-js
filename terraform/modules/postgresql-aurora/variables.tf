variable "identifier" {
  type        = string
  description = "The RDS Cluster Identifier"
}

variable "engine_version" {
  type        = string
  description = "The database engine version. Updating this argument results in an outage"
}

variable "vpc_id" {
  type        = string
  description = "vpc id"
}
variable "vpc_cidr" {
  type        = string
  description = "vpc cidr"
}

variable "instances" {
  type = map(any)
  default = {
    1 = {
      instance_class          = "db.r7g.large"
      publicly_accessible     = false
      db_parameter_group_name = "default.aurora-postgresql16"
    }
  }
}
variable "database_name" {
  type        = string
  description = "Name for an automatically created database on cluster creation	"
  default     = "postgres"
}

variable "storage_encrypted" {
  type        = bool
  default     = true
  description = "Specifies whether the DB cluster is encrypted. "
}

variable "storage_type" {
  type        = string
  default     = "aurora-iopt1"
  description = "Determines the storage type for the DB cluster. Optional for Single-AZ, required for Multi-AZ DB clusters. Valid values for Single-AZ: aurora,  (default, both refer to Aurora Standard), aurora-iopt1 (Aurora I/O Optimized). Valid values for Multi-AZ: io1 (default)"
}
variable "performance_insights_enabled" {
  type        = bool
  default     = true
  description = "Specifies whether Performance Insights is enabled or not"
}
variable "db_parameter_group_family" {
  type        = string
  default     = "aurora-postgresql16"
  description = "The family of the DB parameter group"
}

variable "subnet_ids" {
  type        = list(string)
  description = "List of subnet IDs used by database subnet group created	"
}

variable "apply_immediately" {
  type        = bool
  default     = true
  description = "Specifies whether any cluster modifications are applied immediately, or during the next maintenance window."
}


variable "create_security_group" {
  type        = bool
  default     = false
  description = "Determines whether to create the database subnet group or use existing"
}

variable "create_db_parameter_group" {
  type        = bool
  default     = true
  description = "Determines whether a DB parameter should be created or use existing"
}

variable "create_db_subnet_group" {
  type        = bool
  default     = true
  description = "Determines whether to create the database subnet group or use existing"
}

variable "manage_master_user_password" {
  type        = bool
  default     = false
  description = "Set to true to allow RDS to manage the master user password in Secrets Manager. Cannot be set if master_password is provided"
}

variable "skip_final_snapshot" {
  type        = bool
  default     = true
  description = "Determines whether a final snapshot is created before the cluster is deleted. If true is specified, no snapshot is created"
}
variable "master_username" {
  type        = string
  default     = "postgres"
  description = "Username for the master DB user. Required unless snapshot_identifier or replication_source_identifier is provided or unless a global_cluster_identifier is provided when the cluster is the secondary cluster of a global database"
}

variable "create_monitoring_role" {
  type        = bool
  default     = true
  description = "Determines whether to create the IAM role for RDS enhanced monitoring	"
}

variable "monitoring_interval" {
  type        = number
  default     = 60
  description = "The interval, in seconds, between points when Enhanced Monitoring metrics are collected for instances. Set to 0 to disable."
}

