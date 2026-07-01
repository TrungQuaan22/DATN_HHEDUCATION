# HH Education production deployment

This setup runs PostgreSQL, the AI service, backend, frontend and Caddy on one VPS. Only Caddy publishes ports. PostgreSQL and the AI service stay inside the Docker network.

## 1. Prepare the VPS and DNS

- Install Docker Engine with the Compose plugin.
- Point `app.domain.com` and `api.domain.com` A/AAAA records to the VPS.
- Allow inbound TCP 80/443 and UDP 443. Do not expose 5432, 4000 or 8000.
- Clone the repository and create the production environment file:

```sh
cp .env.production.example .env.production
chmod 600 .env.production
```

Replace every placeholder and generate independent random values for database, JWT and AI internal secrets. `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_MEDIA_HOSTNAME` are build-time frontend values, so rebuild the frontend image after changing them.

## 2. Create a dedicated R2 production bucket

Create a new bucket such as `hh-education-prod-media`, a production-only API token and preferably a custom public domain such as `media.domain.com`. Configure bucket CORS for the exact frontend origin, allowing the `GET`, `HEAD` and `PUT` methods and required upload headers. Put these production values in `.env.production`; do not reuse the development bucket or credentials.

## 3. Build, migrate and start

```sh
docker compose --env-file .env.production -f docker-compose.production.yml config
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production -f docker-compose.production.yml ps
```

The one-shot `migrate` service runs `prisma migrate deploy` after PostgreSQL is healthy. A migration failure prevents the AI service, backend, frontend and proxy from starting. The existing demo seed is never run.

Inspect failures with:

```sh
docker compose --env-file .env.production -f docker-compose.production.yml logs migrate backend ai-service frontend caddy
```

## 4. Create only the initial admin and teacher

Set the six `PRODUCTION_ADMIN_*` and `PRODUCTION_TEACHER_*` values. Passwords must have at least 12 characters. Run once:

```sh
docker compose --env-file .env.production -f docker-compose.production.yml --profile operations run --rm seed-production
```

The command is idempotent, but rerunning it resets those two passwords to the environment values. Remove both password values from `.env.production` after the first successful login. Create students, courses, lessons and assessments through the application to exercise the real administration flows.

## 5. Backup and restore

Create a PostgreSQL custom-format backup:

```sh
sh deployment/scripts/backup-postgres.sh
```

Copy backups off the VPS and schedule the command using cron. Test restore on a disposable deployment or a fresh database volume, never for the first time against production:

```sh
CONFIRM_RESTORE=yes sh deployment/scripts/restore-postgres.sh backups/hheducation-YYYYMMDDTHHMMSSZ.dump
```

The restore script uses `--clean --if-exists` and can replace existing objects.

## 6. Post-deployment verification

Verify `https://app.domain.com/api/health`, `https://api.domain.com/health` and container health in `docker compose ps`. Then test, in order: authentication; course/chapter/lesson creation; image, video, PDF and transcript upload; HLS and AI material readiness; AI Tutor citations; assessment submission and auto-submit; essay grading and notifications; order/VietQR and SePay test webhook; enrollment and learning progress.

Create the clean demo dataset through the UI: one admin, one teacher, three students, one complete course with two chapters and four to six lessons, one mixed quiz/essay assessment, the three required submission states, one test payment and a few notifications. Re-upload the evaluated RAG corpus; database chunk IDs are expected to change.

Before the defense, take a fresh backup, restore it into a disposable database and record the result for the deployment section of the report.

## 7. Known security gate

Run `npm audit --omit=dev` in both Node projects before every public release. The currently pinned transitive versions include patched `qs`, `form-data` and `dompurify` releases. The direct frontend dependency `xlsx@0.18.5` still has high-severity advisories and no fixed release in the npm registry. Before exposing assessment spreadsheet import to untrusted files, replace it with a maintained parser or a supported SheetJS distribution and repeat the import regression tests. Until then, restrict this feature to trusted administrators and trusted files only.
