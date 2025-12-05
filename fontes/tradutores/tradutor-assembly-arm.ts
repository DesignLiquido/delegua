import { AcessoIndiceVariavel, AcessoMetodo, Agrupamento, AtribuicaoPorIndice, Atribuir, Binario, Chamada, Construto, DefinirValor, FuncaoConstruto, Leia, Literal, Logico, TipoDe, Unario, Variavel, Vetor } from '../construtos';
import { Bloco, Classe, Const, Declaracao, Enquanto, Escolha, Escreva, Expressao, Falhar, Fazer, FuncaoDeclaracao, Importar, Para, ParaCada, Retorna, Se, Tente, Var } from '../declaracoes';
import { CaminhoEscolha } from '../interfaces/construtos';

export type PlataformaAlvoARM = 'linux-arm' | 'android';

export class TradutorAssemblyARM {
    indentacao: number = 0;
    declaracoesDeClasses: Classe[];
    contadorLabels: number = 0;
    variaveis: Map<string, string> = new Map();
    registradoresDisponiveis: string[] = ['r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10'];
    pilhaRegistradores: string[] = [];

    bss = '.bss\n';
    data = '.data\n';
    text: string;

    constructor(public alvo: PlataformaAlvoARM = 'linux-arm') {
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
        return 'r0'; // fallback
    }

    liberarRegistrador(reg: string): void {
        const index = this.pilhaRegistradores.indexOf(reg);
        if (index > -1) {
            this.pilhaRegistradores.splice(index, 1);
            this.registradoresDisponiveis.push(reg);
        }
    }

    dicionarioConstrutos = {
        AcessoIndiceVariavel: this.traduzirAcessoIndiceVariavel.bind(this),
        AcessoMetodoOuPropriedade: this.trazudirConstrutoAcessoMetodo.bind(this),
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
        Continua: () => 'b .continue_label',
        Escolha: this.traduzirDeclaracaoEscolha.bind(this),
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
        Sustar: () => 'b .break_label',
        Classe: this.traduzirDeclaracaoClasse.bind(this),
        // Tente: this.traduzirDeclaracaoTente.bind(this),
        // Const: this.traduzirDeclaracaoConst.bind(this),
        // Var: this.traduzirDeclaracaoVar.bind(this),
        // Escreva: this.traduzirDeclaracaoEscreva.bind(this),
    };

    // Implementação dos Construtos
    traduzirAcessoIndiceVariavel(construto: AcessoIndiceVariavel): string {
        let nomeVar: string | undefined;
        if (construto.entidadeChamada instanceof Variavel) {
            nomeVar = construto.entidadeChamada.simbolo?.lexema;
        }
        if (!nomeVar) {
            nomeVar = 'unknown';
        }
        const indice = this.dicionarioConstrutos[construto.indice.constructor.name](construto.indice);
        
        const reg = this.obterRegistrador();
        this.text += `
    ldr ${reg}, =${nomeVar}
    ldr r0, =${indice}
    lsl r0, r0, #2          @ multiply index by 4 (word size)
    add ${reg}, ${reg}, r0
    ldr r0, [${reg}]`;
        this.liberarRegistrador(reg);
        
        return 'r0';
    }

    trazudirConstrutoAcessoMetodo(construto: AcessoMetodo): string {
        const objeto = this.dicionarioConstrutos[construto.objeto.constructor.name](construto.objeto);
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
        if (!nomeVar) {
            nomeVar = 'unknown';
        }
        
        const indice = this.dicionarioConstrutos[construto.indice.constructor.name](construto.indice);
        const valor = this.dicionarioConstrutos[construto.valor.constructor.name](construto.valor);
        
        const reg = this.obterRegistrador();
        this.text += `
    ldr ${reg}, =${nomeVar}
    ldr r1, =${indice}
    lsl r1, r1, #2          @ multiply by 4
    add ${reg}, ${reg}, r1
    ldr r1, =${valor}
    str r1, [${reg}]`;
        this.liberarRegistrador(reg);
    }

    traduzirConstrutoAtribuir(construto: Atribuir): void {
        let nomeVar: string | undefined;
        if (construto.alvo instanceof Variavel) {
            nomeVar = construto.alvo.simbolo?.lexema;
        }
        
        if (!nomeVar) {
            return;
        }
        
        const valor = this.dicionarioConstrutos[construto.valor.constructor.name](construto.valor);
        
        if (!this.variaveis.has(nomeVar)) {
            const varLabel = `var_${nomeVar}`;
            this.bss += `    ${varLabel}: .space 4\n`;
            this.variaveis.set(nomeVar, varLabel);
        }
        
        this.text += `
    ldr r0, =${valor}
    ldr r1, =${this.variaveis.get(nomeVar)}
    str r0, [r1]`;
    }

    traduzirConstrutoBinario(construto: Binario): string {
        const esquerda = this.dicionarioConstrutos[construto.esquerda.constructor.name](construto.esquerda);
        const direita = this.dicionarioConstrutos[construto.direita.constructor.name](construto.direita);
        const operador = construto.operador.lexema;
        
        const reg = this.obterRegistrador();
        
        // Load left operand into r0
        if (esquerda !== 'r0') {
            this.text += `
    ldr r0, =${esquerda}`;
        }
        
        // Load right operand into reg
        this.text += `
    ldr ${reg}, =${direita}`;
        
        switch (operador) {
            case '+':
                this.text += `
    add r0, r0, ${reg}`;
                break;
            case '-':
                this.text += `
    sub r0, r0, ${reg}`;
                break;
            case '*':
                this.text += `
    mul r0, r0, ${reg}`;
                break;
            case '/':
                this.text += `
    sdiv r0, r0, ${reg}`;
                break;
            case '%':
                this.text += `
    sdiv r1, r0, ${reg}
    mul r1, r1, ${reg}
    sub r0, r0, r1          @ r0 = r0 - (r0/reg)*reg`;
                break;
            case '<':
                this.text += `
    cmp r0, ${reg}
    movlt r0, #1
    movge r0, #0`;
                break;
            case '>':
                this.text += `
    cmp r0, ${reg}
    movgt r0, #1
    movle r0, #0`;
                break;
            case '<=':
                this.text += `
    cmp r0, ${reg}
    movle r0, #1
    movgt r0, #0`;
                break;
            case '>=':
                this.text += `
    cmp r0, ${reg}
    movge r0, #1
    movlt r0, #0`;
                break;
            case '==':
            case '===':
                this.text += `
    cmp r0, ${reg}
    moveq r0, #1
    movne r0, #0`;
                break;
            case '!=':
            case '!==':
                this.text += `
    cmp r0, ${reg}
    movne r0, #1
    moveq r0, #0`;
                break;
            default:
                this.text += `
    @ Operador ${operador} não implementado`;
        }
        
        this.liberarRegistrador(reg);
        return 'r0';
    }

    traduzirConstrutoChamada(construto: Chamada): void {
        let nomeFuncao: string = 'funcao';
        if (construto.entidadeChamada instanceof Variavel) {
            nomeFuncao = construto.entidadeChamada.simbolo?.lexema || 'funcao';
        }
        
        // ARM calling convention: r0-r3 for first 4 args, rest on stack
        const registrosArgs = ['r0', 'r1', 'r2', 'r3'];
        
        construto.argumentos.forEach((arg: Construto, index: number) => {
            if (index < registrosArgs.length) {
                const valorArg = this.dicionarioConstrutos[arg.constructor.name](arg);
                if (valorArg !== registrosArgs[index]) {
                    this.text += `
    ldr ${registrosArgs[index]}, =${valorArg}`;
                }
            } else {
                // Push extra args on stack
                const valorArg = this.dicionarioConstrutos[arg.constructor.name](arg);
                this.text += `
    ldr r0, =${valorArg}
    push {r0}`;
            }
        });
        
        this.text += `
    bl ${nomeFuncao}`;
    }

    traduzirConstrutoDefinirValor(construto: DefinirValor): void {
        const objeto = this.dicionarioConstrutos[construto.objeto.constructor.name](construto.objeto);
        const valor = this.dicionarioConstrutos[construto.valor.constructor.name](construto.valor);
        
        this.text += `
    ldr r0, =${valor}
    ldr r1, =${objeto}
    str r0, [r1]`;
    }

    traduzirFuncaoConstruto(construto: FuncaoConstruto): void {
        const labelFuncao = `func_${this.gerarDigitoAleatorio()}`;
        
        this.text += `

${labelFuncao}:
    push {fp, lr}
    mov fp, sp`;
        
        // Traduzir corpo da função
        if (construto.corpo && Array.isArray(construto.corpo)) {
            construto.corpo.forEach((declaracao: Declaracao) => {
                if (this.dicionarioDeclaracoes[declaracao.constructor.name]) {
                    this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao);
                }
            });
        }
        
        this.text += `
    mov sp, fp
    pop {fp, pc}`;
    }

    traduzirConstrutoLiteral(construto: Literal): string {
        if (typeof construto.valor === 'string') {
            return this.criaStringLiteral(construto);
        }
        return String(construto.valor);
    }

    traduzirConstrutoLogico(construto: Logico): string {
        const esquerda = this.dicionarioConstrutos[construto.esquerda.constructor.name](construto.esquerda);
        const direita = this.dicionarioConstrutos[construto.direita.constructor.name](construto.direita);
        const operador = construto.operador.lexema;
        
        const labelVerdadeiro = this.gerarLabel();
        const labelFim = this.gerarLabel();
        
        this.text += `
    ldr r0, =${esquerda}
    cmp r0, #0`;
        
        if (operador === 'e' || operador === '&&') {
            this.text += `
    beq ${labelFim}
    ldr r0, =${direita}
    cmp r0, #0
    beq ${labelFim}
${labelVerdadeiro}:
    mov r0, #1
${labelFim}:`;
        } else if (operador === 'ou' || operador === '||') {
            this.text += `
    bne ${labelVerdadeiro}
    ldr r0, =${direita}
    cmp r0, #0
    bne ${labelVerdadeiro}
    mov r0, #0
    b ${labelFim}
${labelVerdadeiro}:
    mov r0, #1
${labelFim}:`;
        }
        
        return 'r0';
    }

    traduzirConstrutoTipoDe(construto: TipoDe): string {
        const expressao = this.dicionarioConstrutos[construto.valor.constructor.name](construto.valor);
        return expressao;
    }

    traduzirConstrutoUnario(construto: Unario): string {
        const operando = this.dicionarioConstrutos[construto.operando.constructor.name](construto.operando);
        const operador = construto.operador.lexema;
        
        this.text += `
    ldr r0, =${operando}`;
        
        if (operador === '-') {
            this.text += `
    neg r0, r0`;
        } else if (operador === '!' || operador === 'nao') {
            this.text += `
    cmp r0, #0
    moveq r0, #1
    movne r0, #0`;
        }
        
        return 'r0';
    }

    traduzirConstrutoVariavel(construto: Variavel): string {
        const nomeVar = construto.simbolo?.lexema;
        if (nomeVar && this.variaveis.has(nomeVar)) {
            const varLabel = this.variaveis.get(nomeVar)!;
            this.text += `
    ldr r0, =${varLabel}
    ldr r0, [r0]`;
            return 'r0';
        }
        return nomeVar || 'unknown';
    }

    traduzirConstrutoVetor(construto: Vetor): string {
        const labelVetor = `vetor_${this.gerarDigitoAleatorio()}`;
        const tamanho = construto.valores?.length || 0;
        
        this.bss += `    ${labelVetor}: .space ${tamanho * 4}\n`;
        
        if (construto.valores && Array.isArray(construto.valores)) {
            construto.valores.forEach((valor: Construto, index: number) => {
                if (this.dicionarioConstrutos[valor.constructor.name]) {
                    const valorTraduzido = this.dicionarioConstrutos[valor.constructor.name](valor);
                    this.text += `
    ldr r0, =${valorTraduzido}
    ldr r1, =${labelVetor}
    str r0, [r1, #${index * 4}]`;
                }
            });
        }
        
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
        
        this.text += `
${labelInicio}:`;
        
        const condicao = this.dicionarioConstrutos[declaracao.condicao.constructor.name](declaracao.condicao);
        
        this.text += `
    cmp ${condicao}, #0
    beq ${labelFim}`;
        
        if (this.dicionarioDeclaracoes[declaracao.corpo.constructor.name]) {
            this.dicionarioDeclaracoes[declaracao.corpo.constructor.name](declaracao.corpo);
        }
        
        this.text += `
    b ${labelInicio}
${labelFim}:`;
    }

    traduzirDeclaracaoEscolha(declaracao: Escolha): void {
        const labelFim = this.gerarLabel();
        const valorEscolha = this.dicionarioConstrutos[declaracao.identificadorOuLiteral.constructor.name](declaracao.identificadorOuLiteral);
        
        if (declaracao.caminhos && Array.isArray(declaracao.caminhos)) {
            declaracao.caminhos.forEach((caminho: CaminhoEscolha) => {
                const labelProximo = this.gerarLabel();
                if (caminho.condicoes && caminho.condicoes[0]) {
                    const valorCaso = this.dicionarioConstrutos[caminho.condicoes[0].constructor.name](caminho.condicoes[0]);
                    
                    this.text += `
    ldr r0, =${valorEscolha}
    ldr r1, =${valorCaso}
    cmp r0, r1
    bne ${labelProximo}`;
                    
                    if (caminho.declaracoes && Array.isArray(caminho.declaracoes)) {
                        caminho.declaracoes.forEach((decl: Declaracao) => {
                            if (this.dicionarioDeclaracoes[decl.constructor.name]) {
                                this.dicionarioDeclaracoes[decl.constructor.name](decl);
                            }
                        });
                    }
                    
                    this.text += `
    b ${labelFim}
${labelProximo}:`;
                }
            });
        }
        
        this.text += `
${labelFim}:`;
    }

    traduzirDeclaracaoExpressao(declaracao: Expressao): void {
        if (declaracao.expressao && this.dicionarioConstrutos[declaracao.expressao.constructor.name]) {
            this.dicionarioConstrutos[declaracao.expressao.constructor.name](declaracao.expressao);
        }
    }

    traduzirDeclaracaoFazer(declaracao: Fazer): void {
        const labelInicio = this.gerarLabel();
        
        this.text += `
${labelInicio}:`;
        
        if (declaracao.caminhoFazer && declaracao.caminhoFazer.declaracoes) {
            declaracao.caminhoFazer.declaracoes.forEach((decl: Declaracao) => {
                if (this.dicionarioDeclaracoes[decl.constructor.name]) {
                    this.dicionarioDeclaracoes[decl.constructor.name](decl);
                }
            });
        }
        
        if (declaracao.condicaoEnquanto) {
            const condicao = this.dicionarioConstrutos[declaracao.condicaoEnquanto.constructor.name](declaracao.condicaoEnquanto);
            
            this.text += `
    cmp ${condicao}, #0
    bne ${labelInicio}`;
        }
    }

    traduzirDeclaracaoFalhar(declaracao: Falhar): void {
        let mensagem: string = '"Erro"';
        if (declaracao.explicacao && typeof declaracao.explicacao === 'object' && 'constructor' in declaracao.explicacao) {
            const explicacao = declaracao.explicacao as Construto;
            if (explicacao.constructor && this.dicionarioConstrutos[explicacao.constructor.name]) {
                mensagem = this.dicionarioConstrutos[explicacao.constructor.name](explicacao);
            }
        }
        
        this.text += `
    @ Falhar com mensagem: ${mensagem}
    mov r0, #1
    mov r7, #1              @ sys_exit
    swi 0`;
    }

    traduzirDeclaracaoFuncao(declaracao: FuncaoDeclaracao): void {
        const nomeFuncao = declaracao.simbolo?.lexema || 'funcao';
        
        this.text += `

${nomeFuncao}:
    push {fp, lr}
    mov fp, sp`;
        
        if (declaracao.funcao && declaracao.funcao.corpo && Array.isArray(declaracao.funcao.corpo)) {
            declaracao.funcao.corpo.forEach((decl: Declaracao) => {
                if (this.dicionarioDeclaracoes[decl.constructor.name]) {
                    this.dicionarioDeclaracoes[decl.constructor.name](decl);
                }
            });
        }
        
        this.text += `
    mov sp, fp
    pop {fp, pc}`;
    }

    traduzirDeclaracaoImportar(declaracao: Importar): void {
        this.text += `
    @ Importar: ${declaracao.caminho || 'unknown'}`;
    }

    traduzirDeclaracaoLeia(declaracao: Leia): void {
        let nomeVar: string | undefined;
        if (declaracao.argumentos && declaracao.argumentos[0] && declaracao.argumentos[0] instanceof Variavel) {
            nomeVar = declaracao.argumentos[0].simbolo?.lexema;
        }
        
        if (!nomeVar) return;
        
        if (!this.variaveis.has(nomeVar)) {
            const varLabel = `var_${nomeVar}`;
            this.bss += `    ${varLabel}: .space 256\n`;
            this.variaveis.set(nomeVar, varLabel);
        }
        
        this.text += `
    ldr r1, =${this.variaveis.get(nomeVar)}
    mov r2, #256
    mov r0, #0              @ stdin
    mov r7, #3              @ sys_read
    swi 0`;
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
        
        this.text += `
${labelInicio}:`;
        
        if (declaracao.condicao) {
            const condicao = this.dicionarioConstrutos[declaracao.condicao.constructor.name](declaracao.condicao);
            this.text += `
    cmp ${condicao}, #0
    beq ${labelFim}`;
        }
        
        if (this.dicionarioDeclaracoes[declaracao.corpo.constructor.name]) {
            this.dicionarioDeclaracoes[declaracao.corpo.constructor.name](declaracao.corpo);
        }
        
        if (declaracao.incrementar) {
            if (this.dicionarioConstrutos[declaracao.incrementar.constructor.name]) {
                this.dicionarioConstrutos[declaracao.incrementar.constructor.name](declaracao.incrementar);
            }
        }
        
        this.text += `
    b ${labelInicio}
${labelFim}:`;
    }

    traduzirDeclaracaoParaCada(declaracao: ParaCada): void {
        const labelInicio = this.gerarLabel();
        const labelFim = this.gerarLabel();
        let nomeVar: string | undefined;
        if (declaracao.variavelIteracao instanceof Variavel) {
            nomeVar = declaracao.variavelIteracao.simbolo?.lexema;
        }
        const vetor = declaracao.vetorOuDicionario;
        
        let tamanhoVetor = 0;
        if (vetor instanceof Vetor) {
            tamanhoVetor = vetor.tamanho || 0;
        }
        
        this.text += `
    mov r4, #0              @ counter
${labelInicio}:
    cmp r4, #${tamanhoVetor}
    bge ${labelFim}`;
        
        if (this.dicionarioDeclaracoes[declaracao.corpo.constructor.name]) {
            this.dicionarioDeclaracoes[declaracao.corpo.constructor.name](declaracao.corpo);
        }
        
        this.text += `
    add r4, r4, #1
    b ${labelInicio}
${labelFim}:`;
    }

    traduzirDeclaracaoRetorna(declaracao: Retorna): void {
        if (declaracao.valor) {
            const valor = this.dicionarioConstrutos[declaracao.valor.constructor.name](declaracao.valor);
            this.text += `
    ldr r0, =${valor}`;
        }
        this.text += `
    mov sp, fp
    pop {fp, pc}`;
    }

    traduzirDeclaracaoSe(declaracao: Se): void {
        const labelSenao = this.gerarLabel();
        const labelFim = this.gerarLabel();
        
        const condicao = this.dicionarioConstrutos[declaracao.condicao.constructor.name](declaracao.condicao);
        
        this.text += `
    cmp ${condicao}, #0
    beq ${labelSenao}`;
        
        if (this.dicionarioDeclaracoes[declaracao.caminhoEntao.constructor.name]) {
            this.dicionarioDeclaracoes[declaracao.caminhoEntao.constructor.name](declaracao.caminhoEntao);
        }
        
        this.text += `
    b ${labelFim}
${labelSenao}:`;
        
        if (declaracao.caminhoSenao && this.dicionarioDeclaracoes[declaracao.caminhoSenao.constructor.name]) {
            this.dicionarioDeclaracoes[declaracao.caminhoSenao.constructor.name](declaracao.caminhoSenao);
        }
        
        this.text += `
${labelFim}:`;
    }

    traduzirDeclaracaoClasse(declaracao: Classe): void {
        this.text += `
    @ Classe: ${declaracao.simbolo?.lexema || 'unknown'}`;
    }

    traduzirDeclaracaoTente(declaracao: Tente): void {
        this.text += `
    @ Tente-pegue`;
        
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
        
        const valor = this.dicionarioConstrutos[declaracao.inicializador.constructor.name](declaracao.inicializador);
        
        const varLabel = `const_${nomeVar}`;
        this.data += `    ${varLabel}: .word ${valor}\n`;
        this.variaveis.set(nomeVar, varLabel);
    }

    traduzirDeclaracaoVar(declaracao: Var): void {
        const nomeVar = declaracao.simbolo?.lexema;
        
        if (!nomeVar) return;
        
        const varLabel = `var_${nomeVar}`;
        
        this.bss += `    ${varLabel}: .space 4\n`;
        this.variaveis.set(nomeVar, varLabel);
        
        if (declaracao.inicializador) {
            const tipoInicializador = declaracao.inicializador.constructor.name;
            
            // Verificar se é um vetor
            if (declaracao.inicializador instanceof Vetor) {
                // Vetor precisa de tratamento especial
                const labelVetor = this.traduzirConstrutoVetor(declaracao.inicializador);
                // Associar o nome da variável com o label do vetor
                this.variaveis.set(nomeVar, labelVetor);
            } else if (this.dicionarioConstrutos[tipoInicializador]) {
                const valor = this.dicionarioConstrutos[tipoInicializador](declaracao.inicializador);
                this.text += `
    ldr r0, =${valor}
    ldr r1, =${varLabel}
    str r0, [r1]`;
            }
        }
    }

    criaStringLiteral(literal: Literal): string {
        const varLiteral = `Delegua_${this.gerarDigitoAleatorio()}`;
        this.data += `    ${varLiteral}: .asciz "${literal.valor}"\n`;
        return varLiteral;
    }

    criaTamanhoNaMemoriaReferenteAVar(nomeStringLiteral: string): string {
        const varTamanho = `tam_${nomeStringLiteral}`;
        // Em ARM, calculamos o tamanho de forma diferente
        // Podemos usar uma diretiva ou calcular em tempo de execução
        return varTamanho;
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): void {
        let tam_string_literal = '';
        let nome_string_literal = '';

        if (declaracaoEscreva.argumentos[0] instanceof Literal) {
            nome_string_literal = this.criaStringLiteral(declaracaoEscreva.argumentos[0]);
            // Para ARM, precisamos calcular o tamanho da string
            const stringValue = (declaracaoEscreva.argumentos[0] as Literal).valor as string;
            tam_string_literal = String(stringValue.length);
        }

        // ARM Linux syscall: write(fd, buffer, count)
        // r0 = fd (1 = stdout)
        // r1 = buffer address
        // r2 = count (length)
        // r7 = syscall number (4 = sys_write)
        this.text += `
    ldr r1, =${nome_string_literal}
    mov r2, #${tam_string_literal}
    mov r0, #1              @ fd stdout
    mov r7, #4              @ sys_write
    swi 0`;
    }

    saida_sistema(): void {
        // ARM Linux syscall: exit(status)
        // r0 = status (0)
        // r7 = syscall number (1 = sys_exit)
        this.text += `
    mov r0, #1              @ exit status
    mov r7, #1              @ sys_exit
    swi 0`;
    }

    traduzir(declaracoes: Declaracao[]): string {
        let resultado = '';
        this.declaracoesDeClasses = declaracoes.filter(
            (declaracao) => declaracao instanceof Classe
        ) as Classe[];

        for (const declaracao of declaracoes) {
            if (this.dicionarioDeclaracoes[declaracao.constructor.name]) {
                this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao);
            }
        }
        this.saida_sistema();

        resultado += this.bss + '\n' + this.data + '\n' + this.text;

        return resultado;
    }
}