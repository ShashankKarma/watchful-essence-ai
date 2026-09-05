# GuardianAI Pro

Build a complete full-stack web application called:

GUARDIANAI
AI-POWERED PROACTIVE WOMEN SAFETY APPLICATION

IMPORTANT:
The BACKEND MUST be built using JAVA + SPRING BOOT.
DO NOT use Node.js, Express.js, Python Flask, Django, Firebase Functions, or any other backend framework.

==================================================
1. TECHNOLOGY STACK
==================================================

FRONTEND:
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- Recharts
- Axios

BACKEND:
- Java 21
- Spring Boot 3.x
- Spring Web
- Spring Security
- JWT authentication
- Spring Data MongoDB
- Bean Validation
- Lombok
- Maven

DATABASE:
- MongoDB
- MongoDB Atlas compatible

AI:
- Gemini API integration
- Create a separate AI service layer
- AI Digital Twin
- Behaviour analysis
- Anomaly detection
- Risk scoring

MAP:
- Leaflet
- OpenStreetMap
- Browser Geolocation API

==================================================
2. ARCHITECTURE
==================================================

Use this architecture:

React Frontend
       ↓
REST API
       ↓
Spring Boot Backend
       ↓
Service Layer
       ↓
Repository Layer
       ↓
MongoDB

AI Flow:

Behaviour Data
       ↓
Spring Boot AI Service
       ↓
Gemini API / Anomaly Detection
       ↓
Digital Twin
       ↓
Risk Score
       ↓
Safety Alert
       ↓
Emergency Workflow

Use clean layered architecture:

controller/
service/
repository/
model/
dto/
security/
config/
exception/
ai/
util/

Do NOT put business logic inside controllers.

==================================================
3. APPLICATION PURPOSE
==================================================

GuardianAI is an AI-powered women safety application that provides proactive safety monitoring instead of depending only on manual SOS.

The system learns the user's normal behavioural patterns through an AI Digital Twin.

When unusual behaviour is detected:

Normal Behaviour
        ↓
Behaviour Monitoring
        ↓
Anomaly Detection
        ↓
Risk Assessment
        ↓
User Alert
        ↓
User Response?

If user says "I'm Safe":
→ Resolve alert
→ Continue monitoring

If user selects "Need Help":
→ Start emergency workflow

If user does not respond:
→ Automatic emergency escalation
→ Notify trusted contacts
→ Share latest location
→ Create emergency event

==================================================
4. AUTHENTICATION
==================================================

Implement complete authentication using:

Spring Security
JWT
BCrypt password hashing

APIs:

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/forgot-password

User registration:

name
email
phone
password
emergencyPin

JWT must be returned after successful login.

Frontend must store authentication securely and attach JWT to protected API requests.

Create JWT authentication filter.

Create:

JwtService
JwtAuthenticationFilter
SecurityConfig
CustomUserDetailsService

Protect all private endpoints.

==================================================
5. USER MODEL
==================================================

Create MongoDB User document:

User:

id
name
email
phone
password
role
emergencyPin
monitoringEnabled
createdAt
updatedAt

Roles:

USER
TRUSTED_CONTACT
ADMIN

Use MongoDB ObjectId/String IDs.

==================================================
6. TRUSTED CONTACTS
==================================================

Create:

TrustedContact

Fields:

id
userId
name
relationship
phone
email
priority
notificationEnabled
createdAt

APIs:

GET /api/contacts
POST /api/contacts
PUT /api/contacts/{id}
DELETE /api/contacts/{id}

Frontend page:

/trusted-contacts

Features:
- Add contact
- Edit
- Delete
- Set primary contact
- Enable/disable notifications

==================================================
7. USER DASHBOARD
==================================================

Create:

/dashboard

Dashboard must show:

Welcome message

Current Safety Status:

SAFE
MONITORING ACTIVE
ATTENTION REQUIRED
HIGH RISK
CRITICAL

Cards:

AI Risk Score
Monitoring Status
Current Location
Trusted Contacts
Recent Alerts
Emergency History

Main buttons:

START MONITORING
STOP MONITORING

Large:

EMERGENCY SOS

Show:

"GuardianAI is monitoring your safety patterns."

==================================================
8. AI DIGITAL TWIN
==================================================

Create:

/digital-twin

The Digital Twin represents the user's normal behavioural profile.

It should learn from historical behaviour data.

Track:

Typical active hours
Typical movement duration
Typical location patterns
Typical activity frequency
Typical travel patterns

Show:

Digital Twin Status
LEARNING
ACTIVE

Learning Progress:

0–100%

Create:

DigitalTwin

Fields:

id
userId
baselineActiveHours
baselineMovementDuration
baselineActivityFrequency
usualLocations
riskThreshold
learningProgress
lastUpdated

==================================================
9. BEHAVIOUR DATA
==================================================

Create:

BehaviourData

Fields:

id
userId
activityType
timestamp
latitude
longitude
movementDuration
activityDuration
metadata

Examples:

WALKING
RUNNING
STATIONARY
TRAVELLING
IDLE

APIs:

POST /api/behaviour
GET /api/behaviour
GET /api/behaviour/baseline

==================================================
10. AI ANOMALY DETECTION
==================================================

Create:

AiAnalysisService

Endpoint:

POST /api/ai/analyze

Input:

userId
behaviour data
location
timestamp
activity

Output:

anomalyScore
riskLevel
confidence
reasons

Example:

{
  "anomalyScore": 78,
  "riskLevel": "HIGH",
  "confidence": 0.86,
  "reasons": [
    "Unusual location",
    "Activity outside normal hours",
    "Behaviour differs from baseline"
  ]
}

Risk levels:

0–30 = LOW
31–60 = MEDIUM
61–80 = HIGH
81–100 = CRITICAL

IMPORTANT:

Do NOT generate random risk scores.

Use the user's stored baseline to calculate behavioural deviation.

Initially implement a working rule/statistical anomaly detection mechanism.

Also create Gemini integration as a separate service so the AI engine can later use Gemini for richer analysis.

==================================================
11. GEMINI INTEGRATION
==================================================

Create:

GeminiService

Use environment variable:

GEMINI_API_KEY=

Never hardcode the API key.

Create configuration:

gemini:
  api-key: ${GEMINI_API_KEY}

Gemini should be used for behavioural reasoning/explanation where appropriate.

Do not send unnecessary personal information to the AI API.

If Gemini API is unavailable:

The application must continue working using the local anomaly detection engine.

==================================================
12. RISK ASSESSMENT
==================================================

Create:

RiskAssessment

Fields:

id
userId
anomalyScore
riskLevel
reasons
confidence
timestamp

API:

GET /api/ai/risk-score
GET /api/ai/risk-history

Display risk score using a clean chart.

==================================================
13. SAFETY ALERT
==================================================

When HIGH or CRITICAL risk is detected:

Show:

⚠️ UNUSUAL ACTIVITY DETECTED

"GuardianAI detected behaviour that differs from your normal pattern."

Show:

Risk Score
Risk Level
Reasons

Buttons:

I'M SAFE
NEED HELP

Countdown:

30 seconds

Make timeout configurable.

If:

I'M SAFE
→ Resolve alert
→ Continue monitoring

If:

NEED HELP
→ Emergency workflow

No response:
→ Emergency workflow

==================================================
14. SOS
==================================================

Create:

POST /api/sos

When SOS is triggered:

1. Create EmergencyEvent
2. Capture latest location
3. Notify trusted contacts
4. Save event
5. Show emergency status

Emergency event fields:

id
userId
triggerType
riskLevel
locationId
status
timestamp

Trigger types:

MANUAL_SOS
AI_DETECTION
AUTO_ESCALATION

Statuses:

ACTIVE
RESOLVED
CANCELLED
AUTO_ESCALATED

==================================================
15. EMERGENCY WORKFLOW
==================================================

Implement:

Monitoring
↓
Behaviour Analysis
↓
Anomaly Detected
↓
Risk Score
↓
High/Critical?
↓
User Alert
↓
User Response?

YES - SAFE
↓
Resolve Alert
↓
Continue Monitoring

NO RESPONSE
↓
Emergency Workflow
↓
Capture Location
↓
Notify Trusted Contacts
↓
Create Emergency Event
↓
Show Emergency Status

==================================================
16. LOCATION
==================================================

Create:

LocationData

Fields:

id
userId
latitude
longitude
accuracy
timestamp

APIs:

POST /api/location
GET /api/location/current
GET /api/location/history

Frontend:

/location

Use:

Browser Geolocation API
Leaflet
OpenStreetMap

Show:

Current location
Latitude
Longitude
Last updated time
Location history

Handle location permission denial gracefully.

==================================================
17. NOTIFICATION SYSTEM
==================================================

Create:

Notification

Fields:

id
userId
emergencyEventId
type
title
message
status
createdAt

Types:

INFO
WARNING
HIGH_RISK
EMERGENCY
SYSTEM

APIs:

GET /api/notifications
POST /api/notifications/{id}/read

For development/demo:

Implement in-app notifications.

Create a notification service abstraction for future:

SMS
Email
Push Notifications

DO NOT claim that real SMS or emergency calls are sent unless a real provider is configured.

==================================================
18. EMERGENCY HISTORY
==================================================

Create:

/emergency-history

Show:

Event ID
Date
Time
Trigger
Risk Level
Status
Location

Create details view:

Detection
↓
Alert
↓
User Response
↓
Emergency Trigger
↓
Contact Notification
↓
Resolution

API:

GET /api/emergency/history
GET /api/emergency/{id}
POST /api/emergency/{id}/resolve
POST /api/emergency/{id}/cancel

==================================================
19. ALERT HISTORY
==================================================

Create:

/alerts

Show:

Alert Type
Risk Score
Risk Level
Reasons
Date
Time
Response
Status

Filters:

All
Low
Medium
High
Critical
Resolved
Unresolved

==================================================
20. SAFETY TIPS
==================================================

Create:

/safety-tips

Categories:

Travel Safety
Night Travel
Public Places
Online Safety
Emergency Preparedness
Digital Privacy

Create backend model:

SafetyTip

Fields:

id
title
description
category
icon
createdAt

API:

GET /api/safety-tips

==================================================
21. PROFILE
==================================================

Create:

/profile

Show:

Name
Email
Phone
Emergency PIN status

Allow:

Update profile
Change password

==================================================
22. SETTINGS
==================================================

Create:

/settings

Settings:

Risk sensitivity
Alert timeout
Location sharing
Monitoring preferences
Notification preferences
Privacy settings

==================================================
23. ADMIN DASHBOARD
==================================================

Create:

/admin

Show:

Total Users
Active Monitoring Sessions
Alerts Today
High Risk Events
Emergency Events

Charts:

Risk distribution
Alerts over time
Emergency events
Monitoring activity

Admin APIs:

GET /api/admin/dashboard
GET /api/admin/users
GET /api/admin/emergencies

Use ADMIN role protection.

==================================================
24. TRUSTED CONTACT DASHBOARD
==================================================

Create:

/trusted-contact/dashboard

Trusted contacts should see emergency information relevant to them.

Show:

Person requiring assistance
Risk level
Emergency status
Last known location
Time
Emergency event
Notification status

Do not expose unrelated private information.

==================================================
25. DEMO MODE
==================================================

VERY IMPORTANT FOR B.TECH PROJECT DEMONSTRATION.

Create a clearly visible:

DEMO MODE

Allow simulation of:

NORMAL ACTIVITY
UNUSUAL ACTIVITY
HIGH RISK
SAFETY ALERT
NO RESPONSE
AUTO ESCALATION
MANUAL SOS
EMERGENCY RESOLUTION

Demo sequence:

1. Start monitoring
2. Simulate normal behaviour
3. Simulate unusual behaviour
4. Generate anomaly score
5. Show high-risk alert
6. Start countdown
7. Simulate no response
8. Trigger emergency workflow
9. Show location
10. Notify trusted contact
11. Create emergency event
12. Resolve emergency

All simulated events must be clearly marked:

DEMO / SIMULATED

==================================================
26. DATABASE
==================================================

Use MongoDB with Spring Data MongoDB.

Create repositories:

UserRepository
TrustedContactRepository
DigitalTwinRepository
BehaviourDataRepository
RiskAssessmentRepository
EmergencyEventRepository
LocationRepository
NotificationRepository
SafetyTipRepository
AlertRepository
MonitoringSessionRepository

Use appropriate indexes.

==================================================
27. DTOs
==================================================

Do not expose database documents directly where inappropriate.

Create DTOs:

RegisterRequest
LoginRequest
LoginResponse
UserResponse
TrustedContactRequest
BehaviourDataRequest
AiAnalysisRequest
AiAnalysisResponse
RiskAssessmentResponse
LocationRequest
EmergencyResponse
NotificationResponse

==================================================
28. EXCEPTION HANDLING
==================================================

Create:

GlobalExceptionHandler

Handle:

ValidationException
AuthenticationException
ResourceNotFoundException
BadRequestException
Generic exceptions

Return consistent JSON:

{
  "success": false,
  "message": "..."
}

==================================================
29. FRONTEND ROUTES
==================================================

Create:

/login
/register
/forgot-password

/dashboard
/digital-twin
/monitoring
/location
/trusted-contacts
/alerts
/emergency-history
/safety-tips
/profile
/settings
/notifications

/admin
/admin/users
/admin/emergencies
/admin/analytics

/trusted-contact/dashboard

Use protected React routes.

==================================================
30. FRONTEND API INTEGRATION
==================================================

Use Axios.

Create:

apiClient.ts

Configure:

baseURL = environment variable

Example:

VITE_API_BASE_URL

Create services:

authService
userService
contactService
monitoringService
aiService
locationService
sosService
alertService
emergencyService
notificationService
safetyTipService

Do not hardcode backend URLs throughout components.

==================================================
31. UI COMPONENTS
==================================================

Create reusable:

Sidebar
Navbar
MobileNavigation
SafetyStatusCard
RiskScoreCard
SOSButton
AlertModal
EmergencyStatusCard
LocationMap
TrustedContactCard
NotificationPanel
RiskChart
BehaviourChart
DigitalTwinCard
ActivityTimeline
EmergencyTimeline
SafetyTipCard
LoadingState
EmptyState
ErrorState
ConfirmDialog

==================================================
32. RESPONSIVE DESIGN
==================================================

Desktop:
Sidebar + dashboard

Tablet:
Compact sidebar

Mobile:
Bottom navigation

SOS button must remain easily accessible on mobile.

==================================================
33. SECURITY
==================================================

Implement:

BCrypt
JWT
Spring Security
CORS
Validation
Protected endpoints
Role-based authorization
Environment variables
No hardcoded API keys
Basic rate limiting for authentication and SOS endpoints where practical

==================================================
34. ENVIRONMENT VARIABLES
==================================================

Create:

.env.example

Frontend:

VITE_API_BASE_URL=

Backend:

MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=

Never commit actual secrets.

==================================================
35. SAMPLE DATA
==================================================

Create development/demo seed data.

Demo user:

Name: Demo User
Email: demo@guardianai.local

Do not use real personal information.

Include:

Trusted contacts
Behaviour history
Digital Twin
Risk assessments
Alerts
Emergency events
Locations
Safety tips

==================================================
36. PROJECT STRUCTURE
==================================================

BACKEND:

src/main/java/com/guardianai/

controller/
service/
repository/
model/
dto/
security/
config/
exception/
ai/
util/

Frontend:

src/

components/
pages/
layouts/
services/
hooks/
types/
utils/
routes/

==================================================
37. README
==================================================

Generate a detailed README.

Include:

Project Overview
Features
Architecture
Technology Stack
Frontend Setup
Spring Boot Backend Setup
MongoDB Setup
Gemini API Setup
Environment Variables
Maven Commands
Frontend Commands
Database Configuration
API Documentation
Demo Mode
AI Digital Twin Explanation
Emergency Workflow
Deployment

==================================================
38. API DOCUMENTATION
==================================================

Add Swagger/OpenAPI documentation.

Use Springdoc OpenAPI.

Expose:

/swagger-ui.html

Document major REST endpoints.

==================================================
39. FINAL QUALITY CHECK
==================================================

Before finishing:

1. Run/build the React frontend.
2. Run/build the Spring Boot backend.
3. Check TypeScript errors.
4. Check Java compilation errors.
5. Check missing imports.
6. Check Maven dependencies.
7. Check MongoDB repository errors.
8. Check API endpoint mismatches.
9. Check frontend/backend DTO mismatches.
10. Check JWT authentication.
11. Check CORS.
12. Check responsive UI.
13. Check all navigation routes.
14. Check loading/error states.
15. Check demo workflow.

Fix all detected errors.

==================================================
40. IMPORTANT SAFETY DISCLAIMER
==================================================

GuardianAI is an assistive safety application.

Do NOT claim:

- 100% accurate danger detection
- guaranteed emergency response
- guaranteed police/ambulance response
- perfect AI prediction

Do not automatically contact real emergency services.

For the B.Tech demo, emergency notifications should be simulated unless a verified external service is configured.

Show a disclaimer in Settings/About:

"GuardianAI is an assistive safety tool and does not replace local emergency services."

==================================================
FINAL RESULT
==================================================

Generate the COMPLETE WORKING FULL-STACK APPLICATION.

Frontend:
React + TypeScript + Vite + Tailwind

Backend:
Java 21 + Spring Boot 3 + Spring Security + JWT

Database:
MongoDB + Spring Data MongoDB

AI:
Gemini API + local anomaly detection fallback

Maps:
Leaflet + OpenStreetMap

Include:

✓ Authentication
✓ JWT
✓ User profile
✓ Trusted contacts
✓ AI Digital Twin
✓ Behaviour monitoring
✓ Anomaly detection
✓ Risk scoring
✓ Safety alerts
✓ User confirmation
✓ Automatic emergency escalation
✓ SOS
✓ Location
✓ Emergency history
✓ Notifications
✓ Safety tips
✓ Analytics
✓ Admin dashboard
✓ Trusted contact dashboard
✓ Demo mode
✓ MongoDB
✓ REST APIs
✓ Swagger
✓ Security
✓ README

The final application should look like a polished B.Tech CSE project called:

GUARDIANAI

Tagline:

"From Manual SOS to Proactive AI Safety"

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://watchful-essence-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/13cc838c-640e-4c9a-8c40-0315d9c3b362).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
