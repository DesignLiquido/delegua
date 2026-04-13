import tiposDeSimbolos from '../../../tipos-de-simbolos/portugol-ipt';

export const palavrasReservadas = {
    // Estrutura do programa
    inicio: tiposDeSimbolos.INICIO,
    fim: tiposDeSimbolos.FIM,

    // Entrada / saída
    ler: tiposDeSimbolos.LER,
    escrever: tiposDeSimbolos.ESCREVER,

    // Condicional
    se: tiposDeSimbolos.SE,
    entao: tiposDeSimbolos.ENTAO,
    então: tiposDeSimbolos.ENTAO,
    senao: tiposDeSimbolos.SENAO,
    senão: tiposDeSimbolos.SENAO,
    fimse: tiposDeSimbolos.FIMSE,

    // Laço enquanto
    enquanto: tiposDeSimbolos.ENQUANTO,
    faz: tiposDeSimbolos.FAZ,
    fimenquanto: tiposDeSimbolos.FIMENQUANTO,

    // Laço para
    para: tiposDeSimbolos.PARA,
    de: tiposDeSimbolos.DE,
    ate: tiposDeSimbolos.ATE,
    até: tiposDeSimbolos.ATE,
    passo: tiposDeSimbolos.PASSO,
    proximo: tiposDeSimbolos.PROXIMO,
    próximo: tiposDeSimbolos.PROXIMO,

    // Laço repete
    repete: tiposDeSimbolos.REPETE,

    // Escolha
    escolhe: tiposDeSimbolos.ESCOLHE,
    caso: tiposDeSimbolos.CASO,
    defeito: tiposDeSimbolos.DEFEITO,
    fimescolhe: tiposDeSimbolos.FIMESCOLHE,

    // Tipos de variáveis
    inteiro: tiposDeSimbolos.INTEIRO,
    real: tiposDeSimbolos.REAL,
    logico: tiposDeSimbolos.LOGICO,
    lógico: tiposDeSimbolos.LOGICO,
    caracter: tiposDeSimbolos.CARACTER,

    // Modificadores de declaração
    constante: tiposDeSimbolos.CONSTANTE,
    variavel: tiposDeSimbolos.VARIAVEL,
    variável: tiposDeSimbolos.VARIAVEL,

    // Operadores lógicos como palavras
    e: tiposDeSimbolos.E,
    ou: tiposDeSimbolos.OU,
    xou: tiposDeSimbolos.XOU,
    nao: tiposDeSimbolos.NAO,
    não: tiposDeSimbolos.NAO,
};
