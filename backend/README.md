# RoadGuardian AI Backend - Production-Grade Emergency Response Platform

> **A scalable, cloud-ready AI-powered emergency response and accident monitoring backend for smart cities.**

---

## 🚀 Project Overview

RoadGuardian AI is a comprehensive smart-city emergency response platform designed to:
- 🚨 **Real-time Accident Management** - Report and track accidents instantly
- 🤖 **AI Risk Scoring** - Intelligent risk assessment and recommendations
- 🚑 **Emergency Dispatch** - Automated ambulance, police, and hospital coordination
- 📍 **Live Tracking** - Real-time location tracking for emergency responders
- 📊 **Analytics Dashboard** - Comprehensive incident analytics and metrics
- 🔐 **Enterprise Security** - JWT authentication, role-based access control
- 🌐 **WebSocket Real-time Updates** - Live incident streaming and notifications
- ☁️ **Cloud-Ready** - Kubernetes, Docker, and multi-cloud deployment support

---

## 📋 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Language** | Java | 17+ |
| **Framework** | Spring Boot | 3.2.0 |
| **Database** | PostgreSQL | 14+ |
| **Cache** | Redis | 7+ |
| **Authentication** | JWT + Spring Security | - |
| **Real-time** | WebSocket / STOMP | - |
| **API Documentation** | OpenAPI 3.0 / Swagger | - |
| **Build** | Maven | 3.9+ |
| **Containerization** | Docker & Docker Compose | - |
| **Load Balancing** | Nginx | - |

---

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│        REST API / WebSocket Client      │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│         Controllers / WebSocket          │
│    (HTTP Request / WebSocket Handlers)   │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│    Business Services / Application       │
│   (AccidentService, AuthService, etc.)   │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│      Data Access Layer / Repositories    │
│     (JPA Repositories / Queries)         │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│    Database / Cache / External Services  │
│  (PostgreSQL, Redis, AWS S3, etc.)       │
└─────────────────────────────────────────┘
```

### Project Structure

```
com.roadguardian.backend/
├── config/                    # Configuration classes
│   ├── SecurityConfig.java
│   ├── WebSocketConfig.java
│   ├── RedisConfig.java
│   └── SwaggerConfig.java
├── controller/                # REST API Controllers
│   ├── AuthController.java
│   ├── AccidentController.java
│   ├── AIController.java
│   └── AnalyticsController.java
├── service/                   # Business Logic Services
│   ├── AuthService.java
│   ├── AccidentService.java
│   ├── AIRiskEngineService.java
│   ├── NotificationService.java
│   └── AnalyticsService.java
├── repository/                # Data Access Layer
│   ├── UserRepository.java
│   ├── AccidentRepository.java
│   └── ...
├── model/
│   ├── entity/               # JPA Entities
│   │   ├── User.java
│   │   ├── Accident.java
│   │   └── ...
│   ├── dto/                  # Data Transfer Objects
│   │   ├── AccidentDTO.java
│   │   ├── UserDTO.java
│   │   └── ...
├── security/                 # Security & JWT
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetails.java
├── exception/                # Exception Handling
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── ...
├── util/                     # Utility Classes
└── RoadGuardianBackendApplication.java
```

---

## 🔧 Setup & Installation

### Prerequisites

- **Java 17+** installed
- **PostgreSQL 14+** running
- **Redis 7+** running
- **Maven 3.9+** installed
- **Docker & Docker Compose** (optional)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/roadguardian/backend.git
cd backend
```

#### 2. Configure Environment

Create `.env` file:

```env
DB_URL=jdbc:postgresql://localhost:5432/roadguardian
DB_USER=postgres
DB_PASSWORD=postgres
DB_POOL_SIZE=20

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=86400000

SERVER_PORT=8080
```

#### 3. Setup PostgreSQL

```bash
# Create database
createdb roadguardian

# Or using Docker
docker run --name roadguardian-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=roadguardian -p 5432:5432 -d postgres:16-alpine
```

#### 4. Setup Redis

```bash
# Using Docker
docker run --name roadguardian-redis -p 6379:6379 -d redis:7-alpine
```

#### 5. Build the Application

```bash
mvn clean install
```

#### 6. Run the Application

```bash
mvn spring-boot:run
```

Server will start at `http://localhost:8080`

---

## 📚 API Documentation

### Swagger UI

Access API documentation at: **http://localhost:8080/swagger-ui.html**

### Base URL

```
http://localhost:8080/api/v1
```

### Authentication

All protected endpoints require JWT token in `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Key Endpoints

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | User login |
| `POST` | `/auth/register` | User registration |
| `GET` | `/auth/user/{id}` | Get user details |

#### Accidents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/accidents` | Report new accident |
| `GET` | `/accidents` | List all accidents |
| `GET` | `/accidents/{id}` | Get accident details |
| `GET` | `/accidents/severity/{severity}` | Filter by severity |
| `GET` | `/accidents/nearby?lat=X&lon=Y&radius=Z` | Find nearby accidents |
| `GET` | `/accidents/active/list` | Get active accidents |
| `PUT` | `/accidents/{id}/status` | Update accident status |
| `DELETE` | `/accidents/{id}` | Delete accident |

#### AI & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/recommend/{accidentId}` | Get AI recommendations |
| `GET` | `/analytics/dashboard/metrics` | Get dashboard metrics |

#### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/health/ready` | Readiness probe |

---

## 🔒 Authentication & Authorization

### User Roles

1. **ADMIN** - Full system access
2. **POLICE** - Police dispatch and reporting
3. **HOSPITAL** - Hospital coordination
4. **AMBULANCE** - Ambulance operations
5. **USER** - General public reports

### Login Flow

```
1. POST /api/v1/auth/login
   { "email": "user@example.com", "password": "password" }

2. Response:
   {
     "token": "eyJhbGc...",
     "expiresIn": 86400000,
     "user": { ... }
   }

3. Use token in subsequent requests:
   Authorization: Bearer eyJhbGc...
```

---

## 🚀 Deployment

### Docker Deployment

#### Build Docker Image

```bash
docker build -t roadguardian-backend:1.0.0 .
```

#### Run with Docker Compose

```bash
docker-compose up -d
```

### Cloud Deployment

#### Render Deployment

```bash
# 1. Connect GitHub repository to Render
# 2. Set environment variables
# 3. Deploy
```

#### AWS Deployment

```bash
# Using ECR and ECS
aws ecr create-repository --repository-name roadguardian-backend
docker tag roadguardian-backend:1.0.0 <aws_account>.dkr.ecr.<region>.amazonaws.com/roadguardian-backend:1.0.0
docker push <aws_account>.dkr.ecr.<region>.amazonaws.com/roadguardian-backend:1.0.0
```

#### Kubernetes Deployment

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

---

## 🧪 Testing

### Run Tests

```bash
mvn test
```

### Integration Tests

```bash
mvn verify
```

---

## 🔍 Monitoring & Logs

### Actuator Endpoints

- Health: `http://localhost:8080/actuator/health`
- Metrics: `http://localhost:8080/actuator/metrics`
- Info: `http://localhost:8080/actuator/info`

### View Logs

```bash
# Docker logs
docker logs roadguardian-app1

# File logs
tail -f logs/application.log
```

---

## 📊 Database Schema

### Main Tables

1. **users** - User accounts and profiles
2. **accidents** - Accident incidents
3. **emergency_responses** - Emergency dispatch records
4. **live_tracking** - Real-time location data
5. **notifications** - User notifications
6. **analytics_events** - Analytics tracking
7. **ai_recommendations** - AI-generated recommendations

---

## 🤖 AI Risk Engine

The AI Risk Engine calculates risk scores based on:

- **Severity Level** (LOW: 20, MODERATE: 50, HIGH: 75, CRITICAL: 95)
- **Casualties** (5 points per casualty, max 30)
- **Weather Condition** (CLEAR, RAINY, FOGGY, STORMY)
- **Traffic Density** (LOW, MODERATE, HIGH, VERY_HIGH)
- **Road Type** (Highway, City, Rural)
- **Time of Day** (Peak hours vs. off-peak)

### Recommendations Generated

✅ **Ambulance Requirements**
✅ **Hospital Type Required**
✅ **Police Alert Level**
✅ **Roadblock Necessity**

---

## 🔄 Scalability

### Horizontal Scaling

With Docker Compose and Nginx:

```bash
# Scale to 5 instances
docker-compose up -d --scale app=5
```

### Performance Optimization

- ✅ Connection pooling (HikariCP)
- ✅ Redis caching
- ✅ Database indexing
- ✅ Async processing
- ✅ Gzip compression
- ✅ Query optimization

---

## 🔒 Security

- ✅ JWT authentication with expiry
- ✅ Role-based access control (RBAC)
- ✅ Password encryption (BCrypt)
- ✅ HTTPS/TLS ready
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection prevention

---

## 🛠️ Development

### Build from Source

```bash
mvn clean package -DskipTests
```

### Run in Development Mode

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

---

## 📝 Contributing

Contributions are welcome! Please follow:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs](https://github.com/roadguardian/backend/issues)
- **Email**: team@roadguardian.com
- **Documentation**: [Wiki](https://github.com/roadguardian/backend/wiki)

---

## 🎯 Roadmap

- [ ] ML-based accident prediction
- [ ] Computer vision for CCTV integration
- [ ] Advanced hotspot analytics
- [ ] Multi-language support
- [ ] Mobile app API enhancements
- [ ] GraphQL API support
- [ ] Event streaming (Kafka)
- [ ] Advanced geofencing

---

**Built with ❤️ for safer cities**
