import { Alocacao } from './alocador-registradores';
import { ordemPosFixaReversa } from './dominancia';
import { IRBloco, IRFuncao, IRInstrucao, IRPrograma, IRValor } from './ir';

export type PlataformaAlvo = 'linux' | 'windows';

export interface FuncaoProcessada {
    funcao: IRFuncao;
    alocacao: Map<string, Alocacao>;
}

const ESCRATCH_A = 'rax';
const ESCRATCH_B = 'r11';
const ESCRATCH_ENDERECO = 'rdx';

function registradoresAbi(alvo: PlataformaAlvo): string[] {
    return alvo === 'linux' ? ['rdi', 'rsi', 'rdx', 'rcx', 'r8', 'r9'] : ['rcx', 'rdx', 'r8', 'r9'];
}

function escaparTextoNasm(valor: string): string {
    const partes = valor.split("'");
    return partes.map((parte) => `'${parte}'`).join(', 39, ');
}

function textoOffset(offset: number): string {
    return offset >= 0 ? `+${offset}` : `${offset}`;
}

/**
 * Gera NASM a partir do IR já processado (SSA destruída, com alocação de registradores).
 * Quadro de pilha de cada função real, de cima (perto de rbp) para baixo:
 *   1) área de salvamento dos registradores callee-saved usados pela paleta (a função,
 *      como "callee", é responsável por preservá-los perante quem a chamou);
 *   2) slots de spill decididos pelo alocador de registradores;
 *   3) vetores de tamanho fixo locais à função.
 * `_start`/`main` (o "principal" implícito) não tem quem preservar registradores para —
 * ninguém retorna para ele — então pula a área (1).
 */
export class CodegenX64 {
    private linhas: string[] = [];
    /** Deslocamento (negativo) onde começam spills/vetores da função atual, abaixo da área de registradores salvos. */
    private deslocamentoBase = 0;

    constructor(
        private alvo: PlataformaAlvo,
        private paleta: string[]
    ) {}

    gerar(programa: IRPrograma, funcoes: FuncaoProcessada[]): string {
        const bss: string[] = [];
        const dados: string[] = [];

        for (const nome of programa.globaisEscalares.keys()) {
            bss.push(`    g_${nome} resq 1`);
        }
        for (const [nome, info] of programa.globaisArranjos) {
            bss.push(`    g_${nome} resq ${info.tamanho}`);
        }
        bss.push('    __print_buf resb 24');

        for (const [rotulo, texto] of programa.literaisTexto) {
            dados.push(`    ${rotulo}: db ${escaparTextoNasm(texto)}, 0`);
            dados.push(`    tam_${rotulo} equ $ - ${rotulo} - 1`);
        }
        if (this.alvo === 'windows') {
            dados.push(`    __fmt_int db '%d', 10, 0`);
        }

        this.linhas = [];
        this.linhas.push('section .text');
        this.linhas.push(`    ${this.alvo === 'linux' ? 'global _start' : 'global main'}`);
        if (this.alvo === 'windows') this.linhas.push('extern printf');

        const principal = funcoes.find((f) => f.funcao.ehImplicitaTopo)!;
        const outras = funcoes.filter((f) => !f.funcao.ehImplicitaTopo);

        this.gerarFuncaoPrincipal(principal);
        for (const processada of outras) {
            this.gerarFuncao(processada);
        }

        this.gerarHelperImprimirNumero();

        return (
            'section .bss\n' +
            bss.join('\n') +
            '\n\nsection .data\n' +
            dados.join('\n') +
            '\n\n' +
            this.linhas.join('\n') +
            '\n'
        );
    }

    private rotuloDoBloco(funcao: IRFuncao, blocoId: string): string {
        if (blocoId === funcao.blocoEntrada) {
            if (funcao.ehImplicitaTopo) return this.alvo === 'linux' ? '_start' : 'main';
            return funcao.nome;
        }
        return `${funcao.ehImplicitaTopo ? 'principal' : funcao.nome}_${blocoId}`;
    }

    private resolverOperando(valor: IRValor, alocacao: Map<string, Alocacao>): string {
        switch (valor.classe) {
            case 'constante':
                if (typeof valor.valor === 'boolean') return valor.valor ? '1' : '0';
                return String(valor.valor);
            case 'registrador': {
                const local = alocacao.get(valor.nome);
                if (!local) throw new Error(`codegen: registrador '${valor.nome}' sem alocação.`);
                return local.tipo === 'registrador'
                    ? local.fisico
                    : `[rbp${textoOffset(this.deslocamentoBase + local.offsetBytes)}]`;
            }
            case 'argumentoFisico':
                return registradoresAbi(this.alvo)[valor.indice];
            case 'rotulo':
                return valor.nome;
        }
    }

    private armazenar(dst: string, alocacao: Map<string, Alocacao>, regFisicoOrigem: string): void {
        const local = alocacao.get(dst);
        if (!local) throw new Error(`codegen: destino '${dst}' sem alocação.`);
        if (local.tipo === 'registrador') {
            if (local.fisico !== regFisicoOrigem) this.linhas.push(`    mov ${local.fisico}, ${regFisicoOrigem}`);
        } else {
            this.linhas.push(`    mov [rbp${textoOffset(this.deslocamentoBase + local.offsetBytes)}], ${regFisicoOrigem}`);
        }
    }

    private enderecoBaseArranjo(
        nomeArranjo: string,
        offsetsArranjosLocais: Map<string, number>
    ): string {
        const offsetLocal = offsetsArranjosLocais.get(nomeArranjo);
        if (offsetLocal !== undefined) return `rbp${textoOffset(offsetLocal)}`;
        return this.alvo === 'linux' ? `g_${nomeArranjo}` : `rel g_${nomeArranjo}`;
    }

    private gerarInstrucao(
        instrucao: IRInstrucao,
        alocacao: Map<string, Alocacao>,
        offsetsArranjosLocais: Map<string, number>
    ): void {
        switch (instrucao.op) {
            case 'const':
                this.linhas.push(`    mov ${ESCRATCH_A}, ${instrucao.valor}`);
                this.armazenar(instrucao.dst, alocacao, ESCRATCH_A);
                break;
            case 'copia':
                this.linhas.push(`    mov ${ESCRATCH_A}, ${this.resolverOperando(instrucao.src, alocacao)}`);
                this.armazenar(instrucao.dst, alocacao, ESCRATCH_A);
                break;
            case 'bin':
                this.gerarBinario(instrucao, alocacao);
                break;
            case 'neg':
                this.linhas.push(`    mov ${ESCRATCH_A}, ${this.resolverOperando(instrucao.src, alocacao)}`);
                this.linhas.push(`    neg ${ESCRATCH_A}`);
                this.armazenar(instrucao.dst, alocacao, ESCRATCH_A);
                break;
            case 'nao':
                this.linhas.push(`    mov ${ESCRATCH_A}, ${this.resolverOperando(instrucao.src, alocacao)}`);
                this.linhas.push(`    cmp ${ESCRATCH_A}, 0`);
                this.linhas.push(`    sete al`);
                this.linhas.push(`    movzx ${ESCRATCH_A}, al`);
                this.armazenar(instrucao.dst, alocacao, ESCRATCH_A);
                break;
            case 'enderecoRotulo':
                if (this.alvo === 'linux') {
                    this.linhas.push(`    mov ${ESCRATCH_A}, ${instrucao.rotulo}`);
                } else {
                    this.linhas.push(`    lea ${ESCRATCH_A}, [rel ${instrucao.rotulo}]`);
                }
                this.armazenar(instrucao.dst, alocacao, ESCRATCH_A);
                break;
            case 'carregarGlobal':
                this.linhas.push(`    mov ${ESCRATCH_A}, [g_${instrucao.rotulo}]`);
                this.armazenar(instrucao.dst, alocacao, ESCRATCH_A);
                break;
            case 'armazenarGlobal':
                this.linhas.push(`    mov ${ESCRATCH_A}, ${this.resolverOperando(instrucao.valor, alocacao)}`);
                this.linhas.push(`    mov [g_${instrucao.rotulo}], ${ESCRATCH_A}`);
                break;
            case 'indiceLer':
                this.gerarEnderecoIndice(instrucao.arranjo, instrucao.indice, alocacao, offsetsArranjosLocais);
                this.linhas.push(`    mov ${ESCRATCH_A}, [${ESCRATCH_ENDERECO}]`);
                this.armazenar(instrucao.dst, alocacao, ESCRATCH_A);
                break;
            case 'indiceEscrever':
                this.gerarEnderecoIndice(instrucao.arranjo, instrucao.indice, alocacao, offsetsArranjosLocais);
                this.linhas.push(`    push ${ESCRATCH_ENDERECO}`);
                this.linhas.push(`    mov ${ESCRATCH_A}, ${this.resolverOperando(instrucao.valor, alocacao)}`);
                this.linhas.push(`    pop ${ESCRATCH_ENDERECO}`);
                this.linhas.push(`    mov [${ESCRATCH_ENDERECO}], ${ESCRATCH_A}`);
                break;
            case 'chamada': {
                const registradores = registradoresAbi(this.alvo);
                if (instrucao.argumentos.length > registradores.length) {
                    throw new Error(
                        `Chamada a '${instrucao.rotulo}' com ${instrucao.argumentos.length} argumentos excede o ` +
                            `limite de ${registradores.length} suportado pelo tradutor para x64 (${this.alvo}).`
                    );
                }
                instrucao.argumentos.forEach((argumento, indice) => {
                    this.linhas.push(`    mov ${registradores[indice]}, ${this.resolverOperando(argumento, alocacao)}`);
                });
                this.linhas.push(`    call ${instrucao.rotulo}`);
                if (instrucao.dst) this.armazenar(instrucao.dst, alocacao, 'rax');
                break;
            }
            case 'imprimirNumero':
                this.linhas.push(`    mov rax, ${this.resolverOperando(instrucao.valor, alocacao)}`);
                if (this.alvo === 'linux') {
                    this.linhas.push('    call __delegua_print_int');
                } else {
                    this.linhas.push('    mov rdx, rax');
                    this.linhas.push('    lea rcx, [rel __fmt_int]');
                    this.linhas.push('    call printf');
                }
                break;
            case 'imprimirTexto':
                if (this.alvo === 'linux') {
                    this.linhas.push(`    mov edx, tam_${instrucao.rotulo}`);
                    this.linhas.push(`    mov ecx, ${instrucao.rotulo}`);
                    this.linhas.push('    mov ebx, 1');
                    this.linhas.push('    mov eax, 4');
                    this.linhas.push('    int 0x80');
                } else {
                    this.linhas.push(`    lea rcx, [rel ${instrucao.rotulo}]`);
                    this.linhas.push('    call printf');
                }
                break;
            case 'lerEntradaTexto':
                break;
        }
    }

    private gerarBinario(instrucao: Extract<IRInstrucao, { op: 'bin' }>, alocacao: Map<string, Alocacao>): void {
        this.linhas.push(`    mov ${ESCRATCH_A}, ${this.resolverOperando(instrucao.esquerda, alocacao)}`);
        this.linhas.push(`    mov ${ESCRATCH_B}, ${this.resolverOperando(instrucao.direita, alocacao)}`);

        switch (instrucao.operador) {
            case '+':
                this.linhas.push(`    add ${ESCRATCH_A}, ${ESCRATCH_B}`);
                break;
            case '-':
                this.linhas.push(`    sub ${ESCRATCH_A}, ${ESCRATCH_B}`);
                break;
            case '*':
                this.linhas.push(`    imul ${ESCRATCH_A}, ${ESCRATCH_B}`);
                break;
            case '/':
                this.linhas.push('    cqo');
                this.linhas.push(`    idiv ${ESCRATCH_B}`);
                break;
            case '%':
                this.linhas.push('    cqo');
                this.linhas.push(`    idiv ${ESCRATCH_B}`);
                this.linhas.push(`    mov ${ESCRATCH_A}, rdx`);
                break;
            case '<':
                this.linhas.push(`    cmp ${ESCRATCH_A}, ${ESCRATCH_B}`);
                this.linhas.push('    setl al');
                this.linhas.push(`    movzx ${ESCRATCH_A}, al`);
                break;
            case '>':
                this.linhas.push(`    cmp ${ESCRATCH_A}, ${ESCRATCH_B}`);
                this.linhas.push('    setg al');
                this.linhas.push(`    movzx ${ESCRATCH_A}, al`);
                break;
            case '<=':
                this.linhas.push(`    cmp ${ESCRATCH_A}, ${ESCRATCH_B}`);
                this.linhas.push('    setle al');
                this.linhas.push(`    movzx ${ESCRATCH_A}, al`);
                break;
            case '>=':
                this.linhas.push(`    cmp ${ESCRATCH_A}, ${ESCRATCH_B}`);
                this.linhas.push('    setge al');
                this.linhas.push(`    movzx ${ESCRATCH_A}, al`);
                break;
            case '==':
                this.linhas.push(`    cmp ${ESCRATCH_A}, ${ESCRATCH_B}`);
                this.linhas.push('    sete al');
                this.linhas.push(`    movzx ${ESCRATCH_A}, al`);
                break;
            case '!=':
                this.linhas.push(`    cmp ${ESCRATCH_A}, ${ESCRATCH_B}`);
                this.linhas.push('    setne al');
                this.linhas.push(`    movzx ${ESCRATCH_A}, al`);
                break;
        }

        this.armazenar(instrucao.dst, alocacao, ESCRATCH_A);
    }

    private gerarEnderecoIndice(
        nomeArranjo: string,
        indice: IRValor,
        alocacao: Map<string, Alocacao>,
        offsetsArranjosLocais: Map<string, number>
    ): void {
        const base = this.enderecoBaseArranjo(nomeArranjo, offsetsArranjosLocais);
        this.linhas.push(`    mov ${ESCRATCH_A}, ${this.resolverOperando(indice, alocacao)}`);
        this.linhas.push(`    mov ${ESCRATCH_B}, 8`);
        this.linhas.push(`    imul ${ESCRATCH_A}, ${ESCRATCH_B}`);
        this.linhas.push(`    lea ${ESCRATCH_ENDERECO}, [${base}]`);
        this.linhas.push(`    add ${ESCRATCH_ENDERECO}, ${ESCRATCH_A}`);
    }

    private gerarTerminador(bloco: IRBloco, funcao: IRFuncao, alocacao: Map<string, Alocacao>, ehPrincipal: boolean): void {
        switch (bloco.terminador.op) {
            case 'salto':
                this.linhas.push(`    jmp ${this.rotuloDoBloco(funcao, bloco.terminador.alvo)}`);
                break;
            case 'saltoCondicional': {
                const condicao = this.resolverOperando(bloco.terminador.condicao, alocacao);
                this.linhas.push(`    mov ${ESCRATCH_A}, ${condicao}`);
                this.linhas.push(`    cmp ${ESCRATCH_A}, 0`);
                this.linhas.push(`    jne ${this.rotuloDoBloco(funcao, bloco.terminador.verdadeiro)}`);
                this.linhas.push(`    jmp ${this.rotuloDoBloco(funcao, bloco.terminador.falso)}`);
                break;
            }
            case 'retorno':
                if (ehPrincipal) {
                    this.gerarSaidaDoPrograma();
                } else {
                    if (bloco.terminador.valor) {
                        this.linhas.push(`    mov rax, ${this.resolverOperando(bloco.terminador.valor, alocacao)}`);
                    }
                    this.paleta.forEach((registrador, indice) => {
                        this.linhas.push(`    mov ${registrador}, [rbp${textoOffset(-8 * (indice + 1))}]`);
                    });
                    this.linhas.push('    mov rsp, rbp');
                    this.linhas.push('    pop rbp');
                    this.linhas.push('    ret');
                }
                break;
        }
    }

    private gerarSaidaDoPrograma(): void {
        if (this.alvo === 'linux') {
            this.linhas.push('    mov eax, 1');
            this.linhas.push('    xor ebx, ebx');
            this.linhas.push('    int 0x80');
        } else {
            this.linhas.push('    xor eax, eax');
            this.linhas.push('    ret');
        }
    }

    /** Offsets (relativos a rbp) dos vetores locais, logo abaixo dos slots de spill (que começam em `deslocamentoBase`). */
    private calcularOffsetsArranjosLocais(funcao: IRFuncao, spillBytes: number): { offsets: Map<string, number>; bytes: number } {
        const offsets = new Map<string, number>();
        let offsetAtual = this.deslocamentoBase - spillBytes;
        for (const [nome, info] of funcao.arranjosLocais) {
            offsetAtual -= 8 * info.tamanho;
            offsets.set(nome, offsetAtual);
        }
        return { offsets, bytes: -offsetAtual };
    }

    private gerarFuncaoPrincipal(processada: FuncaoProcessada): void {
        this.deslocamentoBase = 0;
        const spillBytes = this.tamanhoSpillBytes(processada);
        const { offsets, bytes } = this.calcularOffsetsArranjosLocais(processada.funcao, spillBytes);
        const quadro = arredondarPara16(bytes);

        this.linhas.push(`${this.alvo === 'linux' ? '_start' : 'main'}:`);
        this.linhas.push('    mov rbp, rsp');
        if (quadro > 0) this.linhas.push(`    sub rsp, ${quadro}`);
        this.gerarBlocosSemRotuloEntrada(processada, offsets, true);
    }

    private gerarFuncao(processada: FuncaoProcessada): void {
        this.deslocamentoBase = -8 * this.paleta.length;
        const spillBytes = this.tamanhoSpillBytes(processada);
        const { offsets, bytes } = this.calcularOffsetsArranjosLocais(processada.funcao, spillBytes);
        const quadro = arredondarPara16(bytes);

        this.linhas.push(`${processada.funcao.nome}:`);
        this.linhas.push('    push rbp');
        this.linhas.push('    mov rbp, rsp');
        if (quadro > 0) this.linhas.push(`    sub rsp, ${quadro}`);
        this.paleta.forEach((registrador, indice) => {
            this.linhas.push(`    mov [rbp${textoOffset(-8 * (indice + 1))}], ${registrador}`);
        });

        this.gerarBlocosSemRotuloEntrada(processada, offsets, false);
    }

    private tamanhoSpillBytes(processada: FuncaoProcessada): number {
        let maiorOffset = 0;
        for (const alocacao of processada.alocacao.values()) {
            if (alocacao.tipo === 'pilha' && -alocacao.offsetBytes > maiorOffset) {
                maiorOffset = -alocacao.offsetBytes;
            }
        }
        return maiorOffset;
    }

    private gerarBlocosSemRotuloEntrada(
        processada: FuncaoProcessada,
        offsetsArranjosLocais: Map<string, number>,
        ehPrincipal: boolean
    ): void {
        const { funcao, alocacao } = processada;
        const ordem = ordemPosFixaReversa(funcao);
        ordem.forEach((blocoId, indice) => {
            const bloco = funcao.blocos.get(blocoId)!;
            if (indice > 0) this.linhas.push(`${this.rotuloDoBloco(funcao, blocoId)}:`);
            for (const instrucao of bloco.instrucoes) {
                this.gerarInstrucao(instrucao, alocacao, offsetsArranjosLocais);
            }
            this.gerarTerminador(bloco, funcao, alocacao, ehPrincipal);
        });
    }

    private gerarHelperImprimirNumero(): void {
        if (this.alvo !== 'linux') return;
        this.linhas.push('__delegua_print_int:');
        this.linhas.push('    push rbx');
        this.linhas.push('    push rcx');
        this.linhas.push('    push rdx');
        this.linhas.push('    push rsi');
        this.linhas.push('    mov rcx, 10');
        this.linhas.push('    lea rsi, [__print_buf + 22]');
        this.linhas.push('    mov byte [rsi], 10');
        this.linhas.push('.print_digitloop:');
        this.linhas.push('    xor rdx, rdx');
        this.linhas.push('    div rcx');
        this.linhas.push("    add dl, '0'");
        this.linhas.push('    dec rsi');
        this.linhas.push('    mov [rsi], dl');
        this.linhas.push('    test rax, rax');
        this.linhas.push('    jnz .print_digitloop');
        this.linhas.push('    lea rdx, [__print_buf + 23]');
        this.linhas.push('    sub rdx, rsi');
        this.linhas.push('    mov ecx, esi');
        this.linhas.push('    mov ebx, 1');
        this.linhas.push('    mov eax, 4');
        this.linhas.push('    int 0x80');
        this.linhas.push('    pop rsi');
        this.linhas.push('    pop rdx');
        this.linhas.push('    pop rcx');
        this.linhas.push('    pop rbx');
        this.linhas.push('    ret');
    }
}

function arredondarPara16(bytes: number): number {
    if (bytes <= 0) return 0;
    return Math.ceil(bytes / 16) * 16;
}
