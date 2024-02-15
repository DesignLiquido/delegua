import { PropriedadeClasse } from '../declaracoes';
import { ErroEmTempoDeExecucao } from '../excecoes';
import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { Chamavel } from './chamavel';
import { DeleguaFuncao } from './delegua-funcao';
import { ObjetoDeleguaClasse } from './objeto-delegua-classe';

/**
 * Estrutura de declaração de classe.
 */
export class DeleguaClasse extends Chamavel {
    simboloOriginal: SimboloInterface;
    superClasse: DeleguaClasse;
    metodos: { [nome: string]: DeleguaFuncao };
    propriedades: PropriedadeClasse[];
    dialetoRequerExpansaoPropriedadesEspacoVariaveis: boolean;
    dialetoRequerDeclaracaoPropriedades: boolean;

    constructor(
        simboloOriginal?: SimboloInterface,
        superClasse?: DeleguaClasse,
        metodos?: { [nome: string]: DeleguaFuncao },
        propriedades?: PropriedadeClasse[]
    ) {
        super();
        this.simboloOriginal = simboloOriginal;
        this.superClasse = superClasse;
        this.metodos = metodos || {};
        this.propriedades = propriedades || [];
        this.dialetoRequerDeclaracaoPropriedades = false;
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

        if (this.dialetoRequerDeclaracaoPropriedades) {
            throw new ErroEmTempoDeExecucao(
                this.simboloOriginal,
                `Propriedade "${nome}" não declarada na classe ${this.simboloOriginal.lexema}.`
            );
        }

        return undefined;
    }

    /**
     * Método utilizado por Delégua para representar esta classe quando impressa.
     * @returns {string} A representação da classe como texto.
     */
    paraTexto(): string {
        let texto = `<classe ${this.simboloOriginal.lexema}`;
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

    /**
     * Método utilizado pelo VSCode para inspecionar esta classe em depuração.
     * @returns {string} A representação da classe como texto.
     */
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
