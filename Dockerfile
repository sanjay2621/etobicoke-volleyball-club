FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /workspace
COPY backend/mvnw backend/pom.xml ./
COPY backend/.mvn .mvn/
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q
COPY backend/src src/
RUN ./mvnw clean package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]