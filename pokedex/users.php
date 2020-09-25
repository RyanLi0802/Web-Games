<?php
  ## insert.php
  ## inserts a new pokemon to a player's pokedex

  // $filepath = "debug/users.txt";
  // $date = "[" . date("Y-m-d H:i:s") . "]";
  // file_put_contents($filepath, $date . " new request received: \n", FILE_APPEND);

  include 'common.php';

  

  if (!isset($_GET["myPid"])) {
    error_message("Missing at least one of your parameters!");
  }

  $myPid = $_GET["myPid"];
  // file_put_contents($filepath, "params: myPid = " . $myPid . "\n", FILE_APPEND);

  // file_put_contents($filepath, "begin database query at line 20... \n", FILE_APPEND);
  try {
    $rows = $db->query("SELECT * FROM Users WHERE pid <> '$myPid';");
  }
  catch (PDOException $ex) {
    db_error_message("Can not query the database.", $ex);
  }
  // file_put_contents($filepath, "completed database query at line 20 \n", FILE_APPEND);

  $usernames = array();
  $pids = array();
  foreach ($rows as $row) {
    array_push($usernames, $row["username"]);
    array_push($pids, $row["pid"]);
  }

  // file_put_contents($filepath, "sending output... \n", FILE_APPEND);


  header("Content-type: application/json");
  $result = array(
      "usernames" => $usernames,
      "pids" => $pids
  );

  // file_put_contents($filepath, "output data: ", FILE_APPEND);
  // file_put_contents($filepath, print_r($result, true), FILE_APPEND);

  echo json_encode($result);
?>