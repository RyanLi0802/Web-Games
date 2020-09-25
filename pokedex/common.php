<?php
  ## common.php
  ## Configs the php data object for mysql database;
  ## Helper functions for the pokedex web service.

  header("Access-Control-Allow-Origin: *");

  error_reporting(E_ALL);
  ini_set('display_errors', 1);

  #Flag to set debugging on or off
  $debug = TRUE;

  # Variables for connections to the database.
  $host =  'localhost';
  $port = '8889';
  $user = 'root';
  $password = 'root';
  $dbname = 'pokedex';

  # Make a data source string that will be used in creating the PDO object
  $ds = "mysql:host={$host}:{$port};dbname={$dbname};charset=utf8";



  # Function to print an error message for an invalid request to our
  # webservice. Note that this is a different error type than that of catching
  # an error for a PDOException, which is unique to an internal database error (not an
  # invalid request sent from a client).
  #
  # param $msg The 400 error message to print as plain text
  function error_message($msg) {
    header("HTTP/1.1 400 Invalid Request");
    header("Content-Type: text/plain");
    die($msg);
  }


  # Connects to the mysql database
  try {
    $db = new PDO($ds, $user, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  }
  catch (PDOException $ex) {
    db_error_message("Can not connect to the database.", $ex);
  }

  # Function to print an error message and, depending on the debug flag,
  # add the exception error information.
  #
  # param $msg The 503 error message to print as plain text
  # param $ex The exception that is being passed in to this function, which will be
  #            printed if the global $debug flag is set to true. This can be null as well
  function db_error_message($msg, $ex) {
    global $debug;

    header("HTTP/1.1 503 Internal Database Error");
    header("Content-Type: text/plain");
    # note that we don't want a user to see internal errors for our db
    # (debug should be removed or false in a published website)

    if ($debug) {
      $msg .= "\n Error details: $ex \n";
    }
    die($msg);
  }
?>