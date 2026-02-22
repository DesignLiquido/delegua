import { PropriedadeClasse } from '../../declaracoes';
import { ErroEmTempoDeExecucao } from '../../excecoes';
import { InterpretadorInterface, SimboloInterface } from '../../interfaces';
import { Chamavel } from './chamavel';
import { DeleguaFuncao } from './delegua-funcao';
import { MetodoPolimorfico } from './metodo-polimorfico';
import { ObjetoDeleguaClasse } from './objeto-delegua-classe';

const mapaDeNormalizacao: { [chave: string]: string } = {
    'numero': 'número',
    'logico': 'lógico',
    'funcao': 'função',
    'dicionario': 'dicionário',
    'modulo': 'módulo',
};

function normalizarTipo(tipo: string | undefined): string {
    if (!tipo || tipo === 'qualquer') return 'qualquer';
    const tipoMinusculo = tipo.toLowerCase();
    return mapaDeNormalizacao[tipoMinusculo] || tipoMinusculo;
}

function assinaturasIguais(a: DeleguaFuncao, b: DeleguaFuncao): boolean {
    const paramsA = a.declaracao?.parametros || [];
    const paramsB = b.declaracao?.parametros || [];
    if (paramsA.length !== paramsB.length) return false;
    for (let i = 0; i < paramsA.length; i++) {
        if (normalizarTipo(paramsA[i].tipoDado) !== normalizarTipo(paramsB[i].tipoDado)) {
            return false;
        }
    }
    return true;
}

/**
 * Descritor de tipo de classe. Quando uma declaração de classe é visitada, o que
 * vai para a pilha de escopos de execução é esta estrutura. Quando uma nova instância
 * de classe é criada, a referência para a instância é implementada aqui.
 */
export class DescritorTipoClasse extends Chamavel {
    simboloOriginal: SimboloInterface;
    superClasse: DescritorTipoClasse;
    metodos: { [nome: string]: DeleguaFuncao | DeleguaFuncao[] };
    metodosEstaticos: { [nome: string]: DeleguaFuncao | DeleguaFuncao[] };
    membrosEstaticos: { [nome: string]: any };
    obtenedores: { [nome: string]: DeleguaFuncao };
    definidores: { [nome: string]: DeleguaFuncao };
    obtenedoresEstaticos: { [nome: string]: DeleguaFuncao };
    definidoresEstaticos: { [nome: string]: DeleguaFuncao };
    propriedades: PropriedadeClasse[];
    dialetoRequerExpansaoPropriedadesEspacoMemoria: boolean;
    dialetoRequerDeclaracaoPropriedades: boolean;
    abstrata: boolean;
    classeEstatica: boolean;
    metodosAbstratos: string[];
    acessoMetodos: { [nome: string]: 'privado' | 'protegido' | 'publico' };
    acessoPropriedades: { [nome: string]: 'privado' | 'protegido' | 'publico' };

    constructor(
        simboloOriginal?: SimboloInterface,
        superClasse?: DescritorTipoClasse,
        metodos?: { [nome: string]: DeleguaFuncao | DeleguaFuncao[] },
        propriedades?: PropriedadeClasse[]
    ) {
        super();
        this.simboloOriginal = simboloOriginal;
        this.superClasse = superClasse;
        this.metodos = metodos || {};
        this.metodosEstaticos = {};
        this.membrosEstaticos = {};
        this.obtenedores = {};
        this.definidores = {};
        this.obtenedoresEstaticos = {};
        this.definidoresEstaticos = {};
        this.propriedades = propriedades || [];
        this.dialetoRequerDeclaracaoPropriedades = false;
        this.abstrata = false;
        this.classeEstatica = false;
        this.metodosAbstratos = [];
        this.acessoMetodos = {};
        this.acessoPropriedades = {};
    }

    /**
     * Verifica se todos os métodos abstratos da superclasse estão implementados
     * na subclasse fornecida. Lança erro em tempo de execução se algum faltar.
     */
    verificarImplementacaoAbstrata(subclasse: DescritorTipoClasse): void {
        for (const nomeAbstrato of this.metodosAbstratos) {
            const implementado = subclasse.metodos.hasOwnProperty(nomeAbstrato);
            if (!implementado) {
                throw new ErroEmTempoDeExecucao(
                    subclasse.simboloOriginal,
                    `Classe '${subclasse.simboloOriginal?.lexema}' não implementa o método abstrato '${nomeAbstrato}' ` +
                    `da classe '${this.simboloOriginal?.lexema}'.`
                );
            }
        }
    }

    encontrarObtenedor(nome: string, estatico: boolean = false): DeleguaFuncao | undefined {
        const mapa = estatico ? this.obtenedoresEstaticos : this.obtenedores;
        if (Object.prototype.hasOwnProperty.call(mapa, nome)) {
            return mapa[nome];
        }

        if (this.superClasse !== null && this.superClasse !== undefined) {
            return this.superClasse.encontrarObtenedor(nome, estatico);
        }

        return undefined;
    }

    encontrarDefinidor(nome: string, estatico: boolean = false): DeleguaFuncao | undefined {
        const mapa = estatico ? this.definidoresEstaticos : this.definidores;
        if (Object.prototype.hasOwnProperty.call(mapa, nome)) {
            return mapa[nome];
        }

        if (this.superClasse !== null && this.superClasse !== undefined) {
            return this.superClasse.encontrarDefinidor(nome, estatico);
        }

        return undefined;
    }

    async obterEstatico(nome: string, visitante?: InterpretadorInterface): Promise<any> {
        const obtenedor = this.encontrarObtenedor(nome, true);
        if (obtenedor) {
            if (!visitante) {
                throw new ErroEmTempoDeExecucao(
                    this.simboloOriginal,
                    `Obtenedor estático '${nome}' requer contexto de execução.`
                );
            }
            return await obtenedor.chamar(visitante, []);
        }

        if (Object.prototype.hasOwnProperty.call(this.metodosEstaticos, nome)) {
            return this.metodosEstaticos[nome];
        }
        if (Object.prototype.hasOwnProperty.call(this.membrosEstaticos, nome)) {
            return this.membrosEstaticos[nome];
        }
        throw new ErroEmTempoDeExecucao(
            this.simboloOriginal,
            `Membro estático '${nome}' não encontrado na classe '${this.simboloOriginal?.lexema}'.`
        );
    }

    async definirEstatico(nome: string, valor: any, visitante?: InterpretadorInterface): Promise<void> {
        const definidor = this.encontrarDefinidor(nome, true);
        if (definidor) {
            if (!visitante) {
                throw new ErroEmTempoDeExecucao(
                    this.simboloOriginal,
                    `Definidor estático '${nome}' requer contexto de execução.`
                );
            }
            await definidor.chamar(visitante, [{ nome: null, valor }]);
            return;
        }

        this.membrosEstaticos[nome] = valor;
    }

    /**
     * Mescla sobrecargas da classe atual com as da superclasse.
     * Sobrecargas da subclasse com mesma assinatura substituem as da superclasse.
     */
    private mesclarComSuperclasse(
        metodosAtuais: DeleguaFuncao[],
        metodosSuperclasse: DeleguaFuncao[]
    ): DeleguaFuncao[] {
        const resultado = [...metodosAtuais];
        for (const metodoSuper of metodosSuperclasse) {
            const jaSobrescrito = metodosAtuais.some((m) => assinaturasIguais(m, metodoSuper));
            if (!jaSobrescrito) {
                resultado.push(metodoSuper);
            }
        }
        return resultado;
    }

    private obterSobrecargasDaSuperclasse(nome: string): DeleguaFuncao[] {
        if (!this.superClasse) return [];
        const metodoSuper = this.superClasse.metodos.hasOwnProperty(nome)
            ? this.superClasse.metodos[nome]
            : undefined;

        let sobrecargasSuper: DeleguaFuncao[] = [];
        if (metodoSuper) {
            sobrecargasSuper = Array.isArray(metodoSuper) ? metodoSuper : [metodoSuper];
        }

        // Recursivamente mesclar com a superclasse da superclasse
        const sobrecargasAncestral = this.superClasse.obterSobrecargasDaSuperclasse(nome);
        if (sobrecargasAncestral.length > 0) {
            const resultado = [...sobrecargasSuper];
            for (const metodoAnc of sobrecargasAncestral) {
                const jaSobrescrito = resultado.some((m) => assinaturasIguais(m, metodoAnc));
                if (!jaSobrescrito) {
                    resultado.push(metodoAnc);
                }
            }
            sobrecargasSuper = resultado;
        }

        return sobrecargasSuper;
    }

    encontrarMetodo(nome: string): DeleguaFuncao | MetodoPolimorfico {
        let metodosAtuais: DeleguaFuncao[] = [];

        if (this.metodos.hasOwnProperty(nome)) {
            const metodo = this.metodos[nome];
            metodosAtuais = Array.isArray(metodo) ? metodo : [metodo];
        }

        const metodosSuperclasse = this.obterSobrecargasDaSuperclasse(nome);

        let todasSobrecargas: DeleguaFuncao[];
        if (metodosAtuais.length > 0 && metodosSuperclasse.length > 0) {
            todasSobrecargas = this.mesclarComSuperclasse(metodosAtuais, metodosSuperclasse);
        } else if (metodosAtuais.length > 0) {
            todasSobrecargas = metodosAtuais;
        } else if (metodosSuperclasse.length > 0) {
            todasSobrecargas = metodosSuperclasse;
        } else {
            return undefined;
        }

        if (todasSobrecargas.length === 1) {
            return todasSobrecargas[0];
        }

        return new MetodoPolimorfico(nome, todasSobrecargas);
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
        let texto = `<descritor-tipo-classe nome=${this.simboloOriginal.lexema}`;
        for (let propriedade of this.propriedades) {
            texto += ` ${propriedade.nome.lexema}`;
            if (propriedade.tipo) {
                texto += `:${propriedade.tipo}`;
            }

            texto += ' ';
        }

        texto += ' />';
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
        if (inicializador instanceof MetodoPolimorfico) {
            return inicializador.aridade();
        }
        return inicializador ? inicializador.aridade() : 0;
    }

    async chamar(
        visitante: InterpretadorInterface,
        argumentos: any[]
    ): Promise<ObjetoDeleguaClasse> {
        if (this.classeEstatica) {
            throw new ErroEmTempoDeExecucao(
                this.simboloOriginal,
                `Não é possível instanciar a classe estática '${this.simboloOriginal?.lexema}'.`
            );
        }

        if (this.abstrata) {
            throw new ErroEmTempoDeExecucao(
                this.simboloOriginal,
                `Não é possível instanciar a classe abstrata '${this.simboloOriginal?.lexema}'.`
            );
        }

        const instancia = new ObjetoDeleguaClasse(this);

        const inicializador = this.encontrarMetodo('construtor');
        if (inicializador) {
            if (inicializador instanceof MetodoPolimorfico) {
                const construtorVinculado = inicializador.funcaoPorMetodoDeClasse(instancia);
                await construtorVinculado.chamar(visitante, argumentos);
            } else {
                // Para construtor não polimórfico, completar os argumentos
                // não preenchidos com valores indefinidos.
                const aridadeConstrutor = inicializador.aridade();
                if (argumentos.length < aridadeConstrutor) {
                    const diferenca = aridadeConstrutor - argumentos.length;
                    for (let i = 0; i < diferenca; i++) {
                        argumentos.push({ nome: null, valor: null });
                    }
                }
                const metodoConstrutor = inicializador.funcaoPorMetodoDeClasse(instancia);
                await metodoConstrutor.chamar(visitante, argumentos);
            }
        }

        return instancia;
    }
}
