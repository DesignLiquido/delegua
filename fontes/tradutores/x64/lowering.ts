import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    DefinirValor,
    Leia,
    Literal,
    Logico,
    TipoDe,
    Unario,
    Variavel,
    Vetor,
} from '../../construtos';
import {
    Bloco,
    Classe,
    Const,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Falhar,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    Para,
    ParaCada,
    Retorna,
    Se,
    Tente,
    Var,
} from '../../declaracoes';
import { ConstrutoInterface } from '../../interfaces/construtos/construto-interface';
import { IRTipo, resolverTipoElementoVetor, resolverTipoEscalar } from './tipos-x64';
import {
    IRArranjoInfo,
    IRBloco,
    IRFuncao,
    IRInstrucao,
    IRPrograma,
    IRTerminador,
    IRValor,
    OperadorBinario,
    novoBloco,
    novaFuncao,
    valorArgumentoFisico,
    valorConstante,
    valorRegistrador,
    valorRotulo,
} from './ir';

const OPERADORES_BINARIOS = new Set(['+', '-', '*', '/', '%', '<', '>', '<=', '>=', '==', '!=']);

/**
 * Percorre a AST (declarações e construtos) chamando `visitante` em pré-ordem.
 * `visitante` retorna `false` para podar a recursão num nó (usado para não descer em
 * corpos de função aninhada, que têm escopo próprio e não são suportados aqui).
 */
function percorrer(no: unknown, visitante: (no: unknown) => boolean): void {
    if (!no || typeof no !== 'object') return;
    if (Array.isArray(no)) {
        for (const item of no) percorrer(item, visitante);
        return;
    }

    if (!visitante(no)) return;

    const objeto = no as Record<string, unknown> & { constructor: { name: string } };
    const nome = objeto.constructor?.name;

    switch (nome) {
        case 'Bloco':
            percorrer((objeto as unknown as Bloco).declaracoes, visitante);
            break;
        case 'Se': {
            const se = objeto as unknown as Se;
            percorrer(se.condicao, visitante);
            percorrer(se.caminhoEntao, visitante);
            if (se.caminhosSeSenao) {
                for (const caminho of se.caminhosSeSenao) {
                    percorrer(caminho.condicao, visitante);
                    percorrer(caminho.caminho, visitante);
                }
            }
            if (se.caminhoSenao) percorrer(se.caminhoSenao, visitante);
            break;
        }
        case 'Enquanto': {
            const enquanto = objeto as unknown as Enquanto;
            percorrer(enquanto.condicao, visitante);
            percorrer(enquanto.corpo, visitante);
            break;
        }
        case 'Para': {
            const para = objeto as unknown as Para;
            if (para.inicializador) percorrer(para.inicializador, visitante);
            percorrer(para.condicao, visitante);
            percorrer(para.incrementar, visitante);
            percorrer(para.corpo, visitante);
            break;
        }
        case 'ParaCada': {
            const paraCada = objeto as unknown as ParaCada;
            percorrer(paraCada.vetorOuDicionario, visitante);
            percorrer(paraCada.corpo, visitante);
            break;
        }
        case 'Fazer': {
            const fazer = objeto as unknown as Fazer;
            percorrer(fazer.caminhoFazer, visitante);
            percorrer(fazer.condicaoEnquanto, visitante);
            break;
        }
        case 'Retorna':
            if ((objeto as unknown as Retorna).valor) percorrer((objeto as unknown as Retorna).valor, visitante);
            break;
        case 'Expressao':
            percorrer((objeto as unknown as Expressao).expressao, visitante);
            break;
        case 'Var':
            if ((objeto as unknown as Var).inicializador) percorrer((objeto as unknown as Var).inicializador, visitante);
            break;
        case 'Const':
            percorrer((objeto as unknown as Const).inicializador, visitante);
            break;
        case 'Escreva':
            percorrer((objeto as unknown as Escreva).argumentos, visitante);
            break;
        case 'Escolha': {
            const escolha = objeto as unknown as Escolha;
            percorrer(escolha.identificadorOuLiteral, visitante);
            for (const caminho of escolha.caminhos ?? []) {
                percorrer(caminho.condicoes, visitante);
                percorrer(caminho.declaracoes, visitante);
            }
            if (escolha.caminhoPadrao) percorrer(escolha.caminhoPadrao.declaracoes, visitante);
            break;
        }
        case 'Falhar':
            if ((objeto as unknown as Falhar).explicacao) percorrer((objeto as unknown as Falhar).explicacao, visitante);
            break;
        case 'Variavel':
        case 'Literal':
        case 'Importar':
        case 'Classe':
        case 'Tente':
        case 'FuncaoConstruto':
        case 'FuncaoDeclaracao':
            break;
        case 'Binario': {
            const binario = objeto as unknown as Binario;
            percorrer(binario.esquerda, visitante);
            percorrer(binario.direita, visitante);
            break;
        }
        case 'Unario':
            percorrer((objeto as unknown as Unario).operando, visitante);
            break;
        case 'Logico': {
            const logico = objeto as unknown as Logico;
            percorrer(logico.esquerda, visitante);
            percorrer(logico.direita, visitante);
            break;
        }
        case 'Vetor':
            percorrer((objeto as unknown as Vetor).elementos, visitante);
            break;
        case 'Chamada': {
            const chamada = objeto as unknown as Chamada;
            percorrer(chamada.entidadeChamada, visitante);
            percorrer(chamada.argumentos, visitante);
            break;
        }
        case 'AcessoIndiceVariavel': {
            const acesso = objeto as unknown as AcessoIndiceVariavel;
            percorrer(acesso.entidadeChamada, visitante);
            percorrer(acesso.indice, visitante);
            break;
        }
        case 'AtribuicaoPorIndice': {
            const atribuicao = objeto as unknown as AtribuicaoPorIndice;
            percorrer(atribuicao.objeto, visitante);
            percorrer(atribuicao.indice, visitante);
            percorrer(atribuicao.valor, visitante);
            break;
        }
        case 'Atribuir': {
            const atribuir = objeto as unknown as Atribuir;
            percorrer(atribuir.alvo, visitante);
            if (atribuir.indice) percorrer(atribuir.indice, visitante);
            percorrer(atribuir.valor, visitante);
            break;
        }
        case 'Agrupamento':
            percorrer((objeto as unknown as Agrupamento).expressao, visitante);
            break;
        case 'DefinirValor': {
            const definirValor = objeto as unknown as DefinirValor;
            percorrer(definirValor.objeto, visitante);
            percorrer(definirValor.valor, visitante);
            break;
        }
        case 'AcessoMetodo':
            percorrer((objeto as unknown as AcessoMetodo).objeto, visitante);
            break;
        case 'TipoDe':
            percorrer((objeto as unknown as TipoDe).valor, visitante);
            break;
        case 'Leia':
            percorrer((objeto as unknown as Leia).argumentos, visitante);
            break;
        default:
            break;
    }
}

function coletarReferenciasEDeclaracoes(corpo: Declaracao[]): { referenciadas: Set<string>; declaradas: Set<string> } {
    const referenciadas = new Set<string>();
    const declaradas = new Set<string>();

    percorrer(corpo, (no) => {
        const objeto = no as Record<string, unknown> & { constructor: { name: string } };
        const nomeClasse = objeto.constructor?.name;
        if (nomeClasse === 'Variavel') {
            referenciadas.add(((no as Variavel).simbolo as { lexema: string }).lexema);
        } else if (nomeClasse === 'Var' || nomeClasse === 'Const') {
            declaradas.add(((no as Var | Const).simbolo as { lexema: string }).lexema);
        }
        if (nomeClasse === 'FuncaoConstruto' || nomeClasse === 'FuncaoDeclaracao') return false;
        return true;
    });

    return { referenciadas, declaradas };
}

function inferirTipoRetorno(corpo: Declaracao[]): string | undefined {
    let encontrado: string | undefined;
    percorrer(corpo, (no) => {
        const objeto = no as Record<string, unknown> & { constructor: { name: string } };
        const nomeClasse = objeto.constructor?.name;
        if (nomeClasse === 'Retorna' && !encontrado) {
            const retorna = no as Retorna;
            if (retorna.valor?.tipo) encontrado = retorna.valor.tipo;
        }
        if (nomeClasse === 'FuncaoConstruto' || nomeClasse === 'FuncaoDeclaracao') return false;
        return true;
    });
    return encontrado;
}

interface AssinaturaFuncao {
    parametros: IRTipo[];
    tipoRetorno: IRTipo;
}

interface InfoLocal {
    classe: 'escalar' | 'array';
    tipo: IRTipo;
}

/** Constrói o IR de uma única função (ou do "principal" implícito) mantendo o bloco atual. */
class ConstrutorFuncao {
    funcao: IRFuncao;
    private blocoAtualId: string;
    private encerrado = false;
    private contadorTemp = 0;
    private contadorBloco = 0;
    private locais = new Map<string, InfoLocal>();

    constructor(
        nome: string,
        ehImplicitaTopo: boolean,
        private programa: IRPrograma,
        private assinaturas: Map<string, AssinaturaFuncao>
    ) {
        this.funcao = novaFuncao(nome, ehImplicitaTopo);
        const entrada = novoBloco('entrada');
        this.funcao.blocos.set('entrada', entrada);
        this.funcao.ordemBlocos.push('entrada');
        this.funcao.blocoEntrada = 'entrada';
        this.blocoAtualId = 'entrada';
    }

    declararLocalEscalar(nome: string, tipo: IRTipo): void {
        this.locais.set(nome, { classe: 'escalar', tipo });
    }

    declararLocalArray(nome: string, info: IRArranjoInfo): void {
        this.locais.set(nome, { classe: 'array', tipo: info.tipoElemento });
        this.funcao.arranjosLocais.set(nome, info);
    }

    private blocoAtual(): IRBloco {
        return this.funcao.blocos.get(this.blocoAtualId)!;
    }

    emitir(instrucao: IRInstrucao): void {
        if (this.encerrado) return;
        this.blocoAtual().instrucoes.push(instrucao);
    }

    novoTemp(): string {
        return `%t${this.contadorTemp++}`;
    }

    novoBlocoId(): string {
        return `bloco_${this.contadorBloco++}`;
    }

    criarBloco(): string {
        const id = this.novoBlocoId();
        this.funcao.blocos.set(id, novoBloco(id));
        this.funcao.ordemBlocos.push(id);
        return id;
    }

    irPara(id: string): void {
        this.blocoAtualId = id;
        this.encerrado = false;
    }

    terminarCom(terminador: IRTerminador): void {
        if (this.encerrado) return;
        this.blocoAtual().terminador = terminador;
        this.encerrado = true;
    }

    finalizar(): void {
        if (!this.encerrado) {
            this.terminarCom({ op: 'retorno' });
        }
    }

    resolverEscalar(nome: string): InfoLocal | undefined {
        const local = this.locais.get(nome);
        if (local) return local;
        if (this.programa.globaisEscalares.has(nome)) {
            return { classe: 'escalar', tipo: this.programa.globaisEscalares.get(nome)! };
        }
        if (this.programa.globaisArranjos.has(nome)) {
            const info = this.programa.globaisArranjos.get(nome)!;
            return { classe: 'array', tipo: info.tipoElemento };
        }
        return undefined;
    }

    resolverArranjoInfo(nome: string): IRArranjoInfo {
        const local = this.funcao.arranjosLocais.get(nome);
        if (local) return local;
        const global = this.programa.globaisArranjos.get(nome);
        if (global) return global;
        throw new Error(`Vetor '${nome}' não declarado.`);
    }

    ehLocalEscalar(nome: string): boolean {
        const local = this.locais.get(nome);
        return !!local && local.classe === 'escalar';
    }

    lerEscalar(nome: string): IRValor {
        const info = this.resolverEscalar(nome);
        if (!info) {
            throw new Error(
                `Variável '${nome}' não declarada, não é parâmetro/local desta função, nem uma ` +
                    `variável global (do escopo principal) referenciada por alguma função — o ` +
                    `tradutor para x64 não suporta capturar variáveis locais de outras funções.`
            );
        }
        if (info.classe === 'array') {
            throw new Error(`'${nome}' é um vetor; use acesso por índice.`);
        }
        if (this.locais.has(nome)) {
            return valorRegistrador(nome);
        }
        const temp = this.novoTemp();
        this.emitir({ op: 'carregarGlobal', dst: temp, rotulo: nome });
        return valorRegistrador(temp);
    }

    escreverEscalar(nome: string, valor: IRValor): void {
        const info = this.resolverEscalar(nome);
        if (!info) {
            throw new Error(`Variável '${nome}' não declarada.`);
        }
        if (this.locais.has(nome)) {
            this.emitir({ op: 'copia', dst: nome, src: valor });
        } else {
            this.emitir({ op: 'armazenarGlobal', rotulo: nome, valor });
        }
    }

    assinaturaDe(nomeFuncao: string): AssinaturaFuncao {
        const assinatura = this.assinaturas.get(nomeFuncao);
        if (!assinatura) {
            throw new Error(`Função '${nomeFuncao}' não declarada — o tradutor para x64 não suporta chamadas indiretas.`);
        }
        return assinatura;
    }

    literalTexto(valor: string): string {
        for (const [rotulo, texto] of this.programa.literaisTexto) {
            if (texto === valor) return rotulo;
        }
        const rotulo = `str_${this.programa.literaisTexto.size}`;
        this.programa.literaisTexto.set(rotulo, valor);
        return rotulo;
    }

    // --- Declarações ---

    lowerBloco(declaracoes: Declaracao[]): void {
        for (const declaracao of declaracoes) this.lowerDeclaracao(declaracao);
    }

    lowerDeclaracao(declaracao: Declaracao): void {
        const nomeClasse = (declaracao as unknown as { constructor: { name: string } }).constructor.name;
        switch (nomeClasse) {
            case 'Bloco':
                this.lowerBloco((declaracao as unknown as Bloco).declaracoes);
                return;
            case 'Expressao':
                this.lowerConstruto((declaracao as unknown as Expressao).expressao);
                return;
            case 'Var':
                this.lowerVarOuConst(declaracao as unknown as Var, false);
                return;
            case 'Const':
                this.lowerVarOuConst(declaracao as unknown as Const, true);
                return;
            case 'Escreva':
                this.lowerEscreva(declaracao as unknown as Escreva);
                return;
            case 'Se':
                this.lowerSe(declaracao as unknown as Se);
                return;
            case 'Enquanto':
                this.lowerEnquanto(declaracao as unknown as Enquanto);
                return;
            case 'Para':
                this.lowerPara(declaracao as unknown as Para);
                return;
            case 'ParaCada':
                this.lowerParaCada(declaracao as unknown as ParaCada);
                return;
            case 'Fazer':
                this.lowerFazer(declaracao as unknown as Fazer);
                return;
            case 'Escolha':
                this.lowerEscolha(declaracao as unknown as Escolha);
                return;
            case 'Retorna':
                this.lowerRetorna(declaracao as unknown as Retorna);
                return;
            case 'Importar':
                return;
            case 'Classe':
                throw new Error('Classes não são suportadas pelo tradutor para x64.');
            case 'Tente':
                throw new Error('Tente/pegue não é suportado pelo tradutor para x64.');
            case 'Falhar':
                throw new Error('Falhar não é suportado pelo tradutor para x64.');
            default:
                throw new Error(`Declaração '${nomeClasse}' não suportada pelo tradutor para x64.`);
        }
    }

    /**
     * Uma `var`/`const` de topo referenciada por alguma função já foi pré-registrada como
     * global (ver LoweringX64.lowerPrograma passo 1) — aqui só emitimos a inicialização
     * apontando para ela, sem criar um slot local/SSA.
     */
    private lowerVarOuConst(declaracao: Var | Const, ehConst: boolean): void {
        const nome = declaracao.simbolo.lexema;
        const contexto = `${ehConst ? 'Constante' : 'Variável'} '${nome}'`;
        const ehGlobalPromovida = this.programa.globaisEscalares.has(nome) || this.programa.globaisArranjos.has(nome);

        if (declaracao.inicializador instanceof Vetor) {
            const elementos = declaracao.inicializador.elementos;
            let info: IRArranjoInfo;
            if (ehGlobalPromovida) {
                info = this.programa.globaisArranjos.get(nome)!;
            } else {
                const tipoElemento = resolverTipoElementoVetor(declaracao.tipo, contexto);
                info = { id: nome, tamanho: elementos.length, tipoElemento };
                this.declararLocalArray(nome, info);
            }
            elementos.forEach((elemento, indice) => {
                const valor = this.lowerConstruto(elemento);
                this.emitir({ op: 'indiceEscrever', arranjo: nome, indice: valorConstante(indice), valor });
            });
            return;
        }

        if (!ehGlobalPromovida) {
            const tipo = resolverTipoEscalar(declaracao.tipo, contexto);
            this.declararLocalEscalar(nome, tipo);
        }

        const valorInicial = declaracao.inicializador ? this.lowerConstruto(declaracao.inicializador) : valorConstante(0);
        this.escreverEscalar(nome, valorInicial);
    }

    private lowerEscreva(declaracao: Escreva): void {
        const argumento = declaracao.argumentos[0];
        if (argumento instanceof Literal && argumento.tipo === 'texto') {
            const rotulo = this.literalTexto(String(argumento.valor));
            this.emitir({ op: 'imprimirTexto', rotulo });
            return;
        }
        const valor = this.lowerConstruto(argumento);
        this.emitir({ op: 'imprimirNumero', valor });
    }

    private lowerCondicao(condicao: ConstrutoInterface): IRValor {
        return this.lowerConstruto(condicao);
    }

    private lowerSe(declaracao: Se): void {
        const blocoFim = this.criarBloco();
        const pares: Array<{ condicao: ConstrutoInterface; caminho: Declaracao }> = [
            { condicao: declaracao.condicao, caminho: declaracao.caminhoEntao },
            ...(declaracao.caminhosSeSenao ?? []).map((c) => ({ condicao: c.condicao, caminho: c.caminho })),
        ];

        const lowerCadeia = (indice: number): void => {
            if (indice >= pares.length) {
                if (declaracao.caminhoSenao) this.lowerDeclaracao(declaracao.caminhoSenao);
                this.terminarCom({ op: 'salto', alvo: blocoFim });
                return;
            }

            const condicaoValor = this.lowerCondicao(pares[indice].condicao);
            const blocoEntao = this.criarBloco();
            const blocoProximo = this.criarBloco();
            this.terminarCom({ op: 'saltoCondicional', condicao: condicaoValor, verdadeiro: blocoEntao, falso: blocoProximo });

            this.irPara(blocoEntao);
            this.lowerDeclaracao(pares[indice].caminho);
            this.terminarCom({ op: 'salto', alvo: blocoFim });

            this.irPara(blocoProximo);
            lowerCadeia(indice + 1);
        };

        lowerCadeia(0);
        this.irPara(blocoFim);
    }

    private lowerEnquanto(declaracao: Enquanto): void {
        const blocoCondicao = this.criarBloco();
        const blocoCorpo = this.criarBloco();
        const blocoFim = this.criarBloco();

        this.terminarCom({ op: 'salto', alvo: blocoCondicao });

        this.irPara(blocoCondicao);
        const condicaoValor = this.lowerCondicao(declaracao.condicao);
        this.terminarCom({ op: 'saltoCondicional', condicao: condicaoValor, verdadeiro: blocoCorpo, falso: blocoFim });

        this.irPara(blocoCorpo);
        this.lowerDeclaracao(declaracao.corpo);
        this.terminarCom({ op: 'salto', alvo: blocoCondicao });

        this.irPara(blocoFim);
    }

    private lowerPara(declaracao: Para): void {
        if (declaracao.inicializador) {
            if (Array.isArray(declaracao.inicializador)) {
                for (const decl of declaracao.inicializador) this.lowerDeclaracao(decl);
            } else {
                this.lowerDeclaracao(declaracao.inicializador);
            }
        }

        const blocoCondicao = this.criarBloco();
        const blocoCorpo = this.criarBloco();
        const blocoIncremento = this.criarBloco();
        const blocoFim = this.criarBloco();

        this.terminarCom({ op: 'salto', alvo: blocoCondicao });

        this.irPara(blocoCondicao);
        const condicaoValor = declaracao.condicao ? this.lowerCondicao(declaracao.condicao) : valorConstante(true);
        this.terminarCom({ op: 'saltoCondicional', condicao: condicaoValor, verdadeiro: blocoCorpo, falso: blocoFim });

        this.irPara(blocoCorpo);
        this.lowerDeclaracao(declaracao.corpo);
        this.terminarCom({ op: 'salto', alvo: blocoIncremento });

        this.irPara(blocoIncremento);
        if (declaracao.incrementar) this.lowerConstruto(declaracao.incrementar);
        this.terminarCom({ op: 'salto', alvo: blocoCondicao });

        this.irPara(blocoFim);
    }

    private lowerParaCada(declaracao: ParaCada): void {
        if (!(declaracao.vetorOuDicionario instanceof Vetor) && !(declaracao.vetorOuDicionario instanceof Variavel)) {
            throw new Error('para-cada só é suportado sobre um vetor literal ou uma variável de vetor de tamanho fixo.');
        }
        if (!(declaracao.variavelIteracao instanceof Variavel)) {
            throw new Error('para-cada requer uma única variável de iteração (dupla/dicionário não suportado).');
        }

        const nomeVetor =
            declaracao.vetorOuDicionario instanceof Variavel
                ? declaracao.vetorOuDicionario.simbolo.lexema
                : undefined;
        if (!nomeVetor) {
            throw new Error('para-cada só é suportado sobre uma variável de vetor já declarada.');
        }
        const info = this.resolverArranjoInfo(nomeVetor);

        const nomeIteracao = declaracao.variavelIteracao.simbolo.lexema;
        this.declararLocalEscalar(nomeIteracao, info.tipoElemento);

        const nomeIndice = `__indice_${nomeIteracao}__`;
        this.declararLocalEscalar(nomeIndice, 'inteiro');
        this.emitir({ op: 'const', dst: nomeIndice, valor: 0 });

        const blocoCondicao = this.criarBloco();
        const blocoCorpo = this.criarBloco();
        const blocoIncremento = this.criarBloco();
        const blocoFim = this.criarBloco();

        this.terminarCom({ op: 'salto', alvo: blocoCondicao });

        this.irPara(blocoCondicao);
        const tempCmp = this.novoTemp();
        this.emitir({
            op: 'bin',
            dst: tempCmp,
            operador: '<',
            esquerda: valorRegistrador(nomeIndice),
            direita: valorConstante(info.tamanho),
        });
        this.terminarCom({
            op: 'saltoCondicional',
            condicao: valorRegistrador(tempCmp),
            verdadeiro: blocoCorpo,
            falso: blocoFim,
        });

        this.irPara(blocoCorpo);
        const tempElemento = this.novoTemp();
        this.emitir({ op: 'indiceLer', dst: tempElemento, arranjo: nomeVetor, indice: valorRegistrador(nomeIndice) });
        this.emitir({ op: 'copia', dst: nomeIteracao, src: valorRegistrador(tempElemento) });
        this.lowerDeclaracao(declaracao.corpo);
        this.terminarCom({ op: 'salto', alvo: blocoIncremento });

        this.irPara(blocoIncremento);
        const tempIndiceNovo = this.novoTemp();
        this.emitir({
            op: 'bin',
            dst: tempIndiceNovo,
            operador: '+',
            esquerda: valorRegistrador(nomeIndice),
            direita: valorConstante(1),
        });
        this.emitir({ op: 'copia', dst: nomeIndice, src: valorRegistrador(tempIndiceNovo) });
        this.terminarCom({ op: 'salto', alvo: blocoCondicao });

        this.irPara(blocoFim);
    }

    private lowerFazer(declaracao: Fazer): void {
        const blocoCorpo = this.criarBloco();
        const blocoFim = this.criarBloco();

        this.terminarCom({ op: 'salto', alvo: blocoCorpo });

        this.irPara(blocoCorpo);
        this.lowerDeclaracao(declaracao.caminhoFazer);
        const condicaoValor = this.lowerCondicao(declaracao.condicaoEnquanto);
        this.terminarCom({ op: 'saltoCondicional', condicao: condicaoValor, verdadeiro: blocoCorpo, falso: blocoFim });

        this.irPara(blocoFim);
    }

    private lowerEscolha(declaracao: Escolha): void {
        const valorEscolha = this.lowerConstruto(declaracao.identificadorOuLiteral);
        const blocoFim = this.criarBloco();

        const lowerCaminhos = (indice: number): void => {
            if (indice >= declaracao.caminhos.length) {
                if (declaracao.caminhoPadrao) {
                    for (const decl of declaracao.caminhoPadrao.declaracoes) this.lowerDeclaracao(decl);
                }
                this.terminarCom({ op: 'salto', alvo: blocoFim });
                return;
            }

            const caminho = declaracao.caminhos[indice];
            const condicaoCaso = caminho.condicoes[0];
            const valorCaso = this.lowerConstruto(condicaoCaso);
            const tempCmp = this.novoTemp();
            this.emitir({ op: 'bin', dst: tempCmp, operador: '==', esquerda: valorEscolha, direita: valorCaso });

            const blocoCorpo = this.criarBloco();
            const blocoProximo = this.criarBloco();
            this.terminarCom({
                op: 'saltoCondicional',
                condicao: valorRegistrador(tempCmp),
                verdadeiro: blocoCorpo,
                falso: blocoProximo,
            });

            this.irPara(blocoCorpo);
            for (const decl of caminho.declaracoes) this.lowerDeclaracao(decl);
            this.terminarCom({ op: 'salto', alvo: blocoFim });

            this.irPara(blocoProximo);
            lowerCaminhos(indice + 1);
        };

        lowerCaminhos(0);
        this.irPara(blocoFim);
    }

    private lowerRetorna(declaracao: Retorna): void {
        if (declaracao.valor) {
            const valor = this.lowerConstruto(declaracao.valor);
            this.terminarCom({ op: 'retorno', valor });
        } else {
            this.terminarCom({ op: 'retorno' });
        }
    }

    // --- Construtos (expressões) ---

    lowerConstruto(construto: ConstrutoInterface): IRValor {
        const nomeClasse = (construto as unknown as { constructor: { name: string } }).constructor.name;
        switch (nomeClasse) {
            case 'Literal':
                return this.lowerLiteral(construto as unknown as Literal);
            case 'Variavel':
                return this.lerEscalar((construto as unknown as Variavel).simbolo.lexema);
            case 'Agrupamento':
                return this.lowerConstruto((construto as unknown as Agrupamento).expressao);
            case 'Binario':
                return this.lowerBinario(construto as unknown as Binario);
            case 'Logico':
                return this.lowerLogico(construto as unknown as Logico);
            case 'Unario':
                return this.lowerUnario(construto as unknown as Unario);
            case 'Atribuir':
                return this.lowerAtribuir(construto as unknown as Atribuir);
            case 'AtribuicaoPorIndice':
                return this.lowerAtribuicaoPorIndice(construto as unknown as AtribuicaoPorIndice);
            case 'AcessoIndiceVariavel':
                return this.lowerAcessoIndice(construto as unknown as AcessoIndiceVariavel);
            case 'Chamada':
                return this.lowerChamada(construto as unknown as Chamada);
            case 'Leia':
                throw new Error("'leia' não é suportado pelo tradutor para x64.");
            case 'DefinirValor':
            case 'AcessoMetodo':
            case 'TipoDe':
                throw new Error(`'${nomeClasse}' requer modelo de objetos e não é suportado pelo tradutor para x64.`);
            default:
                throw new Error(`Expressão '${nomeClasse}' não suportada pelo tradutor para x64.`);
        }
    }

    private lowerLiteral(construto: Literal): IRValor {
        if (typeof construto.valor === 'number') return valorConstante(construto.valor);
        if (typeof construto.valor === 'boolean') return valorConstante(construto.valor ? 1 : 0);
        if (typeof construto.valor === 'bigint') return valorConstante(construto.valor);
        if (typeof construto.valor === 'string') {
            const rotulo = this.literalTexto(construto.valor);
            const temp = this.novoTemp();
            this.emitir({ op: 'enderecoRotulo', dst: temp, rotulo });
            return valorRegistrador(temp);
        }
        throw new Error(`Literal do tipo '${construto.tipo}' não suportado pelo tradutor para x64.`);
    }

    private lowerBinario(construto: Binario): IRValor {
        if (construto.esquerda.tipo === 'texto' || construto.direita.tipo === 'texto') {
            throw new Error('Operações aritméticas sobre texto não são suportadas pelo tradutor para x64.');
        }
        const esquerda = this.lowerConstruto(construto.esquerda);
        const direita = this.lowerConstruto(construto.direita);
        const operador = construto.operador.lexema;
        if (!OPERADORES_BINARIOS.has(operador)) {
            throw new Error(`Operador '${operador}' não suportado pelo tradutor para x64.`);
        }
        const dst = this.novoTemp();
        this.emitir({ op: 'bin', dst, operador: operador as OperadorBinario, esquerda, direita });
        return valorRegistrador(dst);
    }

    private lowerLogico(construto: Logico): IRValor {
        const ehE = construto.operador.lexema === 'e' || construto.operador.lexema === '&&';
        const ehOu = construto.operador.lexema === 'ou' || construto.operador.lexema === '||';
        if (!ehE && !ehOu) {
            throw new Error(`Operador lógico '${construto.operador.lexema}' não suportado pelo tradutor para x64.`);
        }

        const nomeResultado = `%logico${this.novoTemp()}`;
        this.declararLocalEscalar(nomeResultado, 'logico');

        const blocoAvaliaDireita = this.criarBloco();
        const blocoFim = this.criarBloco();

        const esquerda = this.lowerConstruto(construto.esquerda);
        this.emitir({ op: 'copia', dst: nomeResultado, src: esquerda });

        if (ehE) {
            const blocoCurto = this.criarBloco();
            this.terminarCom({
                op: 'saltoCondicional',
                condicao: esquerda,
                verdadeiro: blocoAvaliaDireita,
                falso: blocoCurto,
            });
            this.irPara(blocoCurto);
            this.terminarCom({ op: 'salto', alvo: blocoFim });
        } else {
            const blocoCurto = this.criarBloco();
            this.terminarCom({
                op: 'saltoCondicional',
                condicao: esquerda,
                verdadeiro: blocoCurto,
                falso: blocoAvaliaDireita,
            });
            this.irPara(blocoCurto);
            this.terminarCom({ op: 'salto', alvo: blocoFim });
        }

        this.irPara(blocoAvaliaDireita);
        const direita = this.lowerConstruto(construto.direita);
        this.emitir({ op: 'copia', dst: nomeResultado, src: direita });
        this.terminarCom({ op: 'salto', alvo: blocoFim });

        this.irPara(blocoFim);
        let resultado: IRValor = valorRegistrador(nomeResultado);
        if (construto.negado) {
            const negadoTemp = this.novoTemp();
            this.emitir({ op: 'nao', dst: negadoTemp, src: resultado });
            resultado = valorRegistrador(negadoTemp);
        }
        return resultado;
    }

    private lowerUnario(construto: Unario): IRValor {
        const operador = construto.operador.lexema;

        if (operador === '++' || operador === '--') {
            if (!(construto.operando instanceof Variavel)) {
                throw new Error('++/-- só são suportados sobre uma variável simples.');
            }
            const nome = construto.operando.simbolo.lexema;
            const valorAntigo = this.lerEscalar(nome);
            const novoValor = this.novoTemp();
            this.emitir({
                op: 'bin',
                dst: novoValor,
                operador: operador === '++' ? '+' : '-',
                esquerda: valorAntigo,
                direita: valorConstante(1),
            });
            this.escreverEscalar(nome, valorRegistrador(novoValor));
            return construto.incidenciaOperador === 'DEPOIS' ? valorAntigo : valorRegistrador(novoValor);
        }

        const operando = this.lowerConstruto(construto.operando);
        const dst = this.novoTemp();
        if (operador === '-') {
            this.emitir({ op: 'neg', dst, src: operando });
        } else if (operador === '!' || operador === 'nao') {
            this.emitir({ op: 'nao', dst, src: operando });
        } else {
            throw new Error(`Operador unário '${operador}' não suportado pelo tradutor para x64.`);
        }
        return valorRegistrador(dst);
    }

    private lowerAtribuir(construto: Atribuir): IRValor {
        if (construto.indice) {
            throw new Error('Atribuição indexada deve usar AtribuicaoPorIndice.');
        }
        if (!(construto.alvo instanceof Variavel)) {
            throw new Error('Atribuição só é suportada sobre uma variável simples.');
        }
        const nome = construto.alvo.simbolo.lexema;
        let valor = this.lowerConstruto(construto.valor);

        if (construto.simboloOperador) {
            const operadorComposto = construto.simboloOperador.lexema.replace('=', '') as OperadorBinario;
            const atual = this.lerEscalar(nome);
            const dst = this.novoTemp();
            this.emitir({ op: 'bin', dst, operador: operadorComposto, esquerda: atual, direita: valor });
            valor = valorRegistrador(dst);
        }

        this.escreverEscalar(nome, valor);
        return valor;
    }

    private lowerAtribuicaoPorIndice(construto: AtribuicaoPorIndice): IRValor {
        if (!(construto.objeto instanceof Variavel)) {
            throw new Error('Atribuição por índice só é suportada sobre uma variável de vetor.');
        }
        const nomeVetor = construto.objeto.simbolo.lexema;
        this.resolverArranjoInfo(nomeVetor);
        const indice = this.lowerConstruto(construto.indice);
        const valor = this.lowerConstruto(construto.valor);
        this.emitir({ op: 'indiceEscrever', arranjo: nomeVetor, indice, valor });
        return valor;
    }

    private lowerAcessoIndice(construto: AcessoIndiceVariavel): IRValor {
        if (!(construto.entidadeChamada instanceof Variavel)) {
            throw new Error('Acesso por índice só é suportado sobre uma variável de vetor.');
        }
        const nomeVetor = construto.entidadeChamada.simbolo.lexema;
        this.resolverArranjoInfo(nomeVetor);
        const indice = this.lowerConstruto(construto.indice);
        const dst = this.novoTemp();
        this.emitir({ op: 'indiceLer', dst, arranjo: nomeVetor, indice });
        return valorRegistrador(dst);
    }

    private lowerChamada(construto: Chamada): IRValor {
        if (!(construto.entidadeChamada instanceof Variavel)) {
            throw new Error('Só são suportadas chamadas diretas a funções declaradas por nome.');
        }
        const nomeFuncao = construto.entidadeChamada.simbolo.lexema;
        const assinatura = this.assinaturaDe(nomeFuncao);
        if (construto.argumentos.length !== assinatura.parametros.length) {
            throw new Error(
                `Função '${nomeFuncao}' espera ${assinatura.parametros.length} argumento(s), recebeu ${construto.argumentos.length}.`
            );
        }
        const argumentos = construto.argumentos.map((argumento) => this.lowerConstruto(argumento));
        const dst = assinatura.tipoRetorno === 'vazio' ? null : this.novoTemp();
        this.emitir({ op: 'chamada', dst, rotulo: nomeFuncao, argumentos });
        return dst ? valorRegistrador(dst) : valorConstante(0);
    }
}

/** Só variáveis/constantes declaradas diretamente no nível principal do programa podem virar globais. */
function coletarDeclaracoesDeTopo(declaracoes: Declaracao[]): Array<Var | Const> {
    const resultado: Array<Var | Const> = [];
    for (const declaracao of declaracoes) {
        if (declaracao instanceof Var || declaracao instanceof Const) resultado.push(declaracao);
    }
    return resultado;
}

export class LoweringX64 {
    lowerPrograma(declaracoes: Declaracao[]): IRPrograma {
        const programa: IRPrograma = {
            funcoes: [],
            globaisEscalares: new Map(),
            globaisArranjos: new Map(),
            literaisTexto: new Map(),
        };

        const declaracoesFuncao = declaracoes.filter(
            (declaracao) => declaracao instanceof FuncaoDeclaracao
        ) as FuncaoDeclaracao[];
        const demais = declaracoes.filter((declaracao) => !(declaracao instanceof FuncaoDeclaracao));

        // 1) Variáveis/constantes top-level referenciadas por alguma função viram globais.
        const nomesTopo = coletarDeclaracoesDeTopo(demais);
        const referenciadasPorFuncoes = new Set<string>();
        for (const decl of declaracoesFuncao) {
            const { referenciadas } = coletarReferenciasEDeclaracoes(decl.funcao.corpo);
            const nomesDeParametro = new Set(decl.funcao.parametros.map((p) => p.nome.lexema));
            for (const nome of referenciadas) {
                if (!nomesDeParametro.has(nome)) referenciadasPorFuncoes.add(nome);
            }
        }

        for (const decl of nomesTopo) {
            const nome = decl.simbolo.lexema;
            if (!referenciadasPorFuncoes.has(nome)) continue;

            const contexto = `${decl instanceof Const ? 'Constante' : 'Variável'} global '${nome}'`;
            if (decl.inicializador instanceof Vetor) {
                const tipoElemento = resolverTipoElementoVetor(decl.tipo, contexto);
                programa.globaisArranjos.set(nome, {
                    id: nome,
                    tamanho: decl.inicializador.elementos.length,
                    tipoElemento,
                });
            } else {
                programa.globaisEscalares.set(nome, resolverTipoEscalar(decl.tipo, contexto));
            }
        }

        // 2) Assinaturas de todas as funções antes de traduzir qualquer corpo (permite chamadas para frente).
        const assinaturas = new Map<string, AssinaturaFuncao>();
        for (const decl of declaracoesFuncao) {
            const nomeFuncao = decl.simbolo.lexema;
            const parametros = decl.funcao.parametros.map((parametro) =>
                resolverTipoEscalar(parametro.tipoDado, `Parâmetro '${parametro.nome.lexema}' da função '${nomeFuncao}'`)
            );
            const tipoRetornoTexto = decl.funcao.tipoExplicito ? decl.funcao.tipo : inferirTipoRetorno(decl.funcao.corpo);
            const tipoRetorno = tipoRetornoTexto ? resolverTipoEscalar(tipoRetornoTexto, `Retorno da função '${nomeFuncao}'`) : 'vazio';
            assinaturas.set(nomeFuncao, { parametros, tipoRetorno });
        }

        // 3) Traduz cada função declarada.
        for (const decl of declaracoesFuncao) {
            programa.funcoes.push(this.lowerFuncaoDeclarada(decl, programa, assinaturas));
        }

        // 4) Traduz o programa principal (tudo que não é declaração de função).
        const construtor = new ConstrutorFuncao('principal', true, programa, assinaturas);
        construtor.lowerBloco(demais);
        construtor.finalizar();
        programa.funcoes.push(construtor.funcao);

        return programa;
    }

    private lowerFuncaoDeclarada(
        decl: FuncaoDeclaracao,
        programa: IRPrograma,
        assinaturas: Map<string, AssinaturaFuncao>
    ): IRFuncao {
        const nomeFuncao = decl.simbolo.lexema;
        const assinatura = assinaturas.get(nomeFuncao)!;
        const construtor = new ConstrutorFuncao(nomeFuncao, false, programa, assinaturas);
        construtor.funcao.tipoRetorno = assinatura.tipoRetorno;

        decl.funcao.parametros.forEach((parametro, indice) => {
            const tipo = assinatura.parametros[indice];
            const nome = parametro.nome.lexema;
            construtor.declararLocalEscalar(nome, tipo);
            construtor.funcao.parametros.push({ nome, registrador: nome, tipo });
            construtor.emitir({ op: 'copia', dst: nome, src: valorArgumentoFisico(indice) });
        });

        construtor.lowerBloco(decl.funcao.corpo);
        construtor.finalizar();
        return construtor.funcao;
    }
}
