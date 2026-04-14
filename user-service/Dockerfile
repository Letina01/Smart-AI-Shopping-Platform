FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /workspace
COPY . .
RUN mvn -pl user-service -am clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
RUN groupadd -r spring && useradd -r -g spring spring
WORKDIR /app
COPY --from=builder /workspace/user-service/target/user-service-1.0.0.jar app.jar
USER spring:spring
EXPOSE ${PORT:-9001}
ENTRYPOINT ["java", "-jar", "/app/app.jar", "--server.port=${PORT:-9001}"]

