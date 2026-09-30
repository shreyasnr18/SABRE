FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY backend/java_security/ /app/
RUN javac -d bin SabreSecurityShield.java

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/bin /app/bin
EXPOSE 8090
CMD ["java", "-cp", "bin", "com.sabre.security.SabreSecurityShield"]
