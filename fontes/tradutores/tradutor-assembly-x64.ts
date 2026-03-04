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

export type PlataformaAlvo = 'linux' | 'windows';

export class TradutorAssemblyX64 {
    indentacao: number = 0;
    declaracoesDeClasses: Classe[];
    contadorLabels: number = 0;
    variaveis: Map<string, string> = new Map();
    registradoresDisponiveis: string[] = ['rbx', 'r12', 'r13', 'r14', 'r15'];
    pilhaRegistradores: string[] = [];

    bss = 'section .bss\n';
    data = 'section .data\n';
    text: string;

    constructor(public alvo: PlataformaAlvo = 'linux') {
        this.indentacao = 0;
        this.text = `
section .text
    ${this.alvo === 'linux' ? 'global _start' : 'global main'}
${this.alvo === 'linux' ? '_start:' : 'main:'}`;

        if (this.alvo === 'windows') {
            this.text =
                `
extern printf
` + this.text;
        }
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
        return `L${this.contadorLabels++}`;
    }

    obterRegistrador(): string {
        if (this.registradoresDisponiveis.length > 0) {
            const reg = this.registradoresDisponiveis.pop()!;
            this.pilhaRegistradores.push(reg);
            return reg;
        }
        return 'rax'; // fallback
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
        Continua: () => 'continue',
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
        Sustar: () => 'break',
        Classe: this.traduzirDeclaracaoClasse.bind(this),
        Tente: this.traduzirDeclaracaoTente.bind(this),
        Const: this.traduzirDeclaracaoConst.bind(this),
        Var: this.traduzirDeclaracaoVar.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
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
        const indice = this.dicionarioConstrutos[construto.indice.constructor.name](
            construto.indice
        );
        return `[${nomeVar} + ${indice} * 8]`;
    }

    trazudirConstrutoAcessoMetodo(construto: AcessoMetodo): string {
        const objeto = this.dicionarioConstrutos[construto.objeto.constructor.name](
            construto.objeto
        );
        return `${objeto}.${construto.nomeMetodo}`;
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
        const indice = this.dicionarioConstrutos[construto.indice.constructor.name](
            construto.indice
        );
        const valor = this.dicionarioConstrutos[construto.valor.constructor.name](construto.valor);

        this.text += `
    mov rax, ${valor}
    mov [${nomeVar} + ${indice} * 8], rax`;
    }

    traduzirConstrutoAtribuir(construto: Atribuir): void {
        // Atribuir tem a estrutura: { alvo, valor }
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
            this.bss += `    ${varLabel} resq 1\n`;
            this.variaveis.set(nomeVar, varLabel);
        }

        this.text += `
    mov rax, ${valor}
    mov [${this.variaveis.get(nomeVar)}], rax`;
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

        this.text += `
    mov rax, ${esquerda}
    mov ${reg}, ${direita}`;

        switch (operador) {
            case '+':
                this.text += `
    add rax, ${reg}`;
                break;
            case '-':
                this.text += `
    sub rax, ${reg}`;
                break;
            case '*':
                this.text += `
    imul rax, ${reg}`;
                break;
            case '/':
                this.text += `
    xor rdx, rdx
    idiv ${reg}`;
                break;
            case '%':
                this.text += `
    xor rdx, rdx
    idiv ${reg}
    mov rax, rdx`;
                break;
            default:
                this.text += `
    ; Operador ${operador} não implementado`;
        }

        this.liberarRegistrador(reg);
        return 'rax';
    }

    traduzirConstrutoChamada(construto: Chamada): void {
        let nomeFuncao: string = 'funcao';
        if (construto.entidadeChamada instanceof Variavel) {
            nomeFuncao = construto.entidadeChamada.simbolo?.lexema || 'funcao';
        }

        // Preparar argumentos (convenção de chamada System V AMD64)
        const registrosArgs =
            this.alvo === 'linux'
                ? ['rdi', 'rsi', 'rdx', 'rcx', 'r8', 'r9'] // System V AMD64 [web:8]
                : ['rcx', 'rdx', 'r8', 'r9']; // Windows x64 [web:2]
        construto.argumentos.forEach((arg: Construto, index: number) => {
            if (index < registrosArgs.length) {
                const valorArg = this.dicionarioConstrutos[arg.constructor.name](arg);
                this.text += `
    mov ${registrosArgs[index]}, ${valorArg}`;
            } else {
                // TODO: push extra args on stack according to target ABI
            }
        });

        this.text += `
    call ${nomeFuncao}`;
    }

    traduzirConstrutoDefinirValor(construto: DefinirValor): void {
        const objeto = this.dicionarioConstrutos[construto.objeto.constructor.name](
            construto.objeto
        );
        const valor = this.dicionarioConstrutos[construto.valor.constructor.name](construto.valor);

        this.text += `
    mov rax, ${valor}
    mov [${objeto}], rax`;
    }

    traduzirFuncaoConstruto(construto: FuncaoConstruto): void {
        const labelFuncao = `func_${this.gerarDigitoAleatorio()}`;

        this.text += `
${labelFuncao}:
    push rbp
    mov rbp, rsp`;

        // Traduzir corpo da função
        if (construto.corpo && Array.isArray(construto.corpo)) {
            construto.corpo.forEach((declaracao: Declaracao) => {
                if (this.dicionarioDeclaracoes[declaracao.constructor.name]) {
                    this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao);
                }
            });
        }

        this.text += `
    pop rbp
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

        this.text += `
    mov rax, ${esquerda}
    cmp rax, 0`;

        if (operador === 'e' || operador === '&&') {
            this.text += `
    je ${labelFim}
    mov rax, ${direita}
    cmp rax, 0
    je ${labelFim}
${labelVerdadeiro}:
    mov rax, 1
${labelFim}:`;
        } else if (operador === 'ou' || operador === '||') {
            this.text += `
    jne ${labelVerdadeiro}
    mov rax, ${direita}
    cmp rax, 0
    jne ${labelVerdadeiro}
    mov rax, 0
    jmp ${labelFim}
${labelVerdadeiro}:
    mov rax, 1
${labelFim}:`;
        }

        return 'rax';
    }

    traduzirConstrutoTipoDe(construto: TipoDe): string {
        // Simplificado - retorna tipo como número
        const expressao = this.dicionarioConstrutos[construto.valor.constructor.name](
            construto.valor
        );
        return expressao;
    }

    traduzirConstrutoUnario(construto: Unario): string {
        const operando = this.dicionarioConstrutos[construto.operando.constructor.name](
            construto.operando
        );
        const operador = construto.operador.lexema;

        this.text += `
    mov rax, ${operando}`;

        if (operador === '-') {
            this.text += `
    neg rax`;
        } else if (operador === '!' || operador === 'nao') {
            this.text += `
    cmp rax, 0
    sete al
    movzx rax, al`;
        }

        return 'rax';
    }

    traduzirConstrutoVariavel(construto: Variavel): string {
        const nomeVar = construto.simbolo?.lexema;
        if (nomeVar && this.variaveis.has(nomeVar)) {
            return `[${this.variaveis.get(nomeVar)}]`;
        }
        return nomeVar || 'unknown';
    }

    traduzirConstrutoVetor(construto: Vetor): string {
        const labelVetor = `vetor_${this.gerarDigitoAleatorio()}`;
        const tamanho = construto.valores?.length || 0;

        this.bss += `    ${labelVetor} resq ${tamanho}\n`;

        if (construto.valores && Array.isArray(construto.valores)) {
            construto.valores.forEach((valor: Construto, index: number) => {
                if (this.dicionarioConstrutos[valor.constructor.name]) {
                    const valorTraduzido = this.dicionarioConstrutos[valor.constructor.name](valor);
                    this.text += `
    mov rax, ${valorTraduzido}
    mov [${labelVetor} + ${index * 8}], rax`;
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

        const condicao = this.dicionarioConstrutos[declaracao.condicao.constructor.name](
            declaracao.condicao
        );

        this.text += `
    cmp ${condicao}, 0
    je ${labelFim}`;

        if (this.dicionarioDeclaracoes[declaracao.corpo.constructor.name]) {
            this.dicionarioDeclaracoes[declaracao.corpo.constructor.name](declaracao.corpo);
        }

        this.text += `
    jmp ${labelInicio}
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

                    this.text += `
    mov rax, ${valorEscolha}
    cmp rax, ${valorCaso}
    jne ${labelProximo}`;

                    if (caminho.declaracoes && Array.isArray(caminho.declaracoes)) {
                        caminho.declaracoes.forEach((decl: Declaracao) => {
                            if (this.dicionarioDeclaracoes[decl.constructor.name]) {
                                this.dicionarioDeclaracoes[decl.constructor.name](decl);
                            }
                        });
                    }

                    this.text += `
    jmp ${labelFim}
${labelProximo}:`;
                }
            });
        }

        this.text += `
${labelFim}:`;
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

        this.text += `
${labelInicio}:`;

        // Em Delégua, fazer-enquanto tem caminhoFazer que é um Bloco
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

            this.text += `
    cmp ${condicao}, 0
    jne ${labelInicio}`;
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

        if (this.alvo === 'linux') {
            this.text += `
        ; Falhar com mensagem: ${mensagem}
        mov eax, 1
        mov ebx, 1
        int 0x80`;
        } else {
            this.text += `
        ; Falhar com mensagem: ${mensagem}
        mov eax, 1
        ret`;
        }
    }

    traduzirDeclaracaoFuncao(declaracao: FuncaoDeclaracao): void {
        const nomeFuncao = declaracao.simbolo?.lexema || 'funcao';

        this.text += `
${nomeFuncao}:
    push rbp
    mov rbp, rsp`;

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
    pop rbp
    ret`;
    }

    traduzirDeclaracaoImportar(declaracao: Importar): void {
        // Importação é tratada em tempo de linkagem
        this.text += `
    ; Importar: ${declaracao.caminho || 'unknown'}`;
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
            this.bss += `    ${varLabel} resb 256\n`;
            this.variaveis.set(nomeVar, varLabel);
        }

        this.text += `
    mov eax, 3
    mov ebx, 0
    mov ecx, ${this.variaveis.get(nomeVar)}
    mov edx, 256
    int 0x80`;
    }

    traduzirDeclaracaoPara(declaracao: Para): void {
        const labelInicio = this.gerarLabel();
        const labelFim = this.gerarLabel();

        // Inicializador pode ser uma declaração ou construto
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
            const condicao = this.dicionarioConstrutos[declaracao.condicao.constructor.name](
                declaracao.condicao
            );
            this.text += `
    cmp ${condicao}, 0
    je ${labelFim}`;
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
    jmp ${labelInicio}
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
    xor rcx, rcx
${labelInicio}:
    cmp rcx, ${tamanhoVetor}
    jge ${labelFim}`;

        if (this.dicionarioDeclaracoes[declaracao.corpo.constructor.name]) {
            this.dicionarioDeclaracoes[declaracao.corpo.constructor.name](declaracao.corpo);
        }

        this.text += `
    inc rcx
    jmp ${labelInicio}
${labelFim}:`;
    }

    traduzirDeclaracaoRetorna(declaracao: Retorna): void {
        if (declaracao.valor) {
            const valor = this.dicionarioConstrutos[declaracao.valor.constructor.name](
                declaracao.valor
            );
            this.text += `
    mov rax, ${valor}`;
        }
        this.text += `
    pop rbp
    ret`;
    }

    traduzirDeclaracaoSe(declaracao: Se): void {
        const labelSenao = this.gerarLabel();
        const labelFim = this.gerarLabel();

        const condicao = this.dicionarioConstrutos[declaracao.condicao.constructor.name](
            declaracao.condicao
        );

        this.text += `
    cmp ${condicao}, 0
    je ${labelSenao}`;

        if (this.dicionarioDeclaracoes[declaracao.caminhoEntao.constructor.name]) {
            this.dicionarioDeclaracoes[declaracao.caminhoEntao.constructor.name](
                declaracao.caminhoEntao
            );
        }

        this.text += `
    jmp ${labelFim}
${labelSenao}:`;

        if (
            declaracao.caminhoSenao &&
            this.dicionarioDeclaracoes[declaracao.caminhoSenao.constructor.name]
        ) {
            this.dicionarioDeclaracoes[declaracao.caminhoSenao.constructor.name](
                declaracao.caminhoSenao
            );
        }

        this.text += `
${labelFim}:`;
    }

    traduzirDeclaracaoClasse(declaracao: Classe): void {
        // Classes em assembly são complexas - implementação básica
        this.text += `
    ; Classe: ${declaracao.simbolo?.lexema || 'unknown'}`;
    }

    traduzirDeclaracaoTente(declaracao: Tente): void {
        // Try-catch em assembly requer handler complexo
        this.text += `
    ; Tente-pegue`;

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
        this.data += `    ${varLabel} dq ${valor}\n`;
        this.variaveis.set(nomeVar, varLabel);
    }

    traduzirDeclaracaoVar(declaracao: Var): void {
        const nomeVar = declaracao.simbolo?.lexema;

        if (!nomeVar) return;

        const varLabel = `var_${nomeVar}`;

        this.bss += `    ${varLabel} resq 1\n`;
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
                const valor = this.dicionarioConstrutos[tipoInicializador](
                    declaracao.inicializador
                );
                this.text += `
    mov rax, ${valor}
    mov [${varLabel}], rax`;
            }
        }
    }

    criaStringLiteral(literal: Literal): string {
        const varLiteral = `Delegua_${this.gerarDigitoAleatorio()}`;
        this.data += `    ${varLiteral} db '${literal.valor}', 0\n`;
        return varLiteral;
    }

    criaTamanhoNaMemoriaReferenteAVar(nomeStringLiteral: string): string {
        const varTamanho = `tam_${nomeStringLiteral}`;
        this.data += `    ${varTamanho} equ $ - ${nomeStringLiteral}\n`;
        return varTamanho;
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): void {
        let tam_string_literal = '';
        let nome_string_literal = '';

        if (declaracaoEscreva.argumentos[0] instanceof Literal) {
            nome_string_literal = this.criaStringLiteral(declaracaoEscreva.argumentos[0]);
            tam_string_literal = this.criaTamanhoNaMemoriaReferenteAVar(nome_string_literal);
        }

        if (this.alvo === 'linux') {
            this.text += `
    mov edx, ${tam_string_literal}
    mov ecx, ${nome_string_literal}
    mov ebx, 1        ; fd stdout
    mov eax, 4        ; sys_write
    int 0x80`;
        } else {
            // Windows: prototype `extern printf` and follow Win64 calling convention
            // RCX = format pointer; here we use the literal directly as a C string
            this.text += `
    lea rcx, [rel ${nome_string_literal}]
    call printf`;
        }
    }

    saidaSistema(): void {
        if (this.alvo === 'linux') {
            this.text += `
        mov eax, 1        ; sys_exit
        xor ebx, ebx      ; status 0
        int 0x80`;
        } else {
            // Windows: return from main with 0 in EAX
            this.text += `
        xor eax, eax
        ret`;
        }
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
        this.saidaSistema();

        resultado += this.bss + '\n' + this.data + '\n' + this.text;

        return resultado;
    }
}
