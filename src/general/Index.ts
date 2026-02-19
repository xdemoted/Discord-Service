import { Main } from "src/enforcer/Main";
import { Talos } from "src/talos/Index";
import MongoConnector from "./handlers/MongoConnector";
import RedisConnector from "./handlers/RedisConnector";
import { Singleton } from "src/container/Singleton";
import { Scope } from "src/container/Scope";

@Singleton
export class Index {
    public constructor(scope: Scope) {
        scope.awaitComplete().then(() => {
            const enforcer = Scope.getScope("src/enforcer", scope);
            const talos = Scope.getScope("src/talos", scope);
        })
    }
}