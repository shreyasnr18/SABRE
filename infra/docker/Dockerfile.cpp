FROM alpine:3.19 AS builder
RUN apk add --no-base build-base g++ cmake
WORKDIR /app
COPY backend/cpp_engine/ /app/
RUN g++ -O3 -std=c++17 -o toll_engine toll_corridor_engine.cpp

FROM alpine:3.19
RUN apk add --no-cache libstdc++
WORKDIR /app
COPY --from=builder /app/toll_engine /app/toll_engine
CMD ["/app/toll_engine", "--help"]
