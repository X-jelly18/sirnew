import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("relay.proto");
const grpcObj: any = grpc.loadPackageDefinition(packageDef);

const RelayService = grpcObj.relay.Relay.service;

// your backend
const BACKEND = "six.ayanakojivps.shop:443";

function Stream(call: any) {
  const backend = new grpcObj.relay.Relay(
    BACKEND,
    grpc.credentials.createInsecure()
  );

  const stream = backend.Stream();

  call.on("data", (msg: any) => {
    stream.write(msg);
  });

  stream.on("data", (msg: any) => {
    call.write(msg);
  });

  call.on("end", () => {
    stream.end();
    call.end();
  });

  stream.on("error", () => call.end());
}

const server = new grpc.Server();

server.addService(RelayService, { Stream });

// IMPORTANT: Cloud Run uses HTTP/2 gRPC automatically
server.bindAsync(
  "0.0.0.0:8080",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("gRPC Relay running on Cloud Run");
    server.start();
  }
);
