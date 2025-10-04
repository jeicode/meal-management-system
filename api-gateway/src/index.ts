import { environment } from "./config/environment.config";
import { runServer } from "./config/http-server.config";

runServer({ PORT: environment.PORT });
