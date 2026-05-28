# Multi-stage build for production-ready Docker image
FROM maven:3.9-eclipse-temurin-17 as builder

WORKDIR /build

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -q

# Runtime stage
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy built JAR from builder
COPY --from=builder /build/target/backend-*.jar app.jar

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health/liveness || exit 1

# Run the application with optimized JVM settings
ENTRYPOINT ["sh", "-c", "java \
    -Xms256m \
    -Xmx512m \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:InitiatingHeapOccupancyPercent=35 \
    -XX:+DisableExplicitGC \
    -Djava.awt.headless=true \
    -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} \
    -jar app.jar"]
