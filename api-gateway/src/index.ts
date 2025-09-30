import { environment } from "./core/config/enviroment.config";
import { runServer } from "./core/config/http-server.config";

runServer({ PORT: environment.PORT });
