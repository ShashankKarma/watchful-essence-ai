# GuardianAI Backend

AI-powered proactive women safety application — Spring Boot backend.

> **Safety Disclaimer:** GuardianAI is an assistive safety tool and does not replace local emergency services. In a real emergency, always contact your local police/emergency number first.

## Architecture

```
com.guardianai
 ├── model         Mongo documents (User, TrustedContact, DigitalTwin, BehaviourData, RiskAssessment,
 │                  SafetyAlert, EmergencyEvent, LocationData, Notification, SafetyTip,
 │                  MonitoringSession, UserSettings)
 ├── repository    Spring Data MongoRepository interfaces
 ├── dto           Request/response DTOs with Bean Validation
 ├── service       Business logic (Auth, User, TrustedContact, Behaviour, AiAnalysis, Alert,
 │                  Emergency, Location, Notification, SafetyTip, Monitoring, Admin, Demo)
 ├── ai            AnomalyDetectionEngine (deterministic rules) + GeminiService (optional LLM
 │                  explanation) + DigitalTwinService (behavioural baseline learning)
 ├── controller    REST controllers (thin, delegate to services), documented with OpenAPI
 ├── security      JWT auth filter, JwtService, CustomUserDetailsService, SecurityConfig, rate limiting
 ├── config        CORS, OpenAPI, Mongo auditing, scheduling, WebClient beans
 ├── exception     Custom exceptions + GlobalExceptionHandler
 └── util          GeoUtils (haversine), TimeUtils
```

### AI Digital Twin

Each user has a `DigitalTwin` — a behavioural baseline built from their historical `BehaviourData`
(active hours, usual movement duration, activity frequency, usual GPS locations). The
`DigitalTwinService` incrementally updates this baseline as new behaviour is recorded, with
`learningProgress` climbing towards 100% as more samples (up to 100) are collected.

The `AnomalyDetectionEngine` compares each new behaviour sample against the twin using
**deterministic statistical rules** (no randomness):
- Hour-of-day deviation from baseline active hours
- Haversine distance from usual locations
- Deviation of movement duration from baseline
- Rarity of the activity type in the baseline frequency map

These are combined into a weighted `anomalyScore` (0–100) banded into risk levels:
`0-30 LOW`, `31-60 MEDIUM`, `61-80 HIGH`, `81-100 CRITICAL`, with a confidence score derived
from the twin's `learningProgress` and human-readable `reasons`.

Optionally, `GeminiService` calls Google's Gemini (`gemini-2.5-flash`) to provide a natural
language explanation/adjustment on top of the local score. It is **fully fault tolerant**: if
`GEMINI_API_KEY` is missing or the call fails/times out, it returns `Optional.empty()` and the
local engine's result is used as-is. The app is 100% functional without any Gemini key.

### Emergency Workflow

1. Behaviour/location is streamed while monitoring is enabled.
2. `AiAnalysisService` scores each sample; `HIGH`/`CRITICAL` risk creates a `SafetyAlert`.
3. The user is asked "I'm SAFE" or "NEED HELP" within `app.alert-timeout-seconds`.
4. If no response within the timeout, a scheduled job (`AlertService`) auto-escalates to an
   `EmergencyEvent` (`AUTO_ESCALATION`).
5. A user can also directly trigger `/api/sos` (`MANUAL_SOS`).
6. `EmergencyService` captures the last known location, builds a timeline, and notifies trusted
   contacts through `NotificationChannel` implementations (in-app is real; SMS/Email are clearly
   marked simulated stubs).
7. The event can be `resolved` or `cancelled` by the user, or remains `ACTIVE`/`AUTO_ESCALATED`.

### Demo Mode

`DemoService` (`POST /api/demo/simulate`) walks through a 12-step scenario: baseline learning →
normal behaviour → anomalous behaviour → risk escalation → alert → timeout → auto emergency →
contact notification → location capture → resolution. Every record it creates is flagged
`simulated=true` so it's clearly distinguishable from real user data. `DataSeeder` also seeds a
ready-to-use demo account on startup.

**Demo login:** `demo@guardianai.local` / `Demo@1234`
**Admin login:** `admin@guardianai.local` / `Admin@1234`

## Setup

### Prerequisites
- Java 21
- Maven 3.9+
- MongoDB (local or Atlas)

### Configure environment
```bash
cp .env.example .env
# set MONGODB_URI to the MongoDB Atlas SRV string, then set JWT_SECRET
# and (optionally) GEMINI_API_KEY
```

For MongoDB Atlas:
1. Create a database user in Atlas and copy the application connection string.
2. Replace `<username>`, `<password>`, and `<cluster>` in `MONGODB_URI`.
3. URL-encode special characters in the username or password.
4. Add the deployed backend's outbound IP range to Atlas Network Access. For a
   temporary development check only, Atlas allows `0.0.0.0/0`, but it should not
   be used as a permanent production rule.
5. Keep `MONGODB_URI` and `JWT_SECRET` in the hosting provider's environment
   settings, never in source control.

The application uses Spring Data MongoDB repositories for all user, safety,
alert, emergency, location, notification, and digital-twin data. On startup,
`DataSeeder` creates the demo records only when the database is empty; existing
Atlas data is left untouched.

### Run
```bash
mvn clean install
mvn spring-boot:run
```

### Build a jar
```bash
mvn clean package
java -jar target/guardianai-backend-1.0.0.jar
```

### Tests
```bash
mvn test
```

## API Documentation

Once running, Swagger UI is available at:
```
http://localhost:8080/swagger-ui.html
```
OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Persistence and deployment health checks

Use these endpoints after deployment:

| Endpoint | Purpose | Expected result |
|---|---|---|
| `/actuator/health` | Basic application and MongoDB health | HTTP 200 with `{"status":"UP"}` |
| `/actuator/health/readiness` | Load-balancer readiness, including MongoDB | HTTP 200 when ready |
| `/actuator/health/liveness` | Process liveness | HTTP 200 while the process is running |
| `/api/health/persistence` | Performs a temporary MongoDB write, read, and delete | HTTP 200 with `writeReadVerified: true` |

`/api/health/persistence` removes its temporary probe document after checking
it, so it can be used as a deployment smoke test without leaving test data in
Atlas. Do not expose management endpoints publicly beyond the health paths.

## Deployment

- Package as a jar (`mvn clean package`) and run behind a reverse proxy (Nginx) with HTTPS.
- Provide `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, and `CORS_ALLOWED_ORIGINS` as environment
  variables (see `.env.example`). The Atlas URI must use `mongodb+srv://` and include the
  target database name.
- Configure the platform health check as `/actuator/health/readiness` and use
  `/api/health/persistence` as a post-deploy smoke test.
- Suitable for Docker/Render/Railway/EC2/Azure App Service. MongoDB Atlas supplies the managed DB.
- Rotate `JWT_SECRET` and restrict CORS origins to your production frontend domain(s) in production.

## Safety Disclaimer

GuardianAI is an assistive safety tool and does not replace local emergency services.
