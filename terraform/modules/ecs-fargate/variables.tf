variable "ecs_prefix" {
  type        = string
  description = "Name of the cluster (up to 255 letters, numbers, hyphens, and underscores)"
}

variable "container_port" {
  type        = number
  default     = 8080
  description = "container port number"
}

variable "host_port" {
  type        = number
  default     = 8080
  description = "host port number"
}

variable "region" {
  type        = string
  description = "aws region"
}

variable "public_subnets" {
  type        = list(string)
  description = "public subnets for provisioning load balancer"
}

variable "private_subnets" {
  type        = list(string)
  description = "private subnets for provisioning fargate cluster"
}

variable "vpc_id" {
  type        = string
  description = "vpc id"
}
variable "aurora_secret_name" {
  type        = string
  description = "Secret Manager Secret of provisioned Aurora DB"
}

variable "ssl_certificate_arn" {
  type        = string
  description = "ssl certificate arn"
}

variable "cloudflare_zone_id" {
  type        = string
  description = "cloudflare dns zone id"
}

variable "cloudflare_secret_name" {
  type        = string
  default     = "cloudFlare/TreasureLolDns"
  description = "cloudflare secret with dns access"
}

variable "health_check_path" {
  type        = string
  default     = "/healthcheck"
  description = "healthcheck endpoint"
}

variable "fargate_cpu" {
  type        = string
  default     = "1024"
  description = "allocated cpu for fargate instance"
}

variable "fargate_memory" {
  type        = string
  default     = "4096"
  description = "allocated memory for fargate instance"
}

variable "task_cpu" {
  type        = string
  default     = "512"
  description = "allocated cpu for fargate task"
}

variable "task_memory" {
  type        = string
  default     = "2048"
  description = "allocated memory for fargate task"
}
variable "desired_count" {
  type        = number
  default     = 1
  description = "number of replicas"
}

variable "dns_name" {
  type        = string
  default     = "test-dev"
  description = "dns name to be created under *.treasure.lol"
}

variable "image_tag" {
  type        = string
  default     = "init"
  description = "image tag for ecs deployment, can be overriden from fargate caller"
}

variable "api_env_secret_name" {
  type        = string
  default     = "tdkApiEnv"
  description = "Api Secret name in secret manager"
}

variable "autoscaling_min_capacity" {
  type        = number
  default     = 1
  description = "auto scaling min"
}

variable "autoscaling_max_capacity" {
  type        = number
  default     = 1
  description = "auto scaling max"
}

variable "cloudflare_proxy_enabled" {
  type        = bool
  default     = false
  description = "enabled cloudflare proxy"
}

variable "dns_ttl" {
  type        = number
  default     = 1 # auto
  description = "dns record ttl"
}

variable "fargate_capacity_providers" {
  type = map(any)
  default = {
    FARGATE = {
      default_capacity_provider_strategy = {
        weight = 50
        base   = 20
      }
    }
    FARGATE_SPOT = {
      default_capacity_provider_strategy = {
        weight = 50
      }
    }
  }
}

variable "sentry_dsn" {
  type        = string
  description = "Sentry Data Source Name"
}

variable "sentry_environment" {
  type        = string
  description = "Sentry environment name"
}