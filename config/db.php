<?php
$servername = "localhost";
$username = "root";
$password = "";
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
    nivel ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);

CREATE TABLE pacientes (
    idPaciente INT AUTO_INCREMENT PRIMARY KEY,
    isAdmin BOOLEAN DEFAULT FALSE,
    dataCadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nome VARCHAR(100) NOT NULL,
    dataNascimento DATE NOT NULL,
    idade INT NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    nomeMae VARCHAR(100),
    Medicamento VARCHAR(100),
    Patologia VARCHAR(100)
);

CREATE TABLE exames (
    idExame INT AUTO_INCREMENT PRIMARY KEY,
    idPaciente INT,
    laboratorio VARCHAR(100) NOT NULL,
    exameTexto TEXT NOT NULL,
    dataExame TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resultado TEXT,
    informacoesAdicionais TEXT,
    FOREIGN KEY (idPaciente) REFERENCES pacientes(idPaciente) ON DELETE CASCADE
);

*/

