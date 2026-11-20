# Build the Spring Boot API with Java 21.
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

# Small Java 21 runtime image.
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/cinetickets-api-0.1.0-SNAPSHOT.jar /app/app.jar
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:InitialRAMPercentage=20 -XX:+UseSerialGC"
EXPOSE 8080
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
