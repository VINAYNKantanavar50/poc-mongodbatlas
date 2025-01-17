resource "mongodbatlas_project" "project" {
  name   = var.project_name
  org_id = var.org_id
}
resource "mongodbatlas_advanced_cluster" "cluster" {
  project_id     = mongodbatlas_project.project.id
  name           = var.db_name
  cluster_type   = "REPLICASET"
  backup_enabled = false

  replication_specs {
    region_configs {
      priority      = 7
       provider_name               = "TENANT"
       backing_provider_name       = var.cloud_provider
      region_name   = var.region
      electable_specs {
        instance_size = "M0"
    
      }
    }
  }
}
