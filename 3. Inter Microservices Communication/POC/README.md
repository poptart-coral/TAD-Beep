# Beep Microservices POC with Linkerd and Traefik (with mTLS)

This README guides you through deploying a simple proof-of-concept (POC) web application composed of a Rust frontend (Yew) and backend (Axum) on a Kubernetes cluster powered by **K3s**, **Traefik**, and **Linkerd**, with **mTLS** enabled.

## Architecture Overview

- Frontend: Yew (Rust/wasm) served on port 80
- Backend: Axum (Rust), generates random compliments, on port 3000
- Service Mesh: Linkerd for secure mTLS communication
- Ingress: Traefik routes HTTP traffic to services and integrates with Linkerd

## Prerequisites

- A Linux machine (VM or server) with an IP address accessible from your local machine
- No Docker or Rust toolchain needed on the host – all builds are pre-baked into manifests

## 1. Prepare your VM

### Install K3s (Lightweight Kubernetes)
```bash
curl -sfL https://get.k3s.io | sh -s - --disable=traefik
```
> This disables the default Traefik installation from K3s, because we want to install it in another namespace so that the Linkerd annotation we will put is enabled (it is disabled by default in kube-system where Traefik is installed with K3s).

### Fix kubeconfig permissions
```bash
sudo chmod 644 /etc/rancher/k3s/k3s.yaml
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

### Install Helm
```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

## 2. Project Setup

### Clone or copy the manifests to your VM
On your local machine:
```bash
scp -r POC-communication/ user@<VM-IP>:~
```
Then SSH into your VM:
```bash
ssh user@<VM-IP>
cd /home/user/POC-communication/
```

### Create required namespaces
```bash
kubectl create ns compliments
kubectl create ns traefik
```

## 3. Deploy Traefik (Ingress Controller)

```bash
helm repo add traefik https://traefik.github.io/charts
helm repo update
helm install traefik traefik/traefik -n traefik
```

### Add Linkerd injection annotation
I chose to mesh the Traefik ingress controller by adding the linkerd.io/inject=ingress annotation to its namespace. While meshing ingress pods is not strictly required to route external traffic into the cluster, doing so enables end-to-end mutual TLS (mTLS) and application-level (L7) metrics as soon as the traffic enters the mesh.
```bash
kubectl annotate ns traefik linkerd.io/inject=ingress
kubectl rollout restart deployment traefik -n traefik
```
> By enabling ingress mode for Traefik, Linkerd can observe and secure the outbound traffic from the ingress to internal services, even if it can’t inspect encrypted inbound traffic (e.g. HTTPS). This provides improved observability and security for the entire request flow.

## 4. Install Linkerd

### Install CLI
```bash
curl -sL https://run.linkerd.io/install | sh
export PATH=$PATH:$HOME/.linkerd2/bin
linkerd version
```

### Check cluster readiness and install Linkerd
```bash
linkerd check --pre
linkerd install --crds | kubectl apply -f -
linkerd install | kubectl apply -f -
linkerd check
```

### Install observability (viz)
```bash
linkerd viz install | kubectl apply -f -
linkerd viz check
```

## 5. Deploy the App (Frontend + API)

```bash
kubectl apply -f kube/api-deployment.yml
kubectl apply -f kube/api-service.yml
kubectl apply -f kube/frontend-deployment.yml
kubectl apply -f kube/frontend-service.yml
kubectl apply -f kube/frontend-config.yml
```

### Enable Linkerd injection for `compliments` namespace
```bash
kubectl annotate ns compliments linkerd.io/inject=enabled
kubectl rollout restart deploy -n compliments
```

## 6. Ingress Routing for the App

### Update and apply `ingress.yml`
In `kube/ingress.yml`, replace `162.38.112.221` with your **VM’s IP address**:

```yaml
host: compliments.<YOUR-IP>.nip.io
```

Then:
```bash
kubectl apply -f kube/ingress.yml
```

This will:
- Route `/api` to the backend service
- Route `/` to the frontend
- Send mTLS traffic through Linkerd thanks to:
```yaml
annotations:
  ingress.kubernetes.io/custom-request-headers: l5d-dst-override:compliments-api.compliments.svc.cluster.local:3000
```

## 6. Ingress Routing for the Linkerd Dashboard

The Linkerd dashboard provides a web-based UI that helps visualize what’s happening inside your service mesh.
It gives you:

- Live traffic metrics between services (success rates, latencies, request volumes)

- A visual map of which services are talking to each other

- The status of meshed services and their health

- Access to per-route metrics, tap streams (live traffic inspection), and service profiles

### Update and apply 'ingress-linker.yml'
In `kube/ingress-linker.yml`, replace `162.38.112.221` with your **VM’s IP address**:

```yaml
host: linkerd-dashboard.<YOUR-IP>.nip.io
```

Then:
```bash
kubectl apply -f kube/ingress.yml
```

To prevent DNS-rebinding attacks, the dashboard rejects any request whose Host header is not localhost, 127.0.0.1 or the service name web.linkerd-viz.svc. So with Traefik, we have to modify it manually with an overlay (web-deployment-patch.yml).

Then:
```bash
kubectl patch deployment web -n linkerd-viz --patch-file ./web-deployment-patch.yml
```

This will:
- Route to requests to the linkerd dashboard
- Allows the dashboard to accpet them thanks to enforced-host option
- Open the dashboard without accessing as localhost

## 7. Test the Application

### Access from your local browser
```txt
http://compliments.<YOUR-IP>.nip.io
http://linkerd-dashboard.<YOUR-IP>.nip.io/
```
> Use [nip.io](https://nip.io) to resolve your public IP as a fake domain automatically

## 8. Verify mTLS and Service Mesh

### See if services are meshed
```bash
linkerd viz stat ns compliments
linkerd viz stat deploy -n compliments
```

### Check mTLS between services
```bash
linkerd viz edges deploy -n compliments
```

### Live request tapping
```bash
linkerd viz tap deploy/compliments-api -n compliments
linkerd viz tap deploy/front -n compliments
linkerd viz tap deploy/traefik -n traefik
```

You should see live requests flowing and mTLS secured (`SRC → DST` edges showing `√`).