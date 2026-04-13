export default {
    // Operadores aritméticos
    ADICAO: 'ADICAO',
    SUBTRACAO: 'SUBTRACAO',
    MULTIPLICACAO: 'MULTIPLICACAO',
    DIVISAO: 'DIVISAO',
    DIVISAO_INTEIRA: 'DIVISAO_INTEIRA',
    MODULO: 'MODULO',
    EXPONENCIACAO: 'EXPONENCIACAO',

    // Operadores relacionais
    IGUAL: 'IGUAL',
    DIFERENTE: 'DIFERENTE',
    MAIOR: 'MAIOR',
    MAIOR_IGUAL: 'MAIOR_IGUAL',
    MENOR: 'MENOR',
    MENOR_IGUAL: 'MENOR_IGUAL',

    // Operadores lógicos
    E: 'E',
    OU: 'OU',
    XOU: 'XOU',
    NAO: 'NAO',
    NEGACAO: 'NEGACAO',

    // Atribuição
    SETA_ATRIBUICAO: 'SETA_ATRIBUICAO',

    // Pontuação
    PARENTESE_ESQUERDO: 'PARENTESE_ESQUERDO',
    PARENTESE_DIREITO: 'PARENTESE_DIREITO',
    COLCHETE_ESQUERDO: 'COLCHETE_ESQUERDO',
    COLCHETE_DIREITO: 'COLCHETE_DIREITO',
    VIRGULA: 'VIRGULA',
    DOIS_PONTOS: 'DOIS_PONTOS',
    QUEBRA_LINHA: 'QUEBRA_LINHA',

    // Literais
    NUMERO: 'NUMERO',
    TEXTO: 'TEXTO',
    IDENTIFICADOR: 'IDENTIFICADOR',

    // Estrutura do programa
    INICIO: 'INICIO',
    FIM: 'FIM',

    // Entrada / saída
    LER: 'LER',
    ESCREVER: 'ESCREVER',

    // Condicional
    SE: 'SE',
    ENTAO: 'ENTAO',
    SENAO: 'SENAO',
    FIMSE: 'FIMSE',

    // Laço enquanto
    ENQUANTO: 'ENQUANTO',
    FAZ: 'FAZ',
    FIMENQUANTO: 'FIMENQUANTO',
    // Token especial: 'enquanto' sem 'faz' no final da linha = fechamento do faz...enquanto
    FAZENQUANTO: 'FAZENQUANTO',

    // Laço para
    PARA: 'PARA',
    DE: 'DE',
    ATE: 'ATE',
    PASSO: 'PASSO',
    PROXIMO: 'PROXIMO',

    // Laço repete
    REPETE: 'REPETE',

    // Escolha
    ESCOLHE: 'ESCOLHE',
    CASO: 'CASO',
    DEFEITO: 'DEFEITO',
    FIMESCOLHE: 'FIMESCOLHE',

    // Tipos de variáveis
    INTEIRO: 'INTEIRO',
    REAL: 'REAL',
    LOGICO: 'LOGICO',
    CARACTER: 'CARACTER',

    // Modificadores de declaração
    CONSTANTE: 'CONSTANTE',
    VARIAVEL: 'VARIAVEL',
};
