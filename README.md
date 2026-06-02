# Groq Kubernetes Lab

A tiny, real-world project for learning Kubernetes with Groq AI. It includes two services:

- Frontend: Next.js app with a proxy API route
- API: Express service that calls Groq Chat Completions

## Environment

Set these environment variables before running:

- GROQ_API_KEY (required)
- GROQ_MODEL (optional, default is llama-3.3-70b-versatile)

## Run with Docker Compose

1. Set your Groq API key in the shell you use for Docker.
2. From the repo root, run:

```
docker compose up --build
```

3. Open the UI at localhost:3000.

## Run on Kubernetes (Kind)

1. Build the images:

```
docker build -t groq-api:latest ./api
docker build -t groq-frontend:latest ./frontend
```

2. Load images into Kind:

```
kind load docker-image groq-api:latest
kind load docker-image groq-frontend:latest
```

3. Update the Groq API key in k8s/secret.yaml (replace the placeholder).

4. Apply the manifests:

```
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/api-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

5. Port-forward the frontend service:

```
kubectl -n groq-demo port-forward svc/frontend 3000:3000
```

6. Open the UI at localhost:3000.

## Useful checks

```
kubectl -n groq-demo get pods
kubectl -n groq-demo get svc
kubectl -n groq-demo logs deploy/api
```
