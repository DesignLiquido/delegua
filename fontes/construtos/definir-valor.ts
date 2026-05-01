import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class DefinirValor<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    objeto: ConstrutoInterface;
    nome: SimboloInterface<TTipoSimbolo>;
    valor: any;

    constructor(
        hashArquivo: number,
        linha: number,
        objeto: ConstrutoInterface,
        nome: SimboloInterface<TTipoSimbolo>,
        valor: any
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.objeto = objeto;
        this.nome = nome;
        this.valor = valor;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoDefinirValor(this);
    }

    paraTexto(): string {
        return `<definir-valor objeto=${this.objeto.paraTexto()} nome=${this.nome.lexema} valor=${this.valor} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
