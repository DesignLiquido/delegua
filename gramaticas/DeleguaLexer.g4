/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2023-hoje Design Líquido por Leonel Sanches da Silva
 *
 * Permissão concedida, gratuitamente, a qualquer pessoa que obtenha uma cópia
 * deste software e arquivos de documentação associados (o "Software"), para lidar
 * com o Software sem restrições, incluindo, sem limitação, os direitos de
 * usar, copiar, modificar, fundir, publicar, distribuir, sublicenciar e/ou vender
 * cópias do Software e para permitir que as pessoas a quem o Software é
 * munidos para o efeito, nas seguintes condições:
 * 
 * O aviso de direitos autorais acima e este aviso de permissão devem ser incluídos em todos os
 * cópias ou partes substanciais do Software.
 * 
 * O SOFTWARE É FORNECIDO "COMO ESTÁ", SEM GARANTIA DE QUALQUER TIPO, EXPRESSA OU
 * IMPLÍCITAS, INCLUINDO, SEM LIMITAÇÃO, AS GARANTIAS DE COMERCIALIZAÇÃO,
 * ADEQUAÇÃO PARA UM FIM ESPECÍFICO E NÃO VIOLAÇÃO. EM NENHUM CASO O
 * OS AUTORES OU DETENTORES DOS DIREITOS AUTORAIS SERÃO RESPONSÁVEIS POR QUALQUER REIVINDICAÇÃO, DANOS OU OUTROS
 * RESPONSABILIDADE, SEJA EM UMA AÇÃO DE CONTRATO, ILÍCITO OU DE OUTRA FORMA, DECORRENTE DE,
 * FORA DE OU EM CONEXÃO COM O SOFTWARE OU O USO OU OUTROS NEGÓCIOS NO
 * PROGRAMAS.
 * ---
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
lexer grammar DeleguaLexer;

channels { ERROR }

options { superClass=DeleguaLexerBase; }


MultiLinhaComentario:               '/*' .*? '*/'             -> channel(HIDDEN);
SingleLinhaComentario:              '//' ~[\r\n\u2028\u2029]* -> channel(HIDDEN);

AbreColchete:                      '[';
FechaColchete:                     ']';
AbreParentese:                     '(';
FechaParentese:                    ')';
AbreChave:                         '{' {this.ProcessoAbreChave();};
FechaChave:                        '}' {this.ProcessoFechaChave();};
PontoEVirgula:                     ';';
Virgula:                           ',';
Atribuicao:                        '=';
Interrogacao:                      '?';
InterrogacaoPonto:                 '?.';
DoisPontos:                        ':';
TresPontos:                        '...';
Ponto:                             '.';
MaisMais:                          '++';
MenosMenos:                        '--';
Mais:                              '+';
Menos:                             '-';
BitNot:                            '~';
Not:                               '!' | 'nao' | 'não';
Multiplicacao:                     '*';
Divisao:                           '/';
DivisaoInteira:                    '\\';
Modulo:                            '%';
Potencia:                          '**';
Elvis:                             '?:';
DireitaShiftAritmetico:            '>>';
EsquerdaShiftAritmetico:           '<<';
MenosQue:                          '<';
MaiorQue:                          '>';
MenosQueIgual:                     '<=';
MaiorQueIgual:                     '>=';
Igual_:                            '==';
NaoIgual:                          '!=';
BitAnd:                            '&';
BitXOr:                            '^';
BitOr:                             '|';
And:                               'e';
Or:                                'ou';
MultiplicacaoAtribuicao:           '*=';
DivisaoAtribuicao:                 '/=';
DivisaoInteiraAtribuicao:          '\\=';
ModuloAtribuicao:                  '%=';
MaisAtribuicao:                    '+=';
MenosAtribuicao:                   '-=';
BitAndAtribuicao:                  '&=';
BitXorAtribuicao:                  '^=';
BitOrAtribuicao:                   '|=';
PotenciaAtribuicao:                '**=';
ARROW:                             '=>';

/// Nulo Literals

LiteralNulo:                       'nulo';

/// Logico Literals

LiteralLogico:                     'verdadeiro'
             |                     'falso';

/// Literais Numéricos

DecimalLiteral:                 DecimalInteiroLiteral '.' [0-9] [0-9_]* ParteDoExpoente?
              |                 '.' [0-9] [0-9_]* ParteDoExpoente?
              |                 DecimalInteiroLiteral ParteDoExpoente?
              ;

HexInteiroLiteral:              '0' [xX] [0-9a-fA-F] HexDigit*;
OctalInteiroLiteral2:           '0' [oO] [0-7] [_0-7]*;
BinaryInteiroLiteral:           '0' [bB] [01] [_01]*;

/// Palavras-chave

Sustar:                          'sustar' | 'quebrar' | 'quebre';
Do:                              'faca' | 'faça' | 'fazer';
Caso:                            'caso';
Senao:                           'senao' | 'senão';
Var:                             'var' | 'variavel' | 'variável';
Pegue:                           'pegue' | 'pegar';
Cada:                            'cada';
Contem:                          'contem' | 'contém';
Finalmente:                      'finalmente';
Retorna:                         'retorna' | 'retorne' | 'retornar';
Vazio:                           'vazio';
Continue:                        'continue' | 'continua' | 'continuar';
Para:                            'para';
Escolha:                         'escolha' | 'escolher';
Estatico:                       'estatico' | 'estatica' | 'estático' | 'estática';
Enquanto:                        'enquanto';
Funcao_:                         'funcao' | 'função';
Implementa:                     'implementa' | ('implements' {this.IsStrictMode()}?);
Isto:                            'isto';
Com:                             'com';
Padrao:                          'padrao' | 'padrão';
Se:                              'se';
Falhar:                          'falhar';
Excluir:                         'excluir';
Em:                              'em';
Tente:                           'tente' | 'tentar';
Como:                            'como';
De:                              'de';
Tendo:                           'tendo';
Classe:                         'classe';
Herda:                          'herda';
Super:                          'super';
Const:                          'const' | 'constante' | 'fixo';
Exportar:                       'exportar';
Importar:                       'importar' | 'importe';
Leia:                           'leia' | 'ler';
Escreva:                        'escreva' | 'escrever';
Extensao:                       'extensao' | 'extensão';
Abstrato:                       'abstrato' | 'abstrata';

/// Novas palavras-chave

Ajuda:                          'ajuda';
Assercao:                       'assercao' | 'asserção';
Construtor:                     'construtor';
Estrangeira:                    'estrangeira';
Mescla:                         'mescla';
Operador:                       'operador';
Tipo:                           'tipo';
Tudo:                           'tudo';

/// Talvez uso futuro

Acumular:                       'acumular';
Aguardar:                       'aguardar' | 'aguarde';
Assincrono:                     'assincrono' | 'assíncrono';
Enum:                           'enum';
Novo:                           'novo';
// StrictLet:                      'let' {this.IsStrictMode()}?;
// NonStrictLet:                   'let' {!this.IsStrictMode()}?;
Privado:                        'privado';
Publico:                        'publico' | 'público';
Interface:                      'interface';
// Pacote:                         'package';
Protegido:                      'protegido';

/// Delimitadores e símbolos especiais

Arroba:                         '@';

/// Identificador Nomes and Identificadors

Identificador:                     IdentificadorStart IdentificadorPart*;
/// String Literals
LiteralTexto:                 ('"' DoubleStringCharacter* '"'
             |                  '\'' SingleStringCharacter* '\'') {this.ProcessoLiteralTexto();}
             ;


WhiteSpaces:                    [\t\u000B\u000C\u0020\u00A0]+ -> channel(HIDDEN);

LinhaTerminador:                 [\r\n\u2028\u2029] -> channel(HIDDEN);

/// Comentários

UnexpectedCharacter:            . -> channel(ERROR);


// Fragment rules

fragment DoubleStringCharacter
    : ~["\\\r\n]
    | '\\' EscapeSequencia
    | ContinuacaoLinha
    ;

fragment SingleStringCharacter
    : ~['\\\r\n]
    | '\\' EscapeSequencia
    | ContinuacaoLinha
    ;

fragment EscapeSequencia
    : CharacterEscapeSequencia
    | '0' // no digit ahead! TODO
    | HexEscapeSequencia
    | UnicodeEscapeSequencia
    | ExtendedUnicodeEscapeSequencia
    ;

fragment CharacterEscapeSequencia
    : SingleEscapeCharacter
    | NonEscapeCharacter
    ;

fragment HexEscapeSequencia
    : 'x' HexDigit HexDigit
    ;

fragment UnicodeEscapeSequencia
    : 'u' HexDigit HexDigit HexDigit HexDigit
    | 'u' '{' HexDigit HexDigit+ '}'
    ;

fragment ExtendedUnicodeEscapeSequencia
    : 'u' '{' HexDigit+ '}'
    ;

fragment SingleEscapeCharacter
    : ['"\\bfnrtv]
    ;

fragment NonEscapeCharacter
    : ~['"\\bfnrtv0-9xu\r\n]
    ;

fragment EscapeCharacter
    : SingleEscapeCharacter
    | [0-9]
    | [xu]
    ;

fragment ContinuacaoLinha
    : '\\' [\r\n\u2028\u2029]
    ;

fragment HexDigit
    : [_0-9a-fA-F]
    ;

fragment DecimalInteiroLiteral
    : '0'
    | [1-9] [0-9_]*
    ;

fragment ParteDoExpoente
    : [eE] [+-]? [0-9_]+
    ;

fragment IdentificadorPart
    : IdentificadorStart
    | [\p{Mn}]
    | [\p{Nd}]
    | [\p{Pc}]
    | '\u200C'
    | '\u200D'
    ;

fragment IdentificadorStart
    : [\p{L}]
    | [$_]
    | '\\' UnicodeEscapeSequencia
    ;




