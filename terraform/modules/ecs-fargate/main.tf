data "aws_caller_identity" "current" {}

locals {
  cluster_name          = "${var.ecs_prefix}-cluster"
  service_name          = "${var.ecs_prefix}-service"
  container_name        = var.ecs_prefix
  awslogs_stream_prefix = "ecs"
  dns_name              = var.ecs_prefix
  awslogs_stream        = "/aws/${local.awslogs_stream_prefix}/${local.cluster_name}"
  tags = {
    Terraform = "True"
    Cluster   = local.cluster_name
  }
  account_id = data.aws_caller_identity.current.account_id
  deep_blue  = "../../../../../../.."
}
################################################################################
# Cluster
################################################################################

module "ecs_cluster" {
  source                                = "terraform-aws-modules/ecs/aws//modules/cluster"
  version                               = "5.11.1"
  create_task_exec_iam_role             = true
  create_task_exec_policy               = true
  cluster_name                          = local.cluster_name
  default_capacity_provider_use_fargate = true
  # Capacity provider
  fargate_capacity_providers = var.fargate_capacity_providers

  tags = local.tags
}

################################################################################
# Service
################################################################################

module "ecs_service" {
  #depends_on = [module.ecs_cluster, null_resource.build_image]
  source = "terraform-aws-modules/ecs/aws//modules/service"

  name                  = local.service_name
  cluster_arn           = module.ecs_cluster.arn
  create_tasks_iam_role = true
  tasks_iam_role_policies = {
    SecretManager = aws_iam_policy.ssm.arn
  }
  cpu           = var.fargate_cpu
  memory        = var.fargate_memory
  desired_count = var.desired_count
  # Auto Scaling
  enable_autoscaling       = true
  autoscaling_min_capacity = var.autoscaling_min_capacity
  autoscaling_max_capacity = var.autoscaling_max_capacity
  # Enables ECS Exec
  enable_execute_command = true

  # Container definition(s)
  container_definitions = {

    (local.container_name) = {
      cpu       = var.task_cpu
      memory    = var.task_memory
      essential = true
      image     = "${aws_ecr_repository.identity.repository_url}:${var.image_tag}" # "665230337498.dkr.ecr.us-west-2.amazonaws.com/cdk-hnb659fds-container-assets-665230337498-us-west-2:3c5b506204d8ec6aeb576fc16e00b27b5e985482"
      port_mappings = [
        {
          name          = local.container_name
          containerPort = var.container_port
          hostPort      = var.host_port
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "AWS_REGION", value = var.region },
        { name = "DATABASE_SECRET_NAME", value = var.aurora_secret_name },
        { name = "API_ENV_SECRET_NAME", value = var.api_env_secret_name }
      ]

      readonly_root_filesystem  = true
      enable_cloudwatch_logging = true
      log_configuration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = local.awslogs_stream
          awslogs-region        = var.region
          awslogs-stream-prefix = "ecs"
        }
      }

      linux_parameters = {
        capabilities = {
          add = []
          drop = [
            "NET_RAW"
          ]
        }
      }

      memory_reservation = 100
    }
  }

  service_connect_configuration = {
    namespace = aws_service_discovery_http_namespace.this.arn
    service = {
      client_alias = {
        port     = var.container_port
        dns_name = local.container_name
      }
      port_name      = local.container_name
      discovery_name = local.container_name
    }
  }

  load_balancer = {
    service = {
      target_group_arn = module.alb.target_groups["ecs_target"].arn
      container_name   = local.container_name
      container_port   = var.container_port
    }
  }

  subnet_ids = var.private_subnets
  security_group_rules = {
    alb_ingress_3000 = {
      type                     = "ingress"
      from_port                = var.host_port
      to_port                  = var.host_port
      protocol                 = "tcp"
      description              = "Service port"
      source_security_group_id = module.alb.security_group_id
    }
    egress_all = {
      type        = "egress"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  service_tags = {
    "ServiceTag" = "Tag on service level"
  }

  tags = local.tags
}


################################################################################
# Supporting Resources
################################################################################

data "aws_iam_policy_document" "ssm" {
  statement {
    sid     = "1"
    actions = ["secretsmanager:GetSecretValue"]
    resources = [
      "arn:aws:secretsmanager:${var.region}:${local.account_id}:secret:tdkApiEnv-??????",
      "arn:aws:secretsmanager:${var.region}:${local.account_id}:secret:${var.aurora_secret_name}-??????"
    ]
    effect = "Allow"
  }
}
resource "aws_iam_policy" "ssm" {
  name   = "${local.cluster_name}-ecs-task-policy"
  path   = "/"
  policy = data.aws_iam_policy_document.ssm.json
}

resource "aws_service_discovery_http_namespace" "this" {
  name        = local.cluster_name
  description = "CloudMap namespace for ${local.cluster_name}"
  tags        = local.tags
}

################################################################################
# Application Load Balancer
################################################################################

module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 9.0"

  name = local.cluster_name

  load_balancer_type = "application"

  vpc_id  = var.vpc_id
  subnets = var.public_subnets

  enable_deletion_protection = false
  # Security Group
  security_group_ingress_rules = {
    all_http = {
      from_port   = 80
      to_port     = 80
      ip_protocol = "tcp"
      cidr_ipv4   = "0.0.0.0/0"
    },
    all_https = {
      from_port   = 443
      to_port     = 443
      ip_protocol = "tcp"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }
  security_group_egress_rules = {
    all = {
      ip_protocol = "-1"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }

  listeners = {
    http-https-redirect = {
      port     = 80
      protocol = "HTTP"
      redirect = {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
    https = {
      port            = 443
      protocol        = "HTTPS"
      certificate_arn = var.ssl_certificate_arn
      forward = {
        target_group_key = "ecs_target"
      }
    }
  }

  target_groups = {
    ecs_target = {
      backend_protocol                  = "HTTP"
      backend_port                      = var.host_port
      target_type                       = "ip"
      deregistration_delay              = 5
      load_balancing_cross_zone_enabled = true

      health_check = {
        enabled             = true
        healthy_threshold   = 5
        interval            = 30
        matcher             = "200"
        path                = var.health_check_path
        port                = "traffic-port"
        protocol            = "HTTP"
        timeout             = 5
        unhealthy_threshold = 2
      }
      create_attachment = false
    }
  }

  tags = local.tags
}
