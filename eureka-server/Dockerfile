FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /workspace
COPY . .
RUN mvn -pl eureka-server -am clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
RUN groupadd -r spring && useradd -r -g spring spring
WORKDIR /app
COPY --from=builder /workspace/eureka-server/target/eureka-server-1.0.0.jar app.jar
USER spring:spring
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

