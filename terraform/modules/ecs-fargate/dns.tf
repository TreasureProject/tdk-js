data "aws_secretsmanager_secret" "cloudflare" {
  name = var.cloudflare_secret_name # As stored in the AWS Secrets Manager
}
data "aws_secretsmanager_secret_version" "cloudflare" {
  secret_id = data.aws_secretsmanager_secret.cloudflare.id
}

provider "cloudflare" {
  api_token = data.aws_secretsmanager_secret_version.cloudflare.secret_string
}

resource "cloudflare_record" "identity" {
  zone_id = var.cloudflare_zone_id
  name    = var.dns_name        #"dns_name.treasure.lol"
  value   = module.alb.dns_name # alb dns address
  type    = "CNAME"
  ttl     = 300
  proxied = false
}
