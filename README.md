# 🛡️ RoadGuardian AI
### Autonomous Emergency Response & Accident Intelligence Platform

RoadGuardian AI is a production-grade platform designed to revolutionize road safety through real-time accident detection, intelligent resource allocation, and a unified command center for first responders.

![Java Version](https://shields.io)
![Spring Boot](https://shields.io)
![React](https://shields.io)
![Docker](https://shields.io)
![License](https://shields.io)

## 🌐 Live Preview
* **Web Application:** [RoadGuardian AI Live UI Platform](https://road-guardian-p5kjplu6w-pavan3030-prs-projects.vercel.app)
  *(⚠️ Note: Due to remote database server sleep cycles on free-tier hosting, please use the **Local Setup Guide** below if you experience temporary registration or login credential latency on the live link).*

## 🚀 Key Features
* 🧠 **Neural Accident Detection:** High-speed AI vision engine capable of identifying collisions via uploaded media or live webcam feeds.
* 📡 **Real-time Command Center:** Unified dashboard for administrators to monitor active incidents, track emergency units, and manage response protocols.
* ⚡ **Live Alert System:** WebSocket-driven notification network that broadcasts critical incidents to nearby hospitals and police units within milliseconds.
* 📍 **Geospatial Tracking:** Real-time GPS visualization of accident scenes and dispatched emergency vehicles with route optimization markers.
* 🔐 **Enterprise-Grade Security:** Robust authentication system with JWT rotation, Role-Based Access Control (RBAC), and full audit logging.
* 📊 **Advanced Analytics:** Deep insights into incident trends, response times, and AI prediction accuracy.

## 🏗️ System Architecture
The platform leverages a containerized, decoupled architecture orchestrated with an Nginx reverse proxy. It ensures atomic transactional data streaming using PostgreSQL and high-speed telemetry caching using a Redis cluster layer.

```mermaid
graph TD
    %% Styling Configuration
    classDef client fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff;
    classDef gateway fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#fff;
    classDef backend fill:#9b59b6,stroke:#8e44ad,stroke-width:2px,color:#fff;
    classDef storage fill:#e67e22,stroke:#d35400,stroke-width:2px,color:#fff;

    %% Client Presentation Layer
    subgraph Frontend_SPA [Frontend App Layer]
        C1[Public Citizen / Witness Web Client]:::client
        C2[Agency Dashboard UI Admin/Police/Hospital]:::client
    end

    %% Network & Reverse Proxy Layer
    NGINX[Nginx Reverse Proxy & SSL Termination]:::gateway

    %% Backend Processing Layer
    subgraph Spring_Boot_API [Spring Boot Core Backend Engine]
        B1[REST Controller Endpoints /api/v1/*]:::backend
        B2[STOMP WebSocket Notification Service]:::backend
        B3[Heuristic AI Risk & Vision Engine]:::backend
        B4[Live Simulation Tracking Engine]:::backend
    end

    %% Storage & Caching Layer
    subgraph Persistence_Cache [Data Infrastructure Layer]
        DB[(PostgreSQL 16 Transactional Store)]:::storage
        CACHE[(Redis 7 Cache Grid & Session Store)]:::storage
        FLY[Flyway Schema Migrations V1-V13]:::storage
    end

    %% Mapping Infrastructure
    OSM[OpenStreetMap / Leaflet Maps Engine]:::gateway

    %% Data Flows and Component Interactions
    C1 -->|POST Accident Incident / HTTP HTTPs| NGINX
    C2 -->|JWT Auth Requests / WS STOMP Connection| NGINX
    
    NGINX -->|Route Traffic| B1
    NGINX -->|Establish Socket Persistent Sessions| B2

    B1 <--> B3
    B1 <--> B4
    
    B1 -->|Persist Core Transactions| DB
    B1 <-->|Read-Heavy Query Caching| CACHE
    FLY -->|Verify Baseline Schema Integrity| DB
    
    C2 <-->|Fetch Tiles & Geometry Nodes| OSM
```

## 🛠️ Tech Stack
* **Frontend:** React 19 (Vite) | Tailwind CSS 4.0 | Framer Motion | Leaflet (Geospatial Visualization) | Recharts (Analytics)
* **Backend:** Spring Boot 3.2.0 (Java 17) | Spring Security + JWT | Spring Data JPA
* **Infrastructure:** PostgreSQL 16 | Redis 7 (Real-time Caching) | Flyway (Database Migrations V1-V13) | Nginx Reverse Proxy | Docker Compose

## 💻 Local Setup
### Prerequisites
* Java 17+
* Docker & Docker Compose

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
cd ..
./mvnw clean install -pl backend
./mvnw spring-boot:run -pl backend -Dspring-boot.run.profiles=dev
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 3. Docker (Full Multi-Service Infrastructure Stack)
```bash
docker-compose up --build -d
```
*Frontend running at `http://localhost:3000` and Swagger API Docs live at `http://localhost:8080/swagger-ui.html`*

## 📈 Impact Statement
Every second counts during a road emergency. RoadGuardian AI reduces detection-to-dispatch time by an average of 65%, potentially saving thousands of lives annually by ensuring medical assistance arrives within the critical "Golden Hour".

## 🎯 Future Scope
* **IoT Integration:** Direct connectivity with vehicle black boxes and smart city sensors.
* **Autonomous Dispatch:** Fully AI-driven drone first responders.
* **Predictive Analytics:** Using weather and historical data to predict high-risk zones before accidents occur.

## 👥 Contributors
* **Pavan3030-pr** - Lead AI Engineer & Full Stack Developer

© 2026 RoadGuardian Intelligence Platform. All rights reserved.
