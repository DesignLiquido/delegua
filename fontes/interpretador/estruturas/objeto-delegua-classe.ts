import { ErroEmTempoDeExecucao } from '../../excecoes';
import { InterpretadorInterface, SimboloInterface } from '../../interfaces';
import { DescritorTipoClasse } from './descritor-tipo-classe';

/**
 * A instância de uma classe em Delégua.
 * Possui propriedades e métodos. Propriedades são definidas localmente.
 * Métodos são extraídos do descritor da classe, uma `DeleguaClasse`.
 */
export class ObjetoDeleguaClasse {
    classe: DescritorTipoClasse;
    propriedades: { [nome: string]: any };

    constructor(classe: DescritorTipoClasse) {
        this.classe = classe;
        this.propriedades = {};
        if (this.classe.superClasse) {
            for (let propriedade of this.classe.superClasse.propriedades) {
                if (propriedade.estatico) continue;
                if (propriedade.autoObter || propriedade.autoDefinir) {
                    this.propriedades['_' + propriedade.nome.lexema] = undefined;
                } else {
                    this.propriedades[propriedade.nome.lexema] = undefined;
                }
            }
        }

        for (let propriedade of classe.propriedades) {
            if (propriedade.estatico) continue;
            if (propriedade.autoObter || propriedade.autoDefinir) {
                this.propriedades['_' + propriedade.nome.lexema] = undefined;
            } else {
                this.propriedades[propriedade.nome.lexema] = undefined;
            }
        }
    }

    private verificarAcessoLeitura(
        nome: string,
        simbolo: SimboloInterface,
        visitante?: InterpretadorInterface
    ): void {
        const acesso = this.classe.acessoPropriedades?.[nome] ?? this.classe.acessoMetodos?.[nome];
        if (!acesso || acesso === 'publico') return;

        const classeAtual = (visitante as any)?.classeAtualEmExecucao;
        if (acesso === 'privado') {
            if (classeAtual !== this.classe) {
                throw new ErroEmTempoDeExecucao(
                    simbolo,
                    `Membro '${nome}' é privado e não pode ser acessado fora da classe '${this.classe.simboloOriginal?.lexema}'.`
                );
            }
        } else if (acesso === 'protegido') {
            let cls = classeAtual;
            let eAcessivel = false;
            while (cls) {
                if (cls === this.classe) { eAcessivel = true; break; }
                cls = cls.superClasse;
            }
            if (!eAcessivel) {
                throw new ErroEmTempoDeExecucao(
                    simbolo,
                    `Membro '${nome}' é protegido e não pode ser acessado fora da hierarquia da classe '${this.classe.simboloOriginal?.lexema}'.`
                );
            }
        }
    }

    async obter(simbolo: SimboloInterface, visitante?: InterpretadorInterface): Promise<any> {
        const obtenedor = this.classe.encontrarObtenedor(simbolo.lexema);
        if (obtenedor) {
            if (!visitante) {
                throw new ErroEmTempoDeExecucao(simbolo, `Obtenedor '${simbolo.lexema}' requer contexto de execução.`);
            }
            const metodoObtenedor = obtenedor.funcaoPorMetodoDeClasse(this);
            return await metodoObtenedor.chamar(visitante, []);
        }

        // Auto-property: acessa o campo de armazenamento interno '_nome'
        const propAuto = this.classe.propriedades.find(p => p.nome.lexema === simbolo.lexema);
        if (propAuto?.autoObter) {
            this.verificarAcessoLeitura(simbolo.lexema, simbolo, visitante);
            return this.propriedades['_' + simbolo.lexema];
        }
        if (propAuto && propAuto.autoDefinir && !propAuto.autoObter) {
            throw new ErroEmTempoDeExecucao(simbolo, `Propriedade '${simbolo.lexema}' é somente-escrita.`);
        }

        if (this.propriedades.hasOwnProperty(simbolo.lexema)) {
            this.verificarAcessoLeitura(simbolo.lexema, simbolo, visitante);
            return this.propriedades[simbolo.lexema];
        }

        if (Object.prototype.hasOwnProperty.call(this.classe.membrosEstaticos, simbolo.lexema)) {
            return await this.classe.obterEstatico(simbolo.lexema, visitante);
        }

        const metodo = this.classe.encontrarMetodo(simbolo.lexema);
        if (metodo) {
            this.verificarAcessoLeitura(simbolo.lexema, simbolo, visitante);
            return metodo.funcaoPorMetodoDeClasse(this);
        }

        throw new ErroEmTempoDeExecucao(
            simbolo,
            `Método ou propriedade "${simbolo.lexema}" não existe neste objeto.`
        );
    }

    obterMetodo(nomeMetodo: string): any {
        const metodo = this.classe.encontrarMetodo(nomeMetodo);
        if (metodo) return metodo.funcaoPorMetodoDeClasse(this);

        throw new ErroEmTempoDeExecucao(null, `Método "${nomeMetodo}" não existe neste objeto.`);
    }

    obterPropriedade(nomePropriedade: string): any {
        if (this.propriedades.hasOwnProperty(nomePropriedade)) {
            return this.propriedades[nomePropriedade];
        }

        throw new ErroEmTempoDeExecucao(
            null,
            `Propriedade "${nomePropriedade}" não existe neste objeto.`
        );
    }

    async definir(simbolo: SimboloInterface, valor: any, visitante?: InterpretadorInterface): Promise<void> {
        const definidor = this.classe.encontrarDefinidor(simbolo.lexema);
        if (definidor) {
            if (!visitante) {
                throw new ErroEmTempoDeExecucao(simbolo, `Definidor '${simbolo.lexema}' requer contexto de execução.`);
            }
            const metodoDefinidor = definidor.funcaoPorMetodoDeClasse(this);
            await metodoDefinidor.chamar(visitante, [{ nome: null, valor }]);
            return;
        }

        // Auto-property: armazena no campo interno '_nome'
        const propAuto = this.classe.propriedades.find(p => p.nome.lexema === simbolo.lexema);
        if (propAuto?.autoDefinir) {
            this.verificarAcessoLeitura(simbolo.lexema, simbolo, visitante);
            this.propriedades['_' + simbolo.lexema] = valor;
            return;
        }
        if (propAuto && propAuto.autoObter && !propAuto.autoDefinir) {
            throw new ErroEmTempoDeExecucao(simbolo, `Propriedade '${simbolo.lexema}' é somente-leitura.`);
        }

        if (Object.prototype.hasOwnProperty.call(this.classe.membrosEstaticos, simbolo.lexema)) {
            await this.classe.definirEstatico(simbolo.lexema, valor, visitante);
            return;
        }

        // Verificar acesso antes da atribuição.
        this.verificarAcessoLeitura(simbolo.lexema, simbolo, visitante);

        if (
            this.classe.dialetoRequerDeclaracaoPropriedades &&
            !this.propriedades.hasOwnProperty(simbolo.lexema)
        ) {
            throw new ErroEmTempoDeExecucao(
                simbolo,
                `Propriedade "${simbolo.lexema}" não foi definida na declaração da classe ${this.classe.simboloOriginal.lexema}.`
            );
        }

        this.propriedades[simbolo.lexema] = valor;
    }

    /**
     * Método utilizado por Delégua para inspecionar este objeto em depuração.
     * @returns {string} A representação do objeto como texto.
     */
    paraTexto(): string {
        return '<objeto nome=' + this.classe.simboloOriginal.lexema + ' />';
    }

    /**
     * Método utilizado pelo VSCode para representar este objeto quando impresso.
     * @returns {string} A representação do objeto como texto.
     */
    toString(): string {
        return this.paraTexto();
    }
}
