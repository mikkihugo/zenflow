#!/bin/bash
# EKS Node Userdata Script
# Configures EC2 instances to join the EKS cluster

set -o xtrace

# Update and install required packages
yum update -y
yum install -y amazon-ssm-agent

# Configure containerd for EKS
cat <<EOF > /etc/containerd/config.toml
version = 2
root = "/var/lib/containerd"
state = "/run/containerd"

[grpc]
  address = "/run/containerd/containerd.sock"

[plugins."io.containerd.grpc.v1.cri"]
  sandbox_image = "602401143452.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/eks/pause:3.5"

[plugins."io.containerd.grpc.v1.cri".containerd]
  discard_unpacked_layers = true

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
  runtime_type = "io.containerd.runc.v2"

[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
  SystemdCgroup = true

[plugins."io.containerd.grpc.v1.cri".cni]
  bin_dir = "/opt/cni/bin"
  conf_dir = "/etc/cni/net.d"
EOF

# Restart containerd
systemctl restart containerd

# Configure kubelet
cat <<EOF > /etc/kubernetes/kubelet/kubelet-config.json
{
  "kind": "KubeletConfiguration",
  "apiVersion": "kubelet.config.k8s.io/v1beta1",
  "address": "0.0.0.0",
  "authentication": {
    "anonymous": {
      "enabled": false
    },
    "webhook": {
      "cacheTTL": "2m0s",
      "enabled": true
    },
    "x509": {
      "clientCAFile": "/etc/kubernetes/pki/ca.crt"
    }
  },
  "authorization": {
    "mode": "Webhook",
    "webhook": {
      "cacheAuthorizedTTL": "5m0s",
      "cacheUnauthorizedTTL": "30s"
    }
  },
  "clusterDomain": "cluster.local",
  "clusterDNS": ["10.100.0.10"],
  "cpuManagerReconcilePeriod": "10s",
  "evictionPressureTransitionPeriod": "5m0s",
  "featureGates": {
    "RotateKubeletServerCertificate": true,
    "KubeletCredentialProviders": true
  },
  "fileCheckFrequency": "20s",
  "httpCheckFrequency": "20s",
  "imageMinimumGCAge": "2m0s",
  "imageGCHighThresholdPercent": 85,
  "imageGCLowThresholdPercent": 80,
  "kubeAPIBurst": 10,
  "kubeAPIQPS": 5,
  "makeIPTablesUtilChains": true,
  "maxOpenFiles": 1000000,
  "maxPods": 110,
  "nodeLeaseDurationSeconds": 40,
  "nodeStatusReportFrequency": "10s",
  "nodeStatusUpdateFrequency": "10s",
  "protectKernelDefaults": true,
  "readOnlyPort": 0,
  "registryBurst": 10,
  "registryPullQPS": 5,
  "resolvConf": "/etc/resolv.conf",
  "runtimeRequestTimeout": "2m0s",
  "serializeImagePulls": false,
  "serverTLSBootstrap": true,
  "streamingConnectionIdleTimeout": "4h0m0s",
  "syncFrequency": "1m0s",
  "tlsCipherSuites": [
    "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
    "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305",
    "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
    "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305",
    "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384"
  ],
  "tlsMinVersion": "VersionTLS12",
  "volumeStatsAggPeriod": "1m0s"
}
EOF

# Configure kubelet arguments
cat <<EOF > /etc/sysconfig/kubelet
KUBELET_EXTRA_ARGS="--node-labels=node.kubernetes.io/lifecycle=normal \
  --register-with-taints=node.kubernetes.io/lifecycle=normal:NoSchedule \
  --event-qps=0 \
  --cgroup-driver=systemd \
  --container-runtime=remote \
  --container-runtime-endpoint=unix:///run/containerd/containerd.sock"
EOF

# Bootstrap the node
/etc/eks/bootstrap.sh ${cluster_name} \
  --b64-cluster-ca ${cluster_ca} \
  --apiserver-endpoint ${cluster_endpoint} \
  --kubelet-extra-args "$KUBELET_EXTRA_ARGS" \
  --container-runtime ${container_runtime}

# Configure log rotation
cat <<EOF > /etc/logrotate.d/kubernetes
/var/log/pods/*/*.log {
    rotate 5
    daily
    compress
    missingok
    notifempty
    maxage 30
    sharedscripts
    postrotate
        /usr/bin/crictl ps -q | xargs -r /usr/bin/crictl logs --tail 0 -f
    endscript
}
EOF

# Set up monitoring agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch agent
cat <<EOF > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
{
  "metrics": {
    "namespace": "EKS/NodeMetrics",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_iowait",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "metrics_collection_interval": 60,
        "totalcpu": false
      },
      "disk": {
        "measurement": [
          "used_percent",
          "inodes_free"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "diskio": {
        "measurement": [
          "io_time",
          "write_bytes",
          "read_bytes",
          "writes",
          "reads"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "mem": {
        "measurement": [
          "mem_used_percent"
        ],
        "metrics_collection_interval": 60
      },
      "netstat": {
        "measurement": [
          "tcp_established",
          "tcp_time_wait"
        ],
        "metrics_collection_interval": 60
      },
      "swap": {
        "measurement": [
          "swap_used_percent"
        ],
        "metrics_collection_interval": 60
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/messages",
            "log_group_name": "/aws/eks/${cluster_name}/nodes",
            "log_stream_name": "{instance_id}/messages",
            "retention_in_days": 7
          },
          {
            "file_path": "/var/log/secure",
            "log_group_name": "/aws/eks/${cluster_name}/nodes",
            "log_stream_name": "{instance_id}/secure",
            "retention_in_days": 7
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a query -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s

# Security hardening
# Disable unused protocols
echo "install dccp /bin/false" >> /etc/modprobe.d/kubernetes.conf
echo "install sctp /bin/false" >> /etc/modprobe.d/kubernetes.conf
echo "install rds /bin/false" >> /etc/modprobe.d/kubernetes.conf
echo "install tipc /bin/false" >> /etc/modprobe.d/kubernetes.conf

# Set kernel parameters for kubernetes
cat <<EOF >> /etc/sysctl.d/99-kubernetes.conf
# Kubernetes settings
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1

# Security hardening
kernel.unprivileged_bpf_disabled = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# Performance tuning
net.core.somaxconn = 32768
net.ipv4.ip_local_port_range = 10240 65535
net.ipv4.tcp_tw_reuse = 1
net.core.netdev_max_backlog = 16384
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_slow_start_after_idle = 0
EOF

sysctl -p /etc/sysctl.d/99-kubernetes.conf

# Set up log cleanup cron job
cat <<EOF > /etc/cron.daily/cleanup-logs
#!/bin/bash
# Clean up old container logs
find /var/log/pods -name '*.log' -mtime +7 -delete
find /var/log/containers -name '*.log' -mtime +7 -delete
# Clean up old journal logs
journalctl --vacuum-time=7d
EOF

chmod +x /etc/cron.daily/cleanup-logs

# Signal completion
touch /tmp/userdata-complete