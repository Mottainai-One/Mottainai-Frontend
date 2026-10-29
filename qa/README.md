# Frontend QA preview

The image builds the React app and serves it through Nginx, including fallback to `index.html` for client routes. The existing CI still checks the source build and lint separately.

This is a UI preview only. Authentication in `src/services/authService.ts` currently uses a hardcoded mock account and a fake JWT. Do not expose this frontend publicly or present it as an integrated login test. The shared QA Compose stack binds it to localhost until the frontend team connects the real API authentication flow.

```bash
docker build --tag mottainai-frontend:qa .
docker run --rm -p 127.0.0.1:18081:8080 mottainai-frontend:qa
```

Check `http://localhost:18081/healthz` and then the page at `http://localhost:18081`.
