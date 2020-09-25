<?php
## propose.php
## accepts a trade proposal from a client and updates the database
##
## @params: $_POST["pid1"], $_POST["pid2"], $_POST["offer"], $_POST["request"]


include 'common.php';


if (!isset($_POST["pid1"]) || !isset($_POST["pid2"])
    || !isset($_POST["offer"]) || !isset($_POST["request"])) {
    error_message("Missing at least one of your parameters!");
}

$pid1 = $_POST["pid1"];
$pid2 = $_POST["pid2"];
$offer = $_POST["offer"];
$request = $_POST["request"];

$rows1 = user_query($pid1, $db);
$rows2 = user_query($pid2, $db);
$name1 = get_name($rows1);
$name2 = get_name($rows2);

try{
    $sql = "INSERT INTO Trades (from_pid, from_username, to_pid, to_username, offer, request, status) " .
            "VALUES (:from_pid, :from_username, :to_pid, :to_username, :offer, :request, :status );";
    $stmt = $db->prepare($sql);
    $params = array(
        "from_pid" => $pid1,
        "from_username" => $name1,
        "to_pid" => $pid2,
        "to_username" => $name2,
        "offer" => $offer,
        "request" => $request,
        "status" => "pending"
    );
    $stmt->execute($params);
}
catch (PDOException $ex) {
    db_error_message("Failed to add the proposal to the database", $ex);
}


header("Content-type: application/json");
$result = array(
    "status" => "success",
    "message" => "You've made a new trade request!"
);
echo json_encode($result);


function user_query($pid, $db) {
    try {
        $rows = $db->query("SELECT * FROM Users" .
                          " WHERE pid = '$pid';");
    }
    catch (PDOException $ex) {
        db_error_message("Can not query the database.", $ex);
    }
    return $rows;
}

function get_name($rows) {
    foreach ($rows as $row) {
        $pid = $row["username"];
    }

    return $pid;
}
?>