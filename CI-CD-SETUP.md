# CI/CD 设置说明

本项目使用 GitHub Actions 实现自动化部署到 Kubernetes 集群。

## 架构概述

CI/CD 流程采用 GitOps 模式：

1. **应用仓库**（当前仓库）：存放应用代码
2. **配置仓库**：存放 Kubernetes 部署配置（如 `txuw/k3s-apps-config`）
3. **镜像仓库**：阿里云容器镜像服务（ACR）

## 工作流程

1. 开发者推送代码到 `main` 分支
2. GitHub Actions 自动触发：
   - 安装依赖并构建 TypeScript 代码
   - 运行测试（如果有）
   - 构建 Docker 镜像
   - 推送镜像到阿里云 ACR
   - 更新配置仓库中的部署文件，修改镜像标签
3. ArgoCD/Flux（或其他 GitOps 工具）检测到配置仓库变更
4. 自动将新版本部署到 Kubernetes 集群

## 配置步骤

### 1. 在 GitHub 仓库中设置 Secrets

进入 `Settings` → `Secrets and variables` → `Actions`，添加以下 secrets：

- **ACR_USERNAME**: 阿里云容器镜像服务的用户名
- **ACR_PASSWORD**: 阿里云容器镜像服务的密码
- **GIT_PAT**: GitHub Personal Access Token（需要对配置仓库有写权限）

#### 创建 GitHub PAT

1. 访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 选择权限：
   - `repo` (完整仓库访问权限)
4. 生成并复制 token，保存为 `GIT_PAT` secret

### 2. 创建配置仓库

在 GitHub 创建一个新仓库（例如 `txuw/k3s-apps-config`），用于存放 Kubernetes 部署配置。

将 `screep-export-deployment.yaml` 文件复制到该仓库。

### 3. 修改工作流配置

编辑 `.github/workflows/ci.yaml`，根据实际情况修改以下环境变量：

```yaml
env:
  APP_NAME: screep-export          # 应用名称
  APP_NAMESPACE_NAME: app          # Kubernetes 命名空间
  ACR_DOMAIN: registry.cn-hangzhou.aliyuncs.com  # ACR 域名
  ACR_ZONE: txuw                   # ACR 命名空间
  DEPLOY_REPO: txuw/k3s-apps-config # 配置仓库路径
```

### 4. 创建 Kubernetes Secret（可选）

如果应用需要数据库连接等敏感信息，在集群中创建 Secret：

```bash
kubectl create secret generic screep-export-secrets \
  --namespace=app \
  --from-literal=mongodb-uri='mongodb://username:password@host:27017/database'
```

### 5. 设置 GitOps 工具

#### 使用 ArgoCD

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: screep-export
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/txuw/k3s-apps-config.git
    targetRevision: HEAD
    path: .
  destination:
    server: https://kubernetes.default.svc
    namespace: app
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

#### 使用 Flux CD

```bash
flux create source git k8s-apps-config \
  --url=https://github.com/txuw/k3s-apps-config \
  --branch=main \
  --interval=1m

flux create kustomization screep-export \
  --source=k8s-apps-config \
  --path="./" \
  --prune=true \
  --interval=5m
```

## 本地测试

### 构建 Docker 镜像

```bash
docker build -t screep-export:local .
```

### 运行容器

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://localhost:27017/screep \
  screep-export:local
```

### 编译 TypeScript

```bash
npm run build
npm start
```

## 故障排查

### 构建失败

- 检查 TypeScript 编译错误：`npm run build`
- 检查依赖是否正确安装：`npm ci`

### 镜像推送失败

- 验证 ACR 凭据是否正确
- 检查 ACR 命名空间和仓库是否存在

### 部署文件更新失败

- 验证 GIT_PAT 权限是否正确
- 检查配置仓库路径是否正确
- 确认部署文件名称匹配（`screep-export-deployment.yaml`）

### Pod 启动失败

```bash
# 查看 Pod 状态
kubectl get pods -n app

# 查看 Pod 日志
kubectl logs -n app -l app=screep-export

# 查看 Pod 详情
kubectl describe pod -n app <pod-name>
```

## 文件说明

- **`.github/workflows/ci.yaml`**: GitHub Actions 工作流配置
- **`Dockerfile`**: Docker 镜像构建文件
- **`.dockerignore`**: Docker 构建忽略文件
- **`screep-export-deployment.yaml`**: Kubernetes 部署配置（应放在配置仓库中）

## 最佳实践

1. **分支保护**：在 GitHub 中为 `main` 分支启用保护规则
2. **代码审查**：要求 Pull Request 审批后才能合并
3. **环境隔离**：为开发、测试、生产环境创建不同的工作流
4. **监控告警**：配置 Prometheus + Grafana 监控应用运行状态
5. **日志收集**：使用 ELK/Loki 收集和分析日志

## 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [阿里云容器镜像服务](https://www.aliyun.com/product/acr)
- [ArgoCD 文档](https://argo-cd.readthedocs.io/)
- [Kubernetes 文档](https://kubernetes.io/docs/)

