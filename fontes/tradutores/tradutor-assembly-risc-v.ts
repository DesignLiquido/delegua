import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    DefinirValor,
    FuncaoConstruto,
    Leia,
    Literal,
    Logico,
    TipoDe,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
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
} from '../declaracoes';
import { CaminhoEscolha } from '../interfaces/construtos';

export type PlataformaAlvoRISCV = 'linux-rv64' | 'linux-rv32';

export class TradutorAssemblyRISCV {
    indentacao: number = 0;
    declaracoesDeClasses: Classe[];
    contadorLabels: number = 0;
    variaveis: Map<string, string> = new Map();
    // s2-s9 são callee-saved — seguros para usar como scratch entre chamadas
    registradoresDisponiveis: string[] = ['s2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'];
    pilhaRegistradores: string[] = [];

    bss = '.bss\n';
    data = '.data\n';
    text: string;

    constructor(public alvo: PlataformaAlvoRISCV = 'linux-rv64') {
        this.indentacao = 0;
        this.text = `
.text
.global _start

_start:`;
    }

    gerarDigitoAleatorio(): string {
        let result = '';
        const digits = '0123456789';
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * digits.length);
            result += digits.charAt(randomIndex);
        }
        return result;
    }

    gerarLabel(): string {
        return `.L${this.contadorLabels++}`;
    }

    obterRegistrador(): string {
        if (this.registradoresDisponiveis.length > 0) {
            const reg = this.registradoresDisponiveis.pop()!;
            this.pilhaRegistradores.push(reg);
            return reg;
        }
        return 'a0'; // fallback
    }

    liberarRegistrador(reg: string): void {
        const index = this.pilhaRegistradores.indexOf(reg);
        if (index > -1) {
            this.pilhaRegistradores.splice(index, 1);
            this.registradoresDisponiveis.push(reg);
        }
    }

    // Emite a instrução de carga correta para o registrador destino.
    // RISC-V não tem um `ldr reg, =value` polimórfico como ARM —
    // usa `li` para inteiros e `la` para endereços de símbolos.
    private emitirCarga(registrador: string, valor: string): void {
        if (valor === registrador) return;
        if (valor === 'null') {
            this.text += `\n    li ${registrador}, 0`;
        } else if (/^-?\d+$/.test(valor) || valor === 'true' || valor === 'false') {
            const numVal = valor === 'true' ? '1' : valor === 'false' ? '0' : valor;
            this.text += `\n    li ${registrador}, ${numVal}`;
        } else if (/^-?\d+\.\d+$/.test(valor)) {
            // Ponto flutuante: armazenar em .data e carregar endereço.
            // Operações FPU não são suportadas por esta implementação básica.
            const floatLabel = `float_${this.gerarDigitoAleatorio()}`;
            this.data += `    ${floatLabel}: .double ${valor}\n`;
            this.text += `\n    la ${registrador}, ${floatLabel}`;
        } else {
            this.text += `\n    la ${registrador}, ${valor}`;
        }
    }

    dicionarioConstrutos = {
        AcessoIndiceVariavel: this.traduzirAcessoIndiceVariavel.bind(this),
        AcessoMetodoOuPropriedade: this.traduzirConstrutoAcessoMetodo.bind(this),
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        AtribuicaoPorIndice: this.traduzirConstrutoAtribuicaoPorIndice.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        Chamada: this.traduzirConstrutoChamada.bind(this),
        DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        FuncaoConstruto: this.traduzirFuncaoConstruto.bind(this),
        Isto: () => 'this',
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Logico: this.traduzirConstrutoLogico.bind(this),
        TipoDe: this.traduzirConstrutoTipoDe.bind(this),
        Unario: this.traduzirConstrutoUnario.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
        Vetor: this.traduzirConstrutoVetor.bind(this),
    };

    dicionarioDeclaracoes = {
        Bloco: this.traduzirDeclaracaoBloco.bind(this),
        Enquanto: this.traduzirDeclaracaoEnquanto.bind(this),
        Continua: () => 'j .continue_label',
        Escolha: this.traduzirDeclaracaoEscolha.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        Fazer: this.traduzirDeclaracaoFazer.bind(this),
        Falhar: this.traduzirDeclaracaoFalhar.bind(this),
        FuncaoDeclaracao: this.traduzirDeclaracaoFuncao.bind(this),
        Importar: this.traduzirDeclaracaoImportar.bind(this),
        Leia: this.traduzirDeclaracaoLeia.bind(this),
        Para: this.traduzirDeclaracaoPara.bind(this),
        ParaCada: this.traduzirDeclaracaoParaCada.bind(this),
        Retorna: this.traduzirDeclaracaoRetorna.bind(this),
        Se: this.traduzirDeclaracaoSe.bind(this),
        Sustar: () => 'j .break_label',
        Classe: this.traduzirDeclaracaoClasse.bind(this),
        Tente: this.traduzirDeclaracaoTente.bind(this),
        Const: this.traduzirDeclaracaoConst.bind(this),
        Var: this.traduzirDeclaracaoVar.bind(this),
    };

    // Implementação dos Construtos

    traduzirAcessoIndiceVariavel(construto: AcessoIndiceVariavel): string {
        let nomeVar: string | undefined;
        if (construto.entidadeChamada instanceof Variavel) {
            nomeVar = construto.entidadeChamada.simbolo?.lexema;
        }
        if (!nomeVar) nomeVar = 'unknown';

        const indice = this.dicionarioConstrutos[construto.indice.constructor.name](
            construto.indice
        );

        const reg = this.obterRegistrador();
        this.text += `\n    la ${reg}, ${nomeVar}`;
        this.emitirCarga('a0', indice);
        this.text += `
    slli a0, a0, 3          # multiplicar índice por 8 (palavra de 64 bits)
    add ${reg}, ${reg}, a0
    ld a0, 0(${reg})`;
        this.liberarRegistrador(reg);
        return 'a0';
    }

    traduzirConstrutoAcessoMetodo(construto: AcessoMetodo): string {
        const objeto = this.dicionarioConstrutos[construto.objeto.constructor.name](
            construto.objeto
        );
        return `${objeto}_${construto.nomeMetodo}`;
    }

    traduzirConstrutoAgrupamento(construto: Agrupamento): string {
        return this.dicionarioConstrutos[construto.expressao.constructor.name](construto.expressao);
    }

    traduzirConstrutoAtribuicaoPorIndice(construto: AtribuicaoPorIndice): void {
        let nomeVar: string | undefined;
        if (construto.objeto instanceof Variavel) {
            nomeVar = construto.objeto.simbolo?.lexema;
        }
        if (!nomeVar) nomeVar = 'unknown';

        const indice = this.dicionarioConstrutos[construto.indice.constructor.name](
            construto.indice
        );
        const valor = this.dicionarioConstrutos[construto.valor.constructor.name](construto.valor);

        const reg = this.obterRegistrador();
        this.text += `\n    la ${reg}, ${nomeVar}`;
        this.emitirCarga('a1', indice);
        this.text += `
    slli a1, a1, 3          # multiplicar índice por 8
    add ${reg}, ${reg}, a1`;
        this.emitirCarga('a1', valor);
        this.text += `\n    sd a1, 0(${reg})`;
        this.liberarRegistrador(reg);
    }

    traduzirConstrutoAtribuir(construto: Atribuir): void {
        let nomeVar: string | undefined;
        if (construto.alvo instanceof Variavel) {
            nomeVar = construto.alvo.simbolo?.lexema;
        }
        if (!nomeVar) return;

        const valor = this.dicionarioConstrutos[construto.valor.constructor.name](construto.valor);

        if (!this.variaveis.has(nomeVar)) {
            const varLabel = `var_${nomeVar}`;
            this.bss += `    ${varLabel}: .space 8\n`;
            this.variaveis.set(nomeVar, varLabel);
        }

        this.emitirCarga('a0', valor);
        this.text += `
    la a1, ${this.variaveis.get(nomeVar)}
    sd a0, 0(a1)`;
    }

    traduzirConstrutoBinario(construto: Binario): string {
        const esquerda = this.dicionarioConstrutos[construto.esquerda.constructor.name](
            construto.esquerda
        );
        const direita = this.dicionarioConstrutos[construto.direita.constructor.name](
            construto.direita
        );
        const operador = construto.operador.lexema;

        const reg = this.obterRegistrador();

        // Carregar operando esquerdo em a0
        if (esquerda !== 'a0') {
            this.emitirCarga('a0', esquerda);
        }

        // Carregar operando direito no registrador scratch
        this.emitirCarga(reg, direita);

        switch (operador) {
            case '+':
                this.text += `\n    add a0, a0, ${reg}`;
                break;
            case '-':
                this.text += `\n    sub a0, a0, ${reg}`;
                break;
            case '*':
                this.text += `\n    mul a0, a0, ${reg}`;
                break;
            case '/':
                this.text += `\n    div a0, a0, ${reg}`;
                break;
            case '%':
                // `rem` é instrução única na extensão M (universal em rv64 Linux)
                this.text += `\n    rem a0, a0, ${reg}`;
                break;
            case '<':
                // slt: a0 = 1 se a0 < reg
                this.text += `\n    slt a0, a0, ${reg}`;
                break;
            case '>':
                // slt com operandos trocados: a0 = 1 se reg < a0, i.e., a0 > reg
                this.text += `\n    slt a0, ${reg}, a0`;
                break;
            case '<=':
                // NOT(a0 > reg) = NOT(reg < a0)
                this.text += `\n    slt a0, ${reg}, a0\n    xori a0, a0, 1`;
                break;
            case '>=':
                // NOT(a0 < reg)
                this.text += `\n    slt a0, a0, ${reg}\n    xori a0, a0, 1`;
                break;
            case '==':
            case '===':
                // sub + seqz: a0 = 1 se a0 - reg == 0
                this.text += `\n    sub a0, a0, ${reg}\n    seqz a0, a0`;
                break;
            case '!=':
            case '!==':
                // sub + snez: a0 = 1 se a0 - reg != 0
                this.text += `\n    sub a0, a0, ${reg}\n    snez a0, a0`;
                break;
            default:
                this.text += `\n    # Operador ${operador} não implementado`;
        }

        this.liberarRegistrador(reg);
        return 'a0';
    }

    traduzirConstrutoChamada(construto: Chamada): void {
        let nomeFuncao: string = 'funcao';
        if (construto.entidadeChamada instanceof Variavel) {
            nomeFuncao = construto.entidadeChamada.simbolo?.lexema || 'funcao';
        }

        // Convenção RISC-V: a0-a7 para até 8 argumentos
        const registrosArgs = ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'];

        construto.argumentos.forEach((arg: Construto, index: number) => {
            if (index < registrosArgs.length) {
                const valorArg = this.dicionarioConstrutos[arg.constructor.name](arg);
                if (valorArg !== registrosArgs[index]) {
                    this.emitirCarga(registrosArgs[index], valorArg);
                }
            }
        });

        this.text += `\n    call ${nomeFuncao}`;
    }

    traduzirConstrutoDefinirValor(construto: DefinirValor): void {
        const objeto = this.dicionarioConstrutos[construto.objeto.constructor.name](
            construto.objeto
        );
        const valor = this.dicionarioConstrutos[construto.valor.constructor.name](construto.valor);

        this.emitirCarga('a0', valor);
        this.text += `
    la a1, ${objeto}
    sd a0, 0(a1)`;
    }

    traduzirFuncaoConstruto(construto: FuncaoConstruto): void {
        const labelFuncao = `func_${this.gerarDigitoAleatorio()}`;

        this.text += `

${labelFuncao}:
    addi sp, sp, -16
    sd   ra, 8(sp)
    sd   s0, 0(sp)
    addi s0, sp, 16`;

        if (construto.corpo && Array.isArray(construto.corpo)) {
            construto.corpo.forEach((declaracao: Declaracao) => {
                if (this.dicionarioDeclaracoes[declaracao.constructor.name]) {
                    this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao);
                }
            });
        }

        this.text += `
    ld   ra, 8(sp)
    ld   s0, 0(sp)
    addi sp, sp, 16
    ret`;
    }

    traduzirConstrutoLiteral(construto: Literal): string {
        if (typeof construto.valor === 'string') {
            return this.criaStringLiteral(construto);
        }
        return String(construto.valor);
    }

    traduzirConstrutoLogico(construto: Logico): string {
        const esquerda = this.dicionarioConstrutos[construto.esquerda.constructor.name](
            construto.esquerda
        );
        const direita = this.dicionarioConstrutos[construto.direita.constructor.name](
            construto.direita
        );
        const operador = construto.operador.lexema;

        const labelVerdadeiro = this.gerarLabel();
        const labelFim = this.gerarLabel();

        this.emitirCarga('a0', esquerda);

        if (operador === 'e' || operador === '&&') {
            this.text += `\n    beqz a0, ${labelFim}`;
            this.emitirCarga('a0', direita);
            this.text += `
    beqz a0, ${labelFim}
${labelVerdadeiro}:
    li a0, 1
${labelFim}:`;
        } else if (operador === 'ou' || operador === '||') {
            this.text += `\n    bnez a0, ${labelVerdadeiro}`;
            this.emitirCarga('a0', direita);
            this.text += `
    bnez a0, ${labelVerdadeiro}
    li a0, 0
    j ${labelFim}
${labelVerdadeiro}:
    li a0, 1
${labelFim}:`;
        }

        return 'a0';
    }

    traduzirConstrutoTipoDe(construto: TipoDe): string {
        return this.dicionarioConstrutos[construto.valor.constructor.name](construto.valor);
    }

    traduzirConstrutoUnario(construto: Unario): string {
        const operando = this.dicionarioConstrutos[construto.operando.constructor.name](
            construto.operando
        );
        const operador = construto.operador.lexema;

        this.emitirCarga('a0', operando);

        if (operador === '-') {
            this.text += `\n    neg a0, a0`;
        } else if (operador === '!' || operador === 'nao') {
            // seqz: a0 = 1 se a0 == 0, else 0
            this.text += `\n    seqz a0, a0`;
        }

        return 'a0';
    }

    traduzirConstrutoVariavel(construto: Variavel): string {
        const nomeVar = construto.simbolo?.lexema;
        if (nomeVar && this.variaveis.has(nomeVar)) {
            const varLabel = this.variaveis.get(nomeVar)!;
            this.text += `
    la a0, ${varLabel}
    ld a0, 0(a0)`;
            return 'a0';
        }
        return nomeVar || 'unknown';
    }

    traduzirConstrutoVetor(construto: Vetor): string {
        const labelVetor = `vetor_${this.gerarDigitoAleatorio()}`;
        // `elementos` filtra nós sintáticos (Separador, ComentarioComoConstruto)
        const elementos = construto.elementos;

        // Cada elemento ocupa 8 bytes em rv64
        this.bss += `    ${labelVetor}: .space ${elementos.length * 8}\n`;

        elementos.forEach((valor: Construto, index: number) => {
            if (this.dicionarioConstrutos[valor.constructor.name]) {
                const valorTraduzido = this.dicionarioConstrutos[valor.constructor.name](valor);
                this.emitirCarga('a0', valorTraduzido);
                this.text += `
    la a1, ${labelVetor}
    sd a0, ${index * 8}(a1)`;
            }
        });

        return labelVetor;
    }

    // Implementação das Declarações

    traduzirDeclaracaoBloco(declaracao: Bloco): void {
        if (declaracao.declaracoes && Array.isArray(declaracao.declaracoes)) {
            declaracao.declaracoes.forEach((decl: Declaracao) => {
                if (this.dicionarioDeclaracoes[decl.constructor.name]) {
                    this.dicionarioDeclaracoes[decl.constructor.name](decl);
                }
            });
        }
    }

    traduzirDeclaracaoEnquanto(declaracao: Enquanto): void {
        const labelInicio = this.gerarLabel();
        const labelFim = this.gerarLabel();

        this.text += `\n${labelInicio}:`;

        const condicao = this.dicionarioConstrutos[declaracao.condicao.constructor.name](
            declaracao.condicao
        );

        if (condicao !== 'a0') {
            this.emitirCarga('a0', condicao);
        }
        this.text += `\n    beqz a0, ${labelFim}`;

        if (this.dicionarioDeclaracoes[declaracao.corpo.constructor.name]) {
            this.dicionarioDeclaracoes[declaracao.corpo.constructor.name](declaracao.corpo);
        }

        this.text += `
    j ${labelInicio}
${labelFim}:`;
    }

    traduzirDeclaracaoEscolha(declaracao: Escolha): void {
        const labelFim = this.gerarLabel();
        const valorEscolha = this.dicionarioConstrutos[
            declaracao.identificadorOuLiteral.constructor.name
        ](declaracao.identificadorOuLiteral);

        if (declaracao.caminhos && Array.isArray(declaracao.caminhos)) {
            declaracao.caminhos.forEach((caminho: CaminhoEscolha) => {
                const labelProximo = this.gerarLabel();
                if (caminho.condicoes && caminho.condicoes[0]) {
                    const valorCaso = this.dicionarioConstrutos[
                        caminho.condicoes[0].constructor.name
                    ](caminho.condicoes[0]);

                    this.emitirCarga('a0', valorEscolha);
                    this.emitirCarga('a1', valorCaso);
                    this.text += `\n    bne a0, a1, ${labelProximo}`;

                    if (caminho.declaracoes && Array.isArray(caminho.declaracoes)) {
                        caminho.declaracoes.forEach((decl: Declaracao) => {
                            if (this.dicionarioDeclaracoes[decl.constructor.name]) {
                                this.dicionarioDeclaracoes[decl.constructor.name](decl);
                            }
                        });
                    }

                    this.text += `
    j ${labelFim}
${labelProximo}:`;
                }
            });
        }

        this.text += `\n${labelFim}:`;
    }

    traduzirDeclaracaoExpressao(declaracao: Expressao): void {
        if (
            declaracao.expressao &&
            this.dicionarioConstrutos[declaracao.expressao.constructor.name]
        ) {
            this.dicionarioConstrutos[declaracao.expressao.constructor.name](declaracao.expressao);
        }
    }

    traduzirDeclaracaoFazer(declaracao: Fazer): void {
        const labelInicio = this.gerarLabel();

        this.text += `\n${labelInicio}:`;

        if (declaracao.caminhoFazer && declaracao.caminhoFazer.declaracoes) {
            declaracao.caminhoFazer.declaracoes.forEach((decl: Declaracao) => {
                if (this.dicionarioDeclaracoes[decl.constructor.name]) {
                    this.dicionarioDeclaracoes[decl.constructor.name](decl);
                }
            });
        }

        if (declaracao.condicaoEnquanto) {
            const condicao = this.dicionarioConstrutos[
                declaracao.condicaoEnquanto.constructor.name
            ](declaracao.condicaoEnquanto);
            if (condicao !== 'a0') {
                this.emitirCarga('a0', condicao);
            }
            this.text += `\n    bnez a0, ${labelInicio}`;
        }
    }

    traduzirDeclaracaoFalhar(declaracao: Falhar): void {
        let mensagem: string = '"Erro"';
        if (
            declaracao.explicacao &&
            typeof declaracao.explicacao === 'object' &&
            'constructor' in declaracao.explicacao
        ) {
            const explicacao = declaracao.explicacao as Construto;
            if (explicacao.constructor && this.dicionarioConstrutos[explicacao.constructor.name]) {
                mensagem = this.dicionarioConstrutos[explicacao.constructor.name](explicacao);
            }
        }

        this.text += `
    # Falhar com mensagem: ${mensagem}
    li a0, 1
    li a7, 93               # sys_exit
    ecall`;
    }

    traduzirDeclaracaoFuncao(declaracao: FuncaoDeclaracao): void {
        const nomeFuncao = declaracao.simbolo?.lexema || 'funcao';

        this.text += `

${nomeFuncao}:
    addi sp, sp, -16
    sd   ra, 8(sp)
    sd   s0, 0(sp)
    addi s0, sp, 16`;

        if (
            declaracao.funcao &&
            declaracao.funcao.corpo &&
            Array.isArray(declaracao.funcao.corpo)
        ) {
            declaracao.funcao.corpo.forEach((decl: Declaracao) => {
                if (this.dicionarioDeclaracoes[decl.constructor.name]) {
                    this.dicionarioDeclaracoes[decl.constructor.name](decl);
                }
            });
        }

        this.text += `
    ld   ra, 8(sp)
    ld   s0, 0(sp)
    addi sp, sp, 16
    ret`;
    }

    traduzirDeclaracaoImportar(declaracao: Importar): void {
        this.text += `\n    # Importar: ${declaracao.caminho || 'unknown'}`;
    }

    traduzirDeclaracaoLeia(declaracao: Leia): void {
        let nomeVar: string | undefined;
        if (
            declaracao.argumentos &&
            declaracao.argumentos[0] &&
            declaracao.argumentos[0] instanceof Variavel
        ) {
            nomeVar = declaracao.argumentos[0].simbolo?.lexema;
        }
        if (!nomeVar) return;

        if (!this.variaveis.has(nomeVar)) {
            const varLabel = `var_${nomeVar}`;
            this.bss += `    ${varLabel}: .space 256\n`;
            this.variaveis.set(nomeVar, varLabel);
        }

        this.text += `
    li a0, 0                # fd stdin
    la a1, ${this.variaveis.get(nomeVar)}
    li a2, 256
    li a7, 63               # sys_read
    ecall`;
    }

    traduzirDeclaracaoPara(declaracao: Para): void {
        const labelInicio = this.gerarLabel();
        const labelFim = this.gerarLabel();

        if (declaracao.inicializador) {
            const tipoInicializador = declaracao.inicializador.constructor.name;
            if (this.dicionarioDeclaracoes[tipoInicializador]) {
                this.dicionarioDeclaracoes[tipoInicializador](declaracao.inicializador);
            } else if (this.dicionarioConstrutos[tipoInicializador]) {
                this.dicionarioConstrutos[tipoInicializador](declaracao.inicializador);
            }
        }

        this.text += `\n${labelInicio}:`;

        if (declaracao.condicao) {
            const condicao = this.dicionarioConstrutos[declaracao.condicao.constructor.name](
                declaracao.condicao
            );
            if (condicao !== 'a0') {
                this.emitirCarga('a0', condicao);
            }
            this.text += `\n    beqz a0, ${labelFim}`;
        }

        if (this.dicionarioDeclaracoes[declaracao.corpo.constructor.name]) {
            this.dicionarioDeclaracoes[declaracao.corpo.constructor.name](declaracao.corpo);
        }

        if (declaracao.incrementar) {
            if (this.dicionarioConstrutos[declaracao.incrementar.constructor.name]) {
                this.dicionarioConstrutos[declaracao.incrementar.constructor.name](
                    declaracao.incrementar
                );
            }
        }

        this.text += `
    j ${labelInicio}
${labelFim}:`;
    }

    traduzirDeclaracaoParaCada(declaracao: ParaCada): void {
        const labelInicio = this.gerarLabel();
        const labelFim = this.gerarLabel();
        const vetor = declaracao.vetorOuDicionario;

        let tamanhoVetor = 0;
        if (vetor instanceof Vetor) {
            tamanhoVetor = vetor.tamanho || 0;
        }

        // t0: contador; t1: limite (caller-saved, seguros aqui)
        this.text += `
    li t0, 0                # contador
    li t1, ${tamanhoVetor}
${labelInicio}:
    bge t0, t1, ${labelFim}`;

        if (this.dicionarioDeclaracoes[declaracao.corpo.constructor.name]) {
            this.dicionarioDeclaracoes[declaracao.corpo.constructor.name](declaracao.corpo);
        }

        this.text += `
    addi t0, t0, 1
    j ${labelInicio}
${labelFim}:`;
    }

    traduzirDeclaracaoRetorna(declaracao: Retorna): void {
        if (declaracao.valor) {
            const valor = this.dicionarioConstrutos[declaracao.valor.constructor.name](
                declaracao.valor
            );
            this.emitirCarga('a0', valor);
        }
        this.text += `
    ld   ra, 8(sp)
    ld   s0, 0(sp)
    addi sp, sp, 16
    ret`;
    }

    traduzirDeclaracaoSe(declaracao: Se): void {
        const labelSenao = this.gerarLabel();
        const labelFim = this.gerarLabel();

        const condicao = this.dicionarioConstrutos[declaracao.condicao.constructor.name](
            declaracao.condicao
        );

        if (condicao !== 'a0') {
            this.emitirCarga('a0', condicao);
        }
        this.text += `\n    beqz a0, ${labelSenao}`;

        if (this.dicionarioDeclaracoes[declaracao.caminhoEntao.constructor.name]) {
            this.dicionarioDeclaracoes[declaracao.caminhoEntao.constructor.name](
                declaracao.caminhoEntao
            );
        }

        this.text += `
    j ${labelFim}
${labelSenao}:`;

        if (
            declaracao.caminhoSenao &&
            this.dicionarioDeclaracoes[declaracao.caminhoSenao.constructor.name]
        ) {
            this.dicionarioDeclaracoes[declaracao.caminhoSenao.constructor.name](
                declaracao.caminhoSenao
            );
        }

        this.text += `\n${labelFim}:`;
    }

    traduzirDeclaracaoClasse(declaracao: Classe): void {
        this.text += `\n    # Classe: ${declaracao.simbolo?.lexema || 'unknown'}`;
    }

    traduzirDeclaracaoTente(declaracao: Tente): void {
        this.text += `\n    # Tente-pegue`;

        if (declaracao.caminhoTente && Array.isArray(declaracao.caminhoTente)) {
            declaracao.caminhoTente.forEach((decl: Declaracao) => {
                if (this.dicionarioDeclaracoes[decl.constructor.name]) {
                    this.dicionarioDeclaracoes[decl.constructor.name](decl);
                }
            });
        }
    }

    traduzirDeclaracaoConst(declaracao: Const): void {
        const nomeVar = declaracao.simbolo?.lexema;
        if (!nomeVar) return;

        const valor = this.dicionarioConstrutos[declaracao.inicializador.constructor.name](
            declaracao.inicializador
        );

        const varLabel = `const_${nomeVar}`;
        this.data += `    ${varLabel}: .dword ${valor}\n`;
        this.variaveis.set(nomeVar, varLabel);
    }

    traduzirDeclaracaoVar(declaracao: Var): void {
        const nomeVar = declaracao.simbolo?.lexema;
        if (!nomeVar) return;

        const varLabel = `var_${nomeVar}`;
        this.bss += `    ${varLabel}: .space 8\n`;
        this.variaveis.set(nomeVar, varLabel);

        if (declaracao.inicializador && declaracao.inicializador.valor !== null) {
            const tipoInicializador = declaracao.inicializador.constructor.name;

            if (declaracao.inicializador instanceof Vetor) {
                const labelVetor = this.traduzirConstrutoVetor(declaracao.inicializador);
                this.variaveis.set(nomeVar, labelVetor);
            } else if (this.dicionarioConstrutos[tipoInicializador]) {
                const valor = this.dicionarioConstrutos[tipoInicializador](
                    declaracao.inicializador
                );
                this.emitirCarga('a0', valor);
                this.text += `
    la a1, ${varLabel}
    sd a0, 0(a1)`;
            }
        }
    }

    criaStringLiteral(literal: Literal): string {
        const varLiteral = `Delegua_${this.gerarDigitoAleatorio()}`;
        this.data += `    ${varLiteral}: .asciz "${literal.valor}"\n`;
        return varLiteral;
    }

    criaTamanhoNaMemoriaReferenteAVar(nomeStringLiteral: string): string {
        return `tam_${nomeStringLiteral}`;
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): void {
        let nomeStringLiteral = '';
        let tamanhoString = '';

        if (declaracaoEscreva.argumentos[0] instanceof Literal) {
            nomeStringLiteral = this.criaStringLiteral(declaracaoEscreva.argumentos[0]);
            const stringValue = (declaracaoEscreva.argumentos[0] as Literal).valor as string;
            tamanhoString = String(stringValue.length);
        }

        // sys_write(fd=1, buf, count): a7=64, a0=fd, a1=buf, a2=count
        this.text += `
    la a1, ${nomeStringLiteral}
    li a2, ${tamanhoString}
    li a0, 1                # fd stdout
    li a7, 64               # sys_write
    ecall`;
    }

    saidaSistema(): void {
        this.text += `
    li a0, 0                # código de saída
    li a7, 93               # sys_exit
    ecall`;
    }

    traduzir(declaracoes: Declaracao[]): string {
        this.declaracoesDeClasses = declaracoes.filter(
            (declaracao) => declaracao instanceof Classe
        ) as Classe[];

        for (const declaracao of declaracoes) {
            if (this.dicionarioDeclaracoes[declaracao.constructor.name]) {
                this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao);
            }
        }
        this.saidaSistema();

        return this.bss + '\n' + this.data + '\n' + this.text;
    }
}
