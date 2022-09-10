import { VariavelInterface } from "./interfaces";

export class Ambiente {
    valores: { [nome: string]: VariavelInterface };

    constructor() {
        this.valores = {};
    }
};
