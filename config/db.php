<?php
$servername = "localhost";
$username = "root";
$password = "1234";
$dbname = "lab_faculdade";
$port = 3307;

// Criar conexão
$conn = new mysqli($servername, $username, $password, $dbname, $port);

// Verificar conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

/* BANCO DE DADOS USADO NOS TESTES

CREATE DATABASE IF NOT EXISTS lab_faculdade;
USE lab_faculdade;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    isAdmin BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB;

CREATE TABLE pacientes (
    idPaciente INT AUTO_INCREMENT PRIMARY KEY,
    dataCadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nome VARCHAR(100) NOT NULL,
    dataNascimento DATE NOT NULL,
    idade INT NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    nomeMae VARCHAR(100),
    medicamento VARCHAR(100),
    patologia VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE exames (
    idExame INT AUTO_INCREMENT PRIMARY KEY,
    idPaciente INT,
    laboratorio VARCHAR(100) NOT NULL,
    exameTexto TEXT NOT NULL,
    dataExame TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resultado TEXT,
    informacoesAdicionais TEXT,
    FOREIGN KEY (idPaciente) REFERENCES pacientes(idPaciente) ON DELETE CASCADE
) ENGINE=InnoDB;

*/

