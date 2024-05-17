output "ecr_repo" {
  value = aws_ecr_repository.identity.repository_url
}

output "ecs_service" {
  value = local.service_name
}

output "ecs_cluster" {
  value = local.cluster_name
}