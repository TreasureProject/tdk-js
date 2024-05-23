variable "prefix" {
  type        = string
  description = "prefix for iam role"
}

variable "github_project" {
  type        = string
  description = "githubOrg/GithubProject"
  default     = "TreasureProject/tdk-js"
}