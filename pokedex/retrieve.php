<?php

// $filepath = "debug/retrieve.txt";
// $date = "[" . date("Y-m-d H:i:s") . "]";
// file_put_contents($filepath, $date . " new request received: ", FILE_APPEND);

  ## retrieve.php
  ## retrieves all found pokemons of a given player
  include 'common.php';

  if (!isset($_GET["pid"])) {
    error_message("Missing at least one of your parameters!");
  }

  $pid = $_GET["pid"];

  // file_put_contents($filepath, "pid = " . $pid . "\n", FILE_APPEND);

  try {
    $rows = $db->query("SELECT COUNT(*) FROM Pokemons WHERE pid = \"{$pid}\";");
  }
  catch (PDOException $ex) {
    db_error_message("Can not query the database.", $ex);
  }

  foreach($rows as $row) {
      $num_of_pokemons = $row["COUNT(*)"];
  }

  ## if the player currently has no pokemons (he just started playing!),
  ## returns the starter pokemons
  if ($num_of_pokemons == 0) {
    $stmt1 = "INSERT INTO Pokemons (pid, pokemon_name) " .
            "VALUES ('$pid', 'bulbasaur');";
    $stmt2 = "INSERT INTO Pokemons (pid, pokemon_name) " .
            "VALUES ('$pid', 'squirtle');";
    $stmt3 = "INSERT INTO Pokemons (pid, pokemon_name) " .
            "VALUES ('$pid', 'charmander');";
    $db->exec($stmt1);
    $db->exec($stmt2);
    $db->exec($stmt3);

    $output = Array(
        "pokemons" => Array("bulbasaur", "squirtle", "charmander")
    );
    header("Content-Type: application/json");
    echo json_encode($output);
  } else {
      try {
      $rows = $db->query("SELECT pokemon_name FROM Pokemons WHERE pid = \"{$pid}\";");
      }
      catch (PDOException $ex) {
        db_error_message("Can not query the database.", $ex);
      }

      $pokemons = Array();
      foreach($rows as $row) {
        array_push($pokemons, $row["pokemon_name"]);
      }
      
      header("Content-Type: application/json");
      $output = Array(
        "pokemons" => $pokemons
      );
      echo json_encode($output);
  }
?>