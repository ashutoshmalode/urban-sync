FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean install -DskipTests
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "target/urbansync-backend-0.0.1-SNAPSHOT.jar"]