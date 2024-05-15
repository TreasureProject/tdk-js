resource "aws_ecr_repository" "identity" {
  name = var.ecs_prefix
}

# get authorization credentials to push to ecr
data "aws_ecr_authorization_token" "token" {}

# configure docker provider
# provider "docker" {
#   registry_auth {
#       address = data.aws_ecr_authorization_token.token.proxy_endpoint
#       username = data.aws_ecr_authorization_token.token.user_name
#       password  = data.aws_ecr_authorization_token.token.password
#     }
# }

# build docker image
# resource "docker_image" "my-docker-image" {
#   name = "${data.aws_ecr_authorization_token.token.proxy_endpoint}/var.ecs_prefix:init"
#   build {
#     context = "${path.module}/../../../apps/api/Dockerfile"
#   }
#   platform = "linux/arm64"
# }


# resource "null_resource" "docker_image" {
#   triggers = {
#     image_hash = filemd5("${path.module}/../../apps/api/Dockerfile")
#   }

#   provisioner "local-exec" {
#     command = <<-EOT
#       docker build -t ${aws_ecr_repository.identity.repository_url}:latest .
#       aws ecr get-login-password --region ${var.region} | docker login --username AWS --password-stdin ${aws_ecr_repository.identity.repository_url}
#       docker push ${aws_ecr_repository.identity.repository_url}:latest
#     EOT
#   }

#   depends_on = [aws_ecr_repository.identity]
# }