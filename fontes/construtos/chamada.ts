import { InterpretadorInterface } from '../interfaces';
import { Construto } from './construto';

export class Chamada implements Construto {
    id: string;
    linha: number;
    hashArquivo?: number;

    entidadeChamada: Construto;
    argumentos: any[];
    parentese: any;

    constructor(hashArquivo: number, entidadeChamada: Construto, parentese: any, argumentos: any[]) {
        this.id = this.uuidv4();
        this.linha = entidadeChamada.linha;
        this.hashArquivo = hashArquivo;

        this.entidadeChamada = entidadeChamada;
        this.parentese = parentese;
        this.argumentos = argumentos;
    }

    private uuidv4(): string {
        // Public Domain/MIT
        let d = new Date().getTime(); // Timestamp
        let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; // Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16; // random number between 0 and 16
            if (d > 0) {
                // Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                // Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoDeChamada(this);
    }
}
