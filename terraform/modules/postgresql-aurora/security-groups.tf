###############################
# Aurora Client Security Group
###############################
resource "aws_security_group" "aurora_client_security_group" {
  name        = "${local.name}-client-sg"
  description = "Security group for ${local.name} Aurora client"
  vpc_id      = var.vpc_id
  tags        = local.tags
}

resource "aws_vpc_security_group_egress_rule" "aurora_client_security_group_allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.aurora_client_security_group.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}

resource "aws_vpc_security_group_egress_rule" "aurora_client_security_group_allow_all_traffic_ipv6" {
  security_group_id = aws_security_group.aurora_client_security_group.id
  cidr_ipv6         = "::/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}

###############################
# Aurora DB Security Group
###############################

resource "aws_security_group" "aurora_instance_security_group" {
  name        = "${local.name}-sg"
  description = "Security group for ${local.name} Aurora Instance"
  vpc_id      = var.vpc_id
  tags        = local.tags
}

resource "aws_vpc_security_group_egress_rule" "aurora_instance_security_group_allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.aurora_instance_security_group.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}

resource "aws_vpc_security_group_egress_rule" "aurora_instance_security_group_allow_all_traffic_ipv6" {
  security_group_id = aws_security_group.aurora_instance_security_group.id
  cidr_ipv6         = "::/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}

resource "aws_vpc_security_group_ingress_rule" "allow_client" {
  security_group_id            = aws_security_group.aurora_instance_security_group.id
  referenced_security_group_id = aws_security_group.aurora_client_security_group.id
  from_port                    = 5432
  ip_protocol                  = "tcp"
  to_port                      = 5432
}
resource "aws_vpc_security_group_ingress_rule" "allow_vpc" {
  security_group_id = aws_security_group.aurora_instance_security_group.id
  cidr_ipv4         = var.vpc_cidr
  from_port         = 5432
  ip_protocol       = "tcp"
  to_port           = 5432
}

