import { VariavelInterface } from "./interfaces";

export class EspacoVariaveis {
    valores: { [nome: string]: VariavelInterface };

    constructor() {
        this.valores = {};
    }
};
