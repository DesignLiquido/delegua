# Depuração

O mecanismo de depuração em Delégua é implementado a nível de interpretador: existe o interpretador tradicional e o interpretador com depuração. Ambos vivem em `fontes/interpretador`.

Há duas formas de usar a depuração em Delégua: local e remota. [A extensão do VSCode implementa a depuração local](https://github.com/DesignLiquido/vscode), que é basicamente incluir o núcleo da linguagem como pacote NPM e amarrar os componentes de Delégua nas rotinas da extensão. A depuração remota era usada pela extensão mas deixou de ser usada na versão 0.2.0 da extensão.