resource "aws_ecr_repository" "identity" {
  name         = var.ecs_prefix
  force_delete = true
}

resource "null_resource" "build_image" {
  triggers = {
    image_hash = filemd5("${path.module}/${local.deep_blue}/apps/api/Dockerfile") # i know i know i know, will fix the path later
  }

  provisioner "local-exec" {
    command = <<-EOT
      aws ecr get-login-password --region ${var.region} | docker login --username AWS --password-stdin ${aws_ecr_repository.identity.repository_url}
      docker buildx build --push  --platform linux/arm64 --tag ${aws_ecr_repository.identity.repository_url}:init  -f ./${local.deep_blue}/apps/api/Dockerfile ./${local.deep_blue}
    EOT
  }

  depends_on = [aws_ecr_repository.identity]
}