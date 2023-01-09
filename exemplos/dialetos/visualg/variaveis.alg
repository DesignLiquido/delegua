Algoritmo "exemplo-variaveis"
var a: inteiro
    Valor1, Valor2: real
    vet: vetor [1..10] de real
    matriz: vetor [0..4,8..10] de inteiro
    nome_do_aluno: caractere
    sinalizador: logico
Inicio
    a <- 3
    Valor1 <- 1.5
    Valor2 <- Valor1 + a
    vet[1] <- vet[1] + (a * 3)
    matriz[3,9] <- Int(a/4) - 5
    nome_do_aluno <- "José da Silva"
    sinalizador <- FALSO
Fimalgoritmo