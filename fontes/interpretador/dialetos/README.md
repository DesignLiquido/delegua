# Interpretadores de Dialetos

Neste diretório temos os interpretadores de cada dialeto suportado por Delégua. Cada diretório possui também sua documentação correspondente. 

## Arquitetura dos Interpretadores de Dialetos

Normalmente cada diretório possui uma implementação de um interpretador tradicional e outra de um interpretador com suporte a depuração. Algumas partes da implementação desses interpretadores são comuns, o que nos faz ter em cada diretório um arquivo `comum.ts`, que contém esses métodos comuns entre os interpretadores, visto que a classe de cada interpretador tem uma herança diferente. 