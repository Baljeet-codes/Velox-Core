packer {
  required_plugins {
    amazon = {
      version = ">= 1.3.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

locals {
  timestamp = formatdate("YYYYMMDDhhmmss", timestamp())
}

source "amazon-ebs" "velox-core" {
  region        = var.region
  source_ami_filter {
    filters = {
      name                = "al2023-ami-*-kernel-6.1-x86_64"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["amazon"]
  }
  instance_type = var.instance_type
  ssh_username  = "ec2-user"

  ami_name      = "velox-core-backend-${local.timestamp}"
  ami_regions   = [var.region]

  tags = {
    Name    = "velox-core-backend"
    Project = "velox-core"
  }
}

build {
  sources = ["source.amazon-ebs.velox-core"]

  provisioner "shell" {
    inline = [
      "sudo dnf update -y",
      "sudo dnf install -y python3.12 python3.12-pip gcc libpq-devel",
    ]
  }

  provisioner "file" {
    source      = "${path.cwd}/../requirements.txt"
    destination = "/tmp/requirements.txt"
  }

  provisioner "file" {
    source      = "${path.cwd}/../app"
    destination = "/tmp/app"
  }

  provisioner "file" {
    source      = "${path.cwd}/../alembic.ini"
    destination = "/tmp/alembic.ini"
  }

  provisioner "file" {
    source      = "${path.cwd}/../alembic"
    destination = "/tmp/alembic"
  }

  provisioner "file" {
    source      = "${path.cwd}/../static"
    destination = "/tmp/static"
  }

  provisioner "shell" {
    inline = [
      "sudo pip3.12 install -r /tmp/requirements.txt",
      "sudo mkdir -p /opt/velox-core",
      "sudo cp -r /tmp/app /opt/velox-core/app",
      "sudo cp -r /tmp/static /opt/velox-core/static",
      "sudo cp /tmp/requirements.txt /opt/velox-core/",
      "sudo cp /tmp/alembic.ini /opt/velox-core/",
      "sudo cp -r /tmp/alembic /opt/velox-core/alembic",
      "sudo rm -rf /tmp/app /tmp/static /tmp/requirements.txt /tmp/alembic.ini /tmp/alembic",
    ]
  }

  provisioner "shell" {
    inline = [
      "sudo tee /etc/systemd/system/velox-core.service > /dev/null << 'EOF'",
      "[Unit]",
      "Description=Velox-Core FastAPI Backend",
      "After=network-online.target",
      "Wants=network-online.target",
      "",
      "[Service]",
      "Type=simple",
      "User=ec2-user",
      "Group=ec2-user",
      "WorkingDirectory=/opt/velox-core",
      "EnvironmentFile=/opt/velox-core/.env",
      "ExecStart=/usr/bin/python3.12 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4",
      "Restart=always",
      "RestartSec=5",
      "",
      "[Install]",
      "WantedBy=multi-user.target",
      "EOF",
      "sudo systemctl enable velox-core",
    ]
  }

  provisioner "shell" {
    inline = [
      "sudo dnf clean all",
      "sudo truncate -s 0 /var/log/*.log || true",
    ]
  }
}
