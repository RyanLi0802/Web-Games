<?php
  ## insert.php
  ## inserts a new pokemon to a player's pokedex

  include 'common.php';

  if (!isset($_POST["name"]) || !isset($_POST["pid"])) {
    error_message("Missing at least one of your parameters!");
  }

  $name = $_POST["name"];
  $pid = $_POST["pid"];
  
  try {
    $rows = $db->query("SELECT COUNT(*) FROM Pokemons " . 
                       "WHERE pokemon_name = '$name' AND pid = '$pid';");
  }
  catch (PDOException $ex) {
    db_error_message("Can not query the database.", $ex);
  }

  foreach ($rows as $row) {
      $duplicate = $row["COUNT(*)"];
  }

  header("Content-type: application/json");
  
  if ($duplicate != 0) {
    $result = array(
      "status" => "denied",
      "message" => "This Pokemon already exists in your Pokedex!"
      );
  } else {
    $sql = "INSERT INTO Pokemons (pid, pokemon_name) " .
            "VALUES (:pid, :pokemon_name );";
    $stmt = $db->prepare($sql);
    $params = array(
    "pid" => $pid,
    "pokemon_name" => $name
    );
    $stmt->execute($params);

    $result = array(
    "status" => "success",
    "message" => "A New Pokemon registered to your Pokedex!"
    );
  }

  echo json_encode($result);
?>