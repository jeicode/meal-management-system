import { runServer } from "./config/http-server.config";
import { environment } from "./config/enviroment.config";


runServer({ PORT: environment.PORT });
