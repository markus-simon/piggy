# PIGGY!!!!

oink!oink!


```
curl -H "Content-Type: application/json" -X POST -d '{"collection":"piggy", "type":"coin", "amount":50}' http://localhost:19000
```



### Make it fly

```bash
gradle wrapper
./gradlew shadowJar
java -jar build/libs/piggy-3.5.4-fat.jar
```


host & port can be configured in:

```bash
src/main/resources/conf/config.json
```