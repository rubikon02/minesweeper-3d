
# Part 1: Build the app using Maven
FROM maven:3.6.0-jdk-8-alpine

## download dependencies
ADD pom.xml /
RUN ["mvn", "verify", "clean"]
## build after dependencies are down so it wont redownload unless the POM changes
ADD . /
RUN ["mvn", "package"]

#EXPOSE 5000

# Part 2: use the JAR file used in the first part and copy it across ready to RUN
FROM openjdk:8-jdk-alpine
WORKDIR /root/
## COPY packaged JAR file and rename as app.jar
## → this relies on your MAVEN package command building a jar
## that matches *-jar-with-dependencies.jar with a single match
COPY --from=0 /target/*-jar-with-dependencies.jar app.jar
#ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","./app.jar"]
#ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-cp","./app.jar","AppKt"]

ENTRYPOINT ["java","-jar","./app.jar"]