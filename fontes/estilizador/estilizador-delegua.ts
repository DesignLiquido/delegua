import { Declaracao } from '../declaracoes';
import { FormatadorDelegua } from '../formatadores';
import { ConstrutoInterface } from '../interfaces/construtos';
import {
    EstilizadorInterface,
    OpcoesFormatacaoEstilizadorInterface,
    RegraEstilizacaoInterface,
    ViolacaoEstiloInterface,
} from '../interfaces/estilizador';
import { QuebradorDeLinha } from './quebrador-linha';

/**
 * Estilizador de código para Delégua.
 * Aplica transformações no AST para enforcar convenções e melhorar qualidade do código.
 */
export class EstilizadorDelegua implements EstilizadorInterface {
    regras: RegraEstilizacaoInterface[];
    private violacoes: ViolacaoEstiloInterface[];
    private modoValidacao: boolean;

    constructor(regras: RegraEstilizacaoInterface[] = []) {
        this.regras = regras;
        this.violacoes = [];
        this.modoValidacao = false;
    }

    adicionarRegra(regra: RegraEstilizacaoInterface): void {
        this.regras.push(regra);
    }

    removerRegra(nomeRegra: string): void {
        this.regras = this.regras.filter((r) => r.nome !== nomeRegra);
    }

    /**
     * Aplica as regras de estilização recursivamente em uma declaração.
     * @param declaracao A declaração a ser estilizada.
     * @returns A declaração estilizada.
     */
    private estilizarDeclaracao(declaracao: Declaracao): Declaracao {
        let declaracaoAtual = declaracao;

        // Aplica regras de declaração
        for (const regra of this.regras) {
            if (regra.aplicarEmDeclaracao) {
                if (this.modoValidacao) {
                    // Em modo validação, clona a declaração antes de aplicar
                    const declaracaoClonada = this.clonarDeclaracao(declaracaoAtual);
                    const declaracaoModificada = regra.aplicarEmDeclaracao(declaracaoClonada);

                    // Verifica se houve mudança
                    if (this.declaracaoFoiModificada(declaracaoAtual, declaracaoModificada)) {
                        this.violacoes.push({
                            regra: regra.nome,
                            mensagem: `${regra.descricao}`,
                            linha: declaracao.linha,
                            hashArquivo: declaracao.hashArquivo,
                            severidade: 'aviso',
                        });
                    }
                } else {
                    // Em modo normal, aplica a transformação
                    declaracaoAtual = regra.aplicarEmDeclaracao(declaracaoAtual);
                }
            }
        }

        // Recursivamente estiliza construtos dentro da declaração
        if (!this.modoValidacao) {
            this.estilizarCamposDeclaracao(declaracaoAtual);
        }

        return declaracaoAtual;
    }

    /**
     * Verifica se uma declaração foi modificada comparando propriedades relevantes.
     */
    private declaracaoFoiModificada(original: any, modificada: any): boolean {
        // Compara lexema do símbolo (para nomes)
        if (original.simbolo && modificada.simbolo) {
            if (original.simbolo.lexema !== modificada.simbolo.lexema) {
                return true;
            }
        }

        // Compara tipo
        if (original.tipo !== modificada.tipo) {
            return true;
        }

        // Compara tipoExplicito
        if (original.tipoExplicito !== modificada.tipoExplicito) {
            return true;
        }

        return false;
    }

    /**
     * Clona uma declaração de forma superficial.
     */
    private clonarDeclaracao(declaracao: any): any {
        // Cria um novo objeto com o mesmo protótipo
        const clone = Object.create(Object.getPrototypeOf(declaracao));

        // Copia todas as propriedades
        for (const chave in declaracao) {
            if (declaracao.hasOwnProperty(chave)) {
                // Para objetos aninhados, clona também
                if (typeof declaracao[chave] === 'object' && declaracao[chave] !== null) {
                    if (Array.isArray(declaracao[chave])) {
                        clone[chave] = [...declaracao[chave]];
                    } else {
                        clone[chave] = { ...declaracao[chave] };
                    }
                } else {
                    clone[chave] = declaracao[chave];
                }
            }
        }

        return clone;
    }

    /**
     * Estiliza construtos dentro de uma declaração.
     * @param declaracao A declaração cujos campos serão estilizados.
     */
    private estilizarCamposDeclaracao(declaracao: any): void {
        // Itera sobre as propriedades da declaração
        for (const chave in declaracao) {
            if (!declaracao.hasOwnProperty(chave)) continue;

            const valor = declaracao[chave];

            // Se é um construto, estiliza
            if (valor && typeof valor === 'object' && 'aceitar' in valor) {
                if (this.ehConstruto(valor)) {
                    declaracao[chave] = this.estilizarConstruto(valor);
                }
            }

            // Se é um array, estiliza cada elemento
            if (Array.isArray(valor)) {
                for (let i = 0; i < valor.length; i++) {
                    if (this.ehDeclaracao(valor[i])) {
                        valor[i] = this.estilizarDeclaracao(valor[i]);
                    } else if (this.ehConstruto(valor[i])) {
                        valor[i] = this.estilizarConstruto(valor[i]);
                    }
                }
            }
        }
    }

    /**
     * Aplica as regras de estilização em um construto.
     * @param construto O construto a ser estilizado.
     * @returns O construto estilizado.
     */
    private estilizarConstruto(construto: ConstrutoInterface): ConstrutoInterface {
        let construtoAtual = construto;

        // Aplica regras de construto
        for (const regra of this.regras) {
            if (regra.aplicarEmConstruto) {
                if (this.modoValidacao) {
                    // Em modo validação, não modifica, apenas verifica
                    const construtoOriginal = JSON.stringify(construtoAtual);
                    const construtoModificado = regra.aplicarEmConstruto(construtoAtual);

                    if (JSON.stringify(construtoModificado) !== construtoOriginal) {
                        this.violacoes.push({
                            regra: regra.nome,
                            mensagem: `${regra.descricao} não foi aplicada`,
                            linha: (construto as any).linha || 0,
                            hashArquivo: -1,
                            severidade: 'aviso',
                        });
                    }
                } else {
                    construtoAtual = regra.aplicarEmConstruto(construtoAtual);
                }
            }
        }

        // Recursivamente estiliza campos do construto
        this.estilizarCamposConstruto(construtoAtual);

        return construtoAtual;
    }

    /**
     * Estiliza campos dentro de um construto.
     * @param construto O construto cujos campos serão estilizados.
     */
    private estilizarCamposConstruto(construto: any): void {
        for (const chave in construto) {
            if (!construto.hasOwnProperty(chave)) continue;

            const valor = construto[chave];

            if (valor && typeof valor === 'object' && 'aceitar' in valor) {
                if (this.ehConstruto(valor)) {
                    construto[chave] = this.estilizarConstruto(valor);
                } else if (this.ehDeclaracao(valor)) {
                    construto[chave] = this.estilizarDeclaracao(valor);
                }
            }

            if (Array.isArray(valor)) {
                for (let i = 0; i < valor.length; i++) {
                    if (this.ehDeclaracao(valor[i])) {
                        valor[i] = this.estilizarDeclaracao(valor[i]);
                    } else if (this.ehConstruto(valor[i])) {
                        valor[i] = this.estilizarConstruto(valor[i]);
                    }
                }
            }
        }
    }

    /**
     * Verifica se um objeto é uma Declaração.
     */
    private ehDeclaracao(obj: any): obj is Declaracao {
        return (
            obj &&
            typeof obj === 'object' &&
            'paraTexto' in obj &&
            'linha' in obj &&
            'hashArquivo' in obj
        );
    }

    /**
     * Verifica se um objeto é um Construto.
     */
    private ehConstruto(obj: any): obj is ConstrutoInterface {
        return obj && typeof obj === 'object' && 'aceitar' in obj && !('paraTexto' in obj);
    }

    estilizar(declaracoes: Declaracao[]): Declaracao[] {
        this.modoValidacao = false;
        this.violacoes = [];

        const declaracoesEstilizadas: Declaracao[] = [];

        for (const declaracao of declaracoes) {
            declaracoesEstilizadas.push(this.estilizarDeclaracao(declaracao));
        }

        return declaracoesEstilizadas;
    }

    validar(declaracoes: Declaracao[]): ViolacaoEstiloInterface[] {
        this.modoValidacao = true;
        this.violacoes = [];

        // Aplica estilização em modo validação (não modifica, apenas detecta violações)
        for (const declaracao of declaracoes) {
            this.estilizarDeclaracao(declaracao);
        }

        const violacoesEncontradas = [...this.violacoes];
        this.violacoes = [];
        this.modoValidacao = false;

        return violacoesEncontradas;
    }

    estilizarEFormatar(
        declaracoes: Declaracao[],
        opcoesFormatacao: OpcoesFormatacaoEstilizadorInterface = {}
    ): string {
        const declaracoesEstilizadas = this.estilizar(declaracoes);
        const separadorLinha = opcoesFormatacao.quebraLinha || '\n';
        const tamanhoIndentacao = opcoesFormatacao.tamanhoIndentacao ?? 4;

        const formatador = new FormatadorDelegua(separadorLinha, tamanhoIndentacao, {
            delimitadorTexto: opcoesFormatacao.delimitadorTexto,
        });

        let codigo = formatador.formatar(declaracoesEstilizadas);

        if (opcoesFormatacao.maximoCaracteresPorLinha !== undefined) {
            const quebrador = new QuebradorDeLinha(
                opcoesFormatacao.maximoCaracteresPorLinha,
                tamanhoIndentacao,
                separadorLinha
            );
            codigo = quebrador.quebrar(codigo);
        }

        return codigo;
    }
}
