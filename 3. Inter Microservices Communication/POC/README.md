# Microservices POC – Communication via Linkerd + Ingress

This project demonstrates a **Proof of Concept (POC) for microservices communication on Kubernetes** with the following elements:

- A **Yew (Rust/WASM) frontend** that displays a compliment of the day
- An **Axum (Rust) backend** that dynamically generates a compliment
- **Secure communication via Linkerd** (mTLS, observability)
- **Modular and dynamic access** thanks to `config.js` injected by `ConfigMap`
- A **Traefik Ingress** to access the application via a URL on a private or public IP

## Prerequisites

Before deploying this POC, ensure you have the following:

- **Kubernetes cluster:** A running Kubernetes cluster (e.g., Minikube, Kind, or a cloud-based Kubernetes service).
- **kubectl:**  The Kubernetes command-line tool (`kubectl`) installed and configured to connect to your cluster.
- **Linkerd CLI:** The Linkerd command-line interface (`linkerd`) installed.
- **wasm-pack:**  The `wasm-pack` tool for building the Yew frontend.
- **Rust toolchain:**  A Rust development environment with `cargo` for building the backend and frontend.
- **Traefik (optional):** If you intend to use Traefik Ingress, ensure it's installed on your cluster.
- **Basic understanding of Kubernetes concepts:** Familiarity with Deployments, Services, ConfigMaps, and Ingress.

## Deployment

1.  **Apply Kubernetes manifests:**

    ```bash
    kubectl create namespace compliments
    kubectl apply -f kube/
    ```

2.  **Install Linkerd:** Follow the official Linkerd documentation to install the service mesh on your Kubernetes cluster:

    ```bash
    # Install the CLI
    curl --proto '=https' --tlsv1.2 -sSfL https://run.linkerd.io/install | sh
    
    # Add linkerd to your path
    export PATH=$PATH:$HOME/.linkerd2/bin
    
    # Validate your Kubernetes cluster is ready for Linkerd
    linkerd check --pre
    
    # Install the control plane onto your cluster
    linkerd install | kubectl apply -f -
    
    # Install the viz extension for observability
    linkerd viz install | kubectl apply -f -
    
    # Verify everything worked correctly
    linkerd check
    ```

3.  **Add annotations for Linkerd injection:** You can mesh your services by adding the Linkerd proxy sidecar to each pod :

    ```bash
    # Annotate namespace for automatic injection (recommended)
    kubectl annotate ns compliments linkerd.io/inject=enabled
    
    # Restart deployments to apply the mesh to existing pods
    kubectl rollout restart deploy -n compliments
    ```

4.  **Verify mesh enablement:** Check if your pods are now part of the service mesh:

    ```bash
   linkerd viz stat ns/compliments

   linkerd viz stat deploy -n compliments
    # Check that your pods have the Linkerd proxy
    kubectl get pods -o jsonpath='{.items[*].metadata.name}' | xargs -n1 kubectl get pod -o yaml | grep linkerd.io/proxy-version
    
    # Verify the Linkerd proxy is running in all your pods
    kubectl get pods -o wide
    ```

5.  **(Optional) Access the application:** If you're using Traefik Ingress, configure your DNS or `/etc/hosts` file to point to the Traefik Ingress IP address. Then, access the application via the configured URL.  If you're using a LoadBalancer service instead, get the external IP and access the application via that IP.

## Configuration

The `config.js` file is injected via a `ConfigMap` to allow dynamic configuration of the frontend, such as the API URL.  Modify the `kube/configmap.yaml` file to change the API URL.

## Verifying Inter-Service Communication Without GUI

You can verify the communication between your microservices using Linkerd's CLI tools without needing the dashboard:

1. **Check service dependencies and traffic flow:**

   ```bash
   # View live traffic metrics between services
   linkerd viz stat deployments
   
   # Check specific service-to-service communication
   linkerd viz stat svc/frontend svc/backend
   
   # Get detailed traffic metrics for a deployment
   linkerd viz tap deploy/backend
   ```

2. **Analyze service health and performance:**

   ```bash
   # Check the overall health of your services
   linkerd viz check
   
   # Get detailed service performance metrics
   linkerd viz top deploy
   ```

3. **Trace requests through your service mesh:**

   ```bash
   # Watch live requests between services
   linkerd viz tap -n default deploy
   
   # Target specific deployment with output limiting
   linkerd viz tap deploy/frontend --to deploy/backend -o wide
   ```

4. **Generate test traffic to verify connections:**

   ```bash
   # Use kubectl to send requests through the mesh
   kubectl exec -it deploy/frontend -- curl -v http://backend:8080/compliment
   
   # Simple load testing with multiple requests
   for i in $(seq 1 10); do kubectl exec -it deploy/frontend -- curl http://backend:8080/compliment; done
   ```

5. **Verify mTLS encryption between services:**

   ```bash
   # Check which services have mTLS enabled
   linkerd viz edges deployment
   
   # Get detailed mTLS stats
   linkerd viz edges deployment -o wide
   ```

These commands allow you to thoroughly validate that your services are communicating properly through the Linkerd service mesh without requiring the graphical dashboard.

## Notes

*   This is a basic POC and may need further adjustments for production environments.
*   Ensure that your Kubernetes cluster has sufficient resources to run the microservices.
*   For more advanced debugging, you can use the Linkerd dashboard: `linkerd viz dashboard`
*   The Linkerd service mesh provides automatic mTLS encryption between services without any code changes.