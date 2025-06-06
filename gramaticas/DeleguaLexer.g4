/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2023-2025 Design Líquido por Leonel Sanches da Silva
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

// Insira aqui um @header para o avaliador léxico em C++.

HashBangLinha:                      { this.IsStartOfFile()}? '#!' ~[\r\n\u2028\u2029]*; // permitido apenas no início
MultiLinhaComentario:               '/*' .*? '*/'             -> channel(HIDDEN);
SingleLinhaComentario:              '//' ~[\r\n\u2028\u2029]* -> channel(HIDDEN);
ExpressaoRegularLiteral:           '/' ExpressaoRegularPrimeiroChar ExpressaoRegularChar* {this.IsRegexPossible()}? '/' IdentificadorPart*;

AbreColchete:                      '[';
FechaColchete:                     ']';
AbreParentese:                     '(';
FechaParentese:                    ')';
AbreChave:                         '{' {this.ProcessoAbreChave();};
TemplateFechaChave:                {this.EstaEmTemplateTexto()}? '}' -> popMode;
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
Not:                               '!';
Multiplicacao:                     '*';
Divisao:                           '/';
Modulo:                            '%';
Potencia:                          '**';
NuloCoalesce:                      '??';
Hashtag:                           '#';
DireitaShiftAritmetico:            '>>';
EsquerdaShiftAritmetico:           '<<';
DireitaShiftLogical:               '>>>';
MenosQue:                          '<';
MaiorQue:                          '>';
MenosQueIgual:                     '<=';
MaiorQueIgual:                     '>=';
Igual_:                            '==';
NaoIgual:                          '!=';
IdentityIgual:                     '===';
IdentityNotIgual:                  '!==';
BitAnd:                            '&';
BitXOr:                            '^';
BitOr:                             '|';
And:                               '&&';
Or:                                '||';
MultiplicacaoAtribuicao:           '*=';
DivisaoAtribuicao:                 '/=';
ModuloAtribuicao:                  '%=';
MaisAtribuicao:                    '+=';
MenosAtribuicao:                   '-=';
EsquerdaShiftAritmeticoAtribuicao: '<<=';
DireitaShiftAritmeticoAtribuicao:  '>>=';
DireitaShiftLogicalAtribuicao:     '>>>=';
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

/// Numeric Literals

DecimalLiteral:                 DecimalInteiroLiteral '.' [0-9] [0-9_]* ParteDoExpoente?
              |                 '.' [0-9] [0-9_]* ParteDoExpoente?
              |                 DecimalInteiroLiteral ParteDoExpoente?
              ;

/// Numeric Literals

HexInteiroLiteral:              '0' [xX] [0-9a-fA-F] HexDigit*;
OctalInteiroLiteral:            '0' [0-7]+ {!this.IsStrictMode()}?;
OctalInteiroLiteral2:           '0' [oO] [0-7] [_0-7]*;
BinaryInteiroLiteral:           '0' [bB] [01] [_01]*;

BigHexInteiroLiteral:           '0' [xX] [0-9a-fA-F] HexDigit* 'n';
BigOctalInteiroLiteral:         '0' [oO] [0-7] [_0-7]* 'n';
BigBinaryInteiroLiteral:        '0' [bB] [01] [_01]* 'n';
BigDecimalInteiroLiteral:       DecimalInteiroLiteral 'n';

/// Keywords

Sustar:                          'sustar';
Do:                              'faca' | 'faça';
InstanciaDe:                     'instanceof';
TipoDe:                          'typeof';
Caso:                            'caso';
Senao:                           'senao' | 'senão';
Novo:                            'novo';
Var:                             'var';
Pegue:                           'pegue';
Finalmente:                      'finalmente';
Retorna:                         'retorna' | 'retorne';
Vazio:                           'vazio';
Continue:                        'continue';
Para:                            'para';
Escolha:                         'escolha';
Enquanto:                        'enquanto';
Debugger:                        'debugger';
Funcao_:                         'funcao' | 'função';
Isto:                            'isto';
Com:                             'com';
Padrao:                          'padrao' | 'padrão';
Se:                              'se';
Falhar:                          'falhar';
Excluir:                         'excluir';
Em:                              'em';
Tente:                           'tente';
Como:                            'como';
De:                              'de';

/// Future Reserved Words

Classe:                         'classe';
Enum:                           'enum';
Extende:                        'estende';
Super:                          'super';
Const:                          'const';
Exportar:                       'exportar';
Importar:                       'importar';

/// The following tokens are also considered to be FutureReservedWords
/// when parsing strict mode

Implementa:                     'implements' {this.IsStrictMode()}?;
StrictLet:                      'let' {this.IsStrictMode()}?;
NonStrictLet:                   'let' {!this.IsStrictMode()}?;
Privado:                        'private' {this.IsStrictMode()}?;
Publico:                        'public' {this.IsStrictMode()}?;
Interface:                      'interface' {this.IsStrictMode()}?;
Pacote:                         'package' {this.IsStrictMode()}?;
Protegido:                      'protected' {this.IsStrictMode()}?;
Estatico:                       'static' {this.IsStrictMode()}?;

/// Identificador Nomes and Identificadors

Identificador:                     IdentificadorStart IdentificadorPart*;
/// String Literals
LiteralTexto:                 ('"' DoubleStringCharacter* '"'
             |                  '\'' SingleStringCharacter* '\'') {this.ProcessoLiteralTexto();}
             ;

BackTick:                       '`' {this.IncrementarProfundidadeTemplate();} -> pushMode(TEMPLATE);

WhiteSpaces:                    [\t\u000B\u000C\u0020\u00A0]+ -> channel(HIDDEN);

LinhaTerminador:                 [\r\n\u2028\u2029] -> channel(HIDDEN);

/// Comentarios


HtmlComentario:                 '<!--' .*? '-->' -> channel(HIDDEN);
CDataComentario:                '<![CDATA[' .*? ']]>' -> channel(HIDDEN);
UnexpectedCharacter:            . -> channel(ERROR);

mode TEMPLATE;

TemBackTick:                 '`' {this.DecreaseTemplateDepth();} -> type(BackTick), popMode;
TemplateStringStartExpressao:  '${' -> pushMode(DEFAULT_MODE);
TemplateStringAtom:             ~[`];

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

fragment ExpressaoRegularPrimeiroChar
    : ~[*\r\n\u2028\u2029\\/[]
    | ExpressaoRegularBackslashSequencia
    | '[' ExpressaoRegularClasseChar* ']'
    ;

fragment ExpressaoRegularChar
    : ~[\r\n\u2028\u2029\\/[]
    | ExpressaoRegularBackslashSequencia
    | '[' ExpressaoRegularClasseChar* ']'
    ;

fragment ExpressaoRegularClasseChar
    : ~[\r\n\u2028\u2029\]\\]
    | ExpressaoRegularBackslashSequencia
    ;

fragment ExpressaoRegularBackslashSequencia
    : '\\' ~[\r\n\u2028\u2029]
    ;
