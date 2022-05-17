/* eslint-disable @typescript-eslint/no-empty-function */
import { Application } from 'lisk-sdk';
import { LnsModule } from "./modules/lns/lns_module";

export const registerModules = (app: Application): void => {
    app.registerModule(LnsModule);
};
