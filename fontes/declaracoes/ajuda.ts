import { Construto } from "../construtos";
import { VisitanteDeleguaInterface } from "../interfaces";
import { Declaracao } from "./declaracao";

/**
 * A declaração de ajuda (`ajuda()` em Delégua) exibe na saída padrão uma documentação sobre como
 * utilizar qualquer elemento da linguagem que a implementa.
 */
export class Ajuda extends Declaracao {
    elemento?: Construto;
    funcao: boolean;

    constructor(hashArquivo: number, linha: number, elemento?: Construto, funcao: boolean = true) {
        super(linha, hashArquivo);
        this.elemento = elemento;
        this.funcao = funcao;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarDeclaracaoAjuda(this);
    }

    paraTexto(): string {
        let retorno = `<ajuda `;
        if (this.elemento) {
            retorno += `elemento=${this.elemento.paraTexto()} `;
        }

        retorno += `funcao=${this.funcao ? 'Sim' : 'Não'} />`;
        return retorno;
    }
}