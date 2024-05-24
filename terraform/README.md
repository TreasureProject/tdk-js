# TerraGrunt Infrastructure Project

This repository contains the TerraGrunt configuration for managing infrastructure resources across multiple environments.

## Prerequisites

- [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli) v1.8.3
- [TerraGrunt](https://terragrunt.gruntwork.io/docs/getting-started/install/) v0.51.3

### How to Install Terragrunt on Mac
```bash
brew install terragrunt
```

### How to install Terragrunt on Ubuntu
  * As a first step go to the official [release page](https://github.com/gruntwork-io/terragrunt/releases), scroll down to the Assets section and download the `terragrunt_linux_arm64`file.
    ```bash
    wget https://github.com/gruntwork-io/terragrunt/releases/download/v0.51.3/terragrunt_linux_amd64
    ```

  * Once the download is completed, navigate to the file directory and rename it to terragrunt.
    ```bash
    mv terragrunt_linux_amd64 terragrunt
    ```

  * Set executable permissions to the binary file.
    ```bash
    chmod u+x terragrunt
    ```

  * Move the Terragrunt file into the $PATH binary on your machine.
    ```bash
    sudo mv terragrunt /usr/local/bin/terragrunt
    ```

  * Now, try to execute Terragrunt commands on your machine.
    ```bash
    terragrunt --version
    ```

## Project Structure
```bash
.
└── terraform
    ├── environments
    │   ├── developments
    │   │   ├── aurora
    │   │   └── fargate
    │   └── production
    └── modules
        ├── ecs-fargate
        └── postgresql-aurora
```

## How to Use

### Initialize

To initialize the TerraGrunt configuration for a specific environment and resource:

```bash
cd environments/developments/aurora
terragrunt init
```
### Setup Prod MFA script and login to prod cli before continue

```bash
mfa login prod 60
```
### Setup AWS Profile for development account and save it as dev
```bash
aws configure --profile dev
```
### Plan
To see the execution plan for a specific environment and resource:

```bash
cd environments/developments/aurora
terragrunt plan
```

### Apply
To apply the changes for a specific environment and resource:

```bash
cd environments/developments/aurora
terragrunt apply
```

### Destroy
To destroy the resources for a specific environment and resource:

```bash
cd environments/developments/aurora
terragrunt destroy
```

### Running Commands Across Multiple Modules
TerraGrunt provides the run-all command to execute a Terraform command against multiple modules concurrently. This is useful when you have a set of Terraform configurations in subfolders and you want to apply or plan all of them.

#### Plan Across All Modules
To see the execution plan for all modules in a specific environment:

```bash
cd environments/developments
terragrunt run-all plan
```

This command will recursively run terragrunt plan in each subfolder of environment1.


Apply Across All Modules
To apply the changes for all modules in a specific environment:

```bash
cd environments/developments
terragrunt run-all apply
```

This command will recursively run terragrunt apply in each subfolder of environment1.

* Note: When using run-all, be cautious, as it affects multiple modules. It's always a good idea to first use run-all plan to verify the changes before applying them.

### Debug mode to identify issues

```bash
cd environments/developments/fargate
terragrunt plan --terragrunt-log-level debug --terragrunt-debug
```

### apply terragrunt & terraform formatting to hcl files

```bash
cd environments/developments
terragrunt hclfmt --recursive .
terraform fmt --recursive .
```
