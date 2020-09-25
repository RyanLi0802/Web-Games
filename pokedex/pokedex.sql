-- Create the pokedex database
CREATE DATABASE IF NOT EXISTS pokedex;
USE pokedex;

CREATE TABLE IF NOT EXISTS Users (
    pid INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY(pid),
    UNIQUE(username)
);

CREATE TABLE IF NOT EXISTS Pokemons (
    id INT NOT NULL AUTO_INCREMENT,
    pid INT(11) NOT NULL,
    pokemon_name VARCHAR(255) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (pid) REFERENCES Users(pid)
);

CREATE TABLE IF NOT EXISTS Trades (
    tid INT NOT NULL AUTO_INCREMENT,
    from_pid INT(11) NOT NULL,
    from_username VARCHAR(255) NOT NULL,
    to_pid INT(11) NOT NULL,
    to_username VARCHAR(255) NOT NULL,
    offer VARCHAR(255) NOT NULL,
    request VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'pending',
    PRIMARY KEY(tid),
    FOREIGN KEY (from_pid) REFERENCES Users(pid),
    FOREIGN KEY (to_pid) REFERENCES Users(pid)
);