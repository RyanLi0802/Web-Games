<?php
  ## login.php
  ## processes log in data from a client

  include 'common.php';

  if (!isset($_POST["username"]) || !isset($_POST["password"])) {
    error_message("Missing at least one of your parameters!");
  }
  
  $username_input = $_POST["username"];
  $password_input = $_POST["password"];

  try {
    $rows = $db->query("SELECT COUNT(*) FROM Users WHERE username = \"{$username_input}\";");
  }
  catch (PDOException $ex) {
    db_error_message("Can not query the database.", $ex);
  }

  foreach ($rows as $row) {
      $user_check = $row["COUNT(*)"];
  }

  header("Content-Type: application/json");
  if ($user_check == 0) {
      $result = Array(
        "status" => "denied",
        "message" => "username $username_input does not exist, " .
                     "please try again"
      );
  } else {
      $rows = $db->query("SELECT * FROM Users WHERE username = \"{$username_input}\";");
      foreach ($rows as $row) {
          $pid = $row["pid"];
          $password = $row["password"]; 
      }

      if ($password != $password_input) {
          $result = Array(
              "status" => "denied",
              "message" => "wrong password, please try again"
          );
      } else {
        $result = Array(
            "status" => "success",
            "pid" => $pid,
            "username" => $username_input
        );
      }
  }
  echo(json_encode($result));
?>