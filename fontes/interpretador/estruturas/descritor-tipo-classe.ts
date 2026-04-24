import { PropriedadeClasse } from '../../declaracoes';
import { ErroEmTempoDeExecucao } from '../../excecoes';
import { InterpretadorInterface, SimboloInterface } from '../../interfaces';
import { Chamavel } from './chamavel';
import { DeleguaFuncao } from './delegua-funcao';
import { MetodoPolimorfico } from './metodo-polimorfico';
import { ObjetoDeleguaClasse } from './objeto-delegua-classe';

const mapaDeNormalizacao: { [chave: string]: string } = {
    numero: 'número',
    logico: 'lógico',
    funcao: 'função',
    dicionario: 'dicionário',
    modulo: 'módulo',
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
    simboloOriginal: SimboloInterface | undefined;
    superClasses: DescritorTipoClasse[];
    /** OReM (Ordem de Resolução de Métodos, ou _Method Resolution Order_) calculado via C3.
     * Inclui a própria classe como primeiro elemento. */
    orem: DescritorTipoClasse[];
    metodos: { [nome: string]: DeleguaFuncao | DeleguaFuncao[] };
    metodosEstaticos: { [nome: string]: DeleguaFuncao | DeleguaFuncao[] };
    membrosEstaticos: { [nome: string]: any };
    obtenedores: { [nome: string]: DeleguaFuncao };
    definidores: { [nome: string]: DeleguaFuncao };
    obtenedoresEstaticos: { [nome: string]: DeleguaFuncao };
    definidoresEstaticos: { [nome: string]: DeleguaFuncao };
    propriedades: PropriedadeClasse[];
    dialetoRequerExpansaoPropriedadesEspacoMemoria: boolean = false;
    dialetoRequerDeclaracaoPropriedades: boolean;
    abstrata: boolean;
    estrangeira: boolean;
    classeEstatica: boolean;
    metodosAbstratos: string[];
    acessoMetodos: { [nome: string]: 'privado' | 'protegido' | 'publico' };
    acessoPropriedades: { [nome: string]: 'privado' | 'protegido' | 'publico' };
    sombrearPropriedadesDeClasse: boolean = false;

    /** Obtenedor de compat: primeiro pai direto (usado por tradutores e partes do interpretador). */
    get superClasse(): DescritorTipoClasse | null {
        return this.superClasses[0] ?? null;
    }

    /** Definidor de compat: atribui um único pai direto (usado pela atribuição implícita de OBJETO_BASE). */
    set superClasse(v: DescritorTipoClasse | null) {
        this.superClasses = v ? [v] : [];
    }

    constructor(
        simboloOriginal?: SimboloInterface,
        superClasses?: DescritorTipoClasse | DescritorTipoClasse[],
        metodos?: { [nome: string]: DeleguaFuncao | DeleguaFuncao[] },
        propriedades?: PropriedadeClasse[]
    ) {
        super();
        this.simboloOriginal = simboloOriginal;
        if (Array.isArray(superClasses)) {
            this.superClasses = superClasses;
        } else if (superClasses) {
            this.superClasses = [superClasses];
        } else {
            this.superClasses = [];
        }
        this.orem = [this];
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
        this.estrangeira = false;
        this.classeEstatica = false;
        this.metodosAbstratos = [];
        this.acessoMetodos = {};
        this.acessoPropriedades = {};
    }

    // ─── C3 OReM ──────────────────────────────────────────────────────────────

    private static mesclaC3(listas: DescritorTipoClasse[][]): DescritorTipoClasse[] {
        const resultado: DescritorTipoClasse[] = [];

        while (true) {
            const listasNaoVazias = listas.filter((l) => l.length > 0);
            if (listasNaoVazias.length === 0) break;

            let candidato: DescritorTipoClasse | null = null;
            for (const lista of listasNaoVazias) {
                const cabeca = lista[0];
                const naCauda = listasNaoVazias.some((l) => l.slice(1).indexOf(cabeca) >= 0);
                if (!naCauda) {
                    candidato = cabeca;
                    break;
                }
            }

            if (candidato === null) {
                throw new ErroEmTempoDeExecucao(
                    undefined,
                    'Hierarquia de classes inconsistente: não foi possível calcular o OReM (C3).'
                );
            }

            resultado.push(candidato);
            for (const lista of listas) {
                const idx = lista.indexOf(candidato);
                if (idx === 0) lista.shift();
            }
        }

        return resultado;
    }

    /** Calcula e armazena o OReM (linearização C3) para esta classe e retorna a lista resultante. */
    static computarOReM(cls: DescritorTipoClasse): DescritorTipoClasse[] {
        if (cls.superClasses.length === 0) {
            return [cls];
        }

        const oremsDePais = cls.superClasses.map((p) => DescritorTipoClasse.computarOReM(p));
        const listas = [...oremsDePais.map((m) => [...m]), [...cls.superClasses]];
        return [cls, ...DescritorTipoClasse.mesclaC3(listas)];
    }

    // ─── Verificação abstrata ─────────────────────────────────────────────────

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

    // ─── Obtenedores e definidores ────────────────────────────────────────────

    encontrarObtenedor(nome: string, estatico: boolean = false): DeleguaFuncao | undefined {
        const mapa = estatico ? this.obtenedoresEstaticos : this.obtenedores;
        if (Object.prototype.hasOwnProperty.call(mapa, nome)) {
            return mapa[nome];
        }

        for (const ancestral of this.orem.slice(1)) {
            const mapaAnc = estatico ? ancestral.obtenedoresEstaticos : ancestral.obtenedores;
            if (Object.prototype.hasOwnProperty.call(mapaAnc, nome)) {
                return mapaAnc[nome];
            }
        }

        return undefined;
    }

    encontrarDefinidor(nome: string, estatico: boolean = false): DeleguaFuncao | undefined {
        const mapa = estatico ? this.definidoresEstaticos : this.definidores;
        if (Object.prototype.hasOwnProperty.call(mapa, nome)) {
            return mapa[nome];
        }

        for (const ancestral of this.orem.slice(1)) {
            const mapaAnc = estatico ? ancestral.definidoresEstaticos : ancestral.definidores;
            if (Object.prototype.hasOwnProperty.call(mapaAnc, nome)) {
                return mapaAnc[nome];
            }
        }

        return undefined;
    }

    // ─── Membros estáticos ────────────────────────────────────────────────────

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

    async definirEstatico(
        nome: string,
        valor: any,
        visitante?: InterpretadorInterface
    ): Promise<void> {
        const definidor = this.encontrarDefinidor(nome, true);
        if (definidor) {
            if (!visitante) {
                throw new ErroEmTempoDeExecucao(
                    this.simboloOriginal,
                    `Definidor estático '${nome}' requer contexto de execução.`
                );
            }
            await definidor.chamar(visitante, [{ nome: null as unknown as string, valor }]);
            return;
        }

        this.membrosEstaticos[nome] = valor;
    }

    // ─── Resolução de métodos via OReM ─────────────────────────────────────────

    /**
     * Mescla sobrecargas da classe atual com as de ancestrais (respeitando MRO).
     * Sobrecargas da subclasse com mesma assinatura substituem as do ancestral.
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
        let sobrecarga: DeleguaFuncao[] = [];
        // Percorre a OReM[1:] na ordem do OReM — o primeiro ancestral vence
        for (const ancestral of this.orem.slice(1)) {
            if (!ancestral.metodos.hasOwnProperty(nome)) continue;
            const metodo = ancestral.metodos[nome];
            const novos = Array.isArray(metodo) ? metodo : [metodo];
            for (const m of novos) {
                if (!sobrecarga.some((s) => assinaturasIguais(s, m))) {
                    sobrecarga.push(m);
                }
            }
        }
        return sobrecarga;
    }

    encontrarMetodo(nome: string): DeleguaFuncao | MetodoPolimorfico | undefined {
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

    encontrarPropriedade(nome: string): PropriedadeClasse | undefined {
        if (nome in this.propriedades) {
            return (this.propriedades as any)[nome] as PropriedadeClasse;
        }

        for (const ancestral of this.orem.slice(1)) {
            if (nome in ancestral.propriedades) {
                return (ancestral.propriedades as any)[nome] as PropriedadeClasse;
            }
        }

        if (this.dialetoRequerDeclaracaoPropriedades) {
            throw new ErroEmTempoDeExecucao(
                this.simboloOriginal,
                `Propriedade "${nome}" não declarada na classe ${this.simboloOriginal?.lexema}.`
            );
        }

        return undefined;
    }

    // ─── Representação textual ────────────────────────────────────────────────

    /**
     * Método utilizado por Delégua para representar esta classe quando impressa.
     * @returns {string} A representação da classe como texto.
     */
    paraTexto(): string {
        const nome = this.simboloOriginal?.lexema ?? 'Objeto';
        const nomesMetodos = Object.keys(this.metodos).join(', ');
        const nomesPropriedades = this.propriedades.map((p) => p.nome.lexema).join(', ');
        return `<[ ${nome} estático métodos=[${nomesMetodos}] propriedades=[${nomesPropriedades}] ]>`;
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

        if (this.estrangeira) {
            throw new ErroEmTempoDeExecucao(
                this.simboloOriginal,
                `Não é possível instanciar a classe estrangeira '${this.simboloOriginal?.lexema}' diretamente.`
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
