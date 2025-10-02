import { environment } from "./config/enviroment.config";
import { runServer } from "./config/http-server.config";

runServer({ PORT: environment.PORT });
