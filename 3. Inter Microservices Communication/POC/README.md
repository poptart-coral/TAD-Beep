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
    kubectl apply -f kube/
    ```

2.  **Install Linkerd:** If you don't have Linkerd installed, follow the official Linkerd documentation to install it on your Kubernetes cluster.  A basic install looks like this:

    ```bash
    curl -sL https://run.linkerd.io/install | sh
    export PATH=$PATH:$HOME/.linkerd2/bin
    linkerd check --pre
    linkerd install | kubectl apply -f -
    linkerd check
    ```

3.  **Inject Linkerd proxy:** Make sure your namespaces and deployments are injected with the Linkerd proxy.  You can inject a namespace with:

    ```bash
    kubectl get namespace default -o yaml | linkerd inject - | kubectl apply -f -
    ```

    Or inject individual deployments:

    ```bash
    kubectl get deployment your-deployment-name -n your-namespace -o yaml | linkerd inject - | kubectl apply -f -
    ```

4.  **(Optional) Access the application:** If you're using Traefik Ingress, configure your DNS or `/etc/hosts` file to point to the Traefik Ingress IP address. Then, access the application via the configured URL.  If you're using a LoadBalancer service instead, get the external IP and access the application via that IP.

## Configuration

The `config.js` file is injected via a `ConfigMap` to allow dynamic configuration of the frontend, such as the API URL.  Modify the `kube/configmap.yaml` file to change the API URL.

## Notes

*   This is a basic POC and may need further adjustments for production environments.
*   Ensure that your Kubernetes cluster has sufficient resources to run the microservices.
*   Check the Linkerd dashboard for observability and metrics.