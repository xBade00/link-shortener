output "api_ecr_url" {
  value = aws_ecr_repository.api.repository_url
}

output "web_ecr_url" {
  value = aws_ecr_repository.web.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}