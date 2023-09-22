import { PropriedadeClasse } from '../declaracoes';
import { VisitanteComumInterface } from '../interfaces';
import { Chamavel } from './chamavel';
import { DeleguaFuncao } from './delegua-funcao';
import { ObjetoDeleguaClasse } from './objeto-delegua-classe';

/**
 * Estrutura de declaração de classe.
 */
export class DeleguaClasse extends Chamavel {
    nome: string;
    superClasse: DeleguaClasse;
    metodos: { [nome: string]: DeleguaFuncao };
    propriedades: PropriedadeClasse[];
    dialetoRequerExpansaoPropriedadesEspacoVariaveis: boolean;

    constructor(nome?: string, superClasse?: any, metodos?: any, propriedades?: PropriedadeClasse[]) {
        super();
        this.nome = nome;
        this.superClasse = superClasse;
        this.metodos = metodos || {};
        this.propriedades = propriedades || [];
    }

    encontrarMetodo(nome: string): DeleguaFuncao {
        if (this.metodos.hasOwnProperty(nome)) {
            return this.metodos[nome];
        }

        if (this.superClasse !== null && this.superClasse !== undefined) {
            return this.superClasse.encontrarMetodo(nome);
        }

        return undefined;
    }

    encontrarPropriedade(nome: string): PropriedadeClasse {
        if (nome in this.propriedades) {
            return this.propriedades[nome];
        }

        if (this.superClasse !== null && this.superClasse !== undefined) {
            return this.superClasse.encontrarPropriedade(nome);
        }

        return undefined;
    }

    paraTexto(): string {
        let texto = `<classe ${this.nome}`;
        for (let propriedade of this.propriedades) {
            texto += ` ${propriedade.nome}`;
            if (propriedade.tipo) {
                texto += `:${propriedade.tipo}`;
            }

            texto += ' ';
        }

        texto += '>';
        return texto;
    }

    toString(): string {
        return this.paraTexto();
    }

    aridade(): number {
        const inicializador = this.encontrarMetodo('construtor');
        return inicializador ? inicializador.aridade() : 0;
    }

    async chamar(visitante: VisitanteComumInterface, argumentos: any[]): Promise<ObjetoDeleguaClasse> {
        const instancia = new ObjetoDeleguaClasse(this);

        const inicializador = this.encontrarMetodo('construtor');
        if (inicializador) {
            const metodoConstrutor = inicializador.funcaoPorMetodoDeClasse(instancia);
            await metodoConstrutor.chamar(visitante, argumentos);
        }

        return instancia;
    }
}
