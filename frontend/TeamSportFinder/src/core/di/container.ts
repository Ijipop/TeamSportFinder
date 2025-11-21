// Container d'injection de dépendances utilisant Inversify
import { Container } from "inversify";
import {
	type IAuthService,

} from "../interfaces";
import { TYPES } from "./types";

// Services concrets
// import { AuthService } from "../services/AuthService";

// Configuration du container
const container = new Container();

// // Enregistrement des dépendances de base (Principe d'inversion de dépendance)
// container.bind<HttpClient>(TYPES.HttpClient).to(HttpClient).inSingletonScope();

// // Enregistrement des services
// container.bind<IAuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();

export { container };

