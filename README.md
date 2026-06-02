# Groq Kubernetes Lab

A compact, real-world learning project for Kubernetes + Groq AI. It is built to practice image builds, local dev, secrets management, and cluster workflows.

✨ Services
- Frontend: Next.js app with a server route that proxies to the API
- API: Express service that calls Groq Chat Completions

============================================================
REQUEST FLOW (LIVE)
============================================================
Browser UI
	|
	v
Next.js /api/chat
	|
	v
Express API (/chat)
	|
	v
Groq Chat Completions
	|
	v
Reply back to UI

============================================================
FOLDER MAP
============================================================
frontend/
  app/               -> UI + API route
  Dockerfile         -> Frontend container build
  .env.example       -> Frontend env reference

api/
  src/               -> Express API server
  Dockerfile         -> API container build
  .env.example       -> API env reference (do not commit real secrets)
  .env               -> Your local secrets (gitignored)

k8s/
  namespace.yaml     -> Namespace for isolation
  configmap.yaml     -> Non-secret config
  secret.yaml        -> Template only (no real secrets)
  api-deployment.yaml
  api-service.yaml
  frontend-deployment.yaml
  frontend-service.yaml

docker-compose.yml   -> Local dev (reads api/.env)

============================================================
REQUIRED CONFIG
============================================================
Local (api/.env):
- GROQ_API_KEY (required)
- GROQ_MODEL (optional, default llama-3.3-70b-versatile)
- GROQ_MAX_TOKENS (optional)
- GROQ_TIMEOUT_MS (optional)
- GROQ_MAX_INPUT_CHARS (optional)

Kubernetes:
- Secret: GROQ_API_KEY
- ConfigMap: GROQ_MODEL, API_BASE_URL

============================================================
LOCAL WORKFLOW (DOCKER COMPOSE)
============================================================
1) Create api/.env
	GROQ_API_KEY=your_key_here
	GROQ_MODEL=llama-3.3-70b-versatile

2) Build + run
	docker compose up --build

3) Open the UI
	http://localhost:3000

============================================================
KUBERNETES WORKFLOW (KIND)
============================================================
1) Build images
	docker build -t groq-api:latest ./api
	docker build -t groq-frontend:latest ./frontend

2) Load into Kind
	kind load docker-image groq-api:latest
	kind load docker-image groq-frontend:latest

3) Create secret from api/.env (recommended)
	kubectl -n groq-demo delete secret groq-secrets
	kubectl -n groq-demo create secret generic groq-secrets --from-env-file=api/.env

4) Apply manifests
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/configmap.yaml
	kubectl apply -f k8s/secret.yaml
	kubectl apply -f k8s/api-deployment.yaml
	kubectl apply -f k8s/api-service.yaml
	kubectl apply -f k8s/frontend-deployment.yaml
	kubectl apply -f k8s/frontend-service.yaml

5) Port-forward
	kubectl -n groq-demo port-forward svc/frontend 3000:3000

6) Open the UI
	http://localhost:3000

============================================================
SECURITY / SECRETS
============================================================
- Do not commit api/.env
- Keep k8s/secret.yaml as a template only
- Use kubectl create secret from api/.env for real keys

============================================================
TROUBLESHOOTING
============================================================
Pods not ready:
  kubectl -n groq-demo get pods
  kubectl -n groq-demo describe pod <pod-name>

API errors:
  kubectl -n groq-demo logs deploy/api

Frontend not reachable:
  kubectl -n groq-demo get svc

============================================================
REFERENCES
============================================================
- Groq API: https://console.groq.com
- Kubernetes Docs: https://kubernetes.io/docs
- Kind Docs: https://kind.sigs.k8s.io
