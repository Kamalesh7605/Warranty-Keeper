# ---- build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q package -DskipTests

# ---- runtime ----
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 app && mkdir -p /app/uploads && chown -R app /app
COPY --from=build --chown=app /build/target/quarkus-app/ /app/
USER app
ENV UPLOAD_DIR=/app/uploads
EXPOSE 8080
CMD ["java", "-jar", "/app/quarkus-run.jar"]
