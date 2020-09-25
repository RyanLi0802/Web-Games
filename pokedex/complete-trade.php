<?php
## complete-trade.php
## records the reponse to a trade proposal from a client
## and modify the database accordingly
##
## @params:
##      int - $_POST["tid"];
##      bool - $_POST["accept"];    ("true"/"false")

include 'common.php';

if (!isset($_POST["tid"]) || !isset($_POST["accept"])) {
    error_message("Missing at least one of your parameters!");
}

$tid = $_POST["tid"];
$accept = $_POST["accept"];


$rows = trade_query($tid, $db);
foreach ($rows as $row) {
    $p1 = $row["from_username"];  //p1: player who proposed the trade
    $pid1 = $row["from_pid"];
    $p1_pkm = $row["offer"];
    $p2 = $row["to_username"];    //p2: player who accepted the trade
    $pid2 = $row["to_pid"];
    $p2_pkm = $row["request"];  
}

if ($accept == "true") {
    $count1 = count_pkm($pid1, $p1_pkm, $db);  // pokemon p1 offered (should not be 0)
    $count2 = count_pkm($pid2, $p2_pkm, $db);  // pokemon p2 offered (should not be 0)
    $count3 = count_pkm($pid1, $p2_pkm, $db);  // pokemon p1 requested (should be 0)
    $count4 = count_pkm($pid2, $p1_pkm, $db);  // pokemon p2 requested (should be 0)
    if ($count1 == 0 || $count2 == 0 || $count3 != 0 || $count4 != 0) {
        update_trade($tid, "cancelled", $db);
        $status = "cancelled";
        $message = "Your trade with $p1 cannot be completed, "
                    . "either any of you no longer have the pokemon being offered "
                    . "or any of you already have the pokemon requested";
        
    } else {
        update_trade($tid, "accept", $db);
        update_pokemon($pid1, $p1_pkm, $p2_pkm, $db);
        update_pokemon($pid2, $p2_pkm, $p1_pkm, $db);
        $status = "success";
        $message = "You have successfully traded your $p2_pkm with "
                    . "{$p1}'s {$p1_pkm}!";
    }
} else {
    update_trade($tid, "decline", $db);
    $status = "declined";
    $message = "You have successfully declined your trade with {$p1}!";
}


header("Content-type: application/json");
$result = Array(
    "status" => $status,
    "offer" => $p1_pkm,
    "request" => $p2_pkm,
    "message" => $message
);
echo(json_encode($result));

function trade_query($tid, $db) {
    try {
        $rows = $db->query("SELECT * FROM Trades" .
                          " WHERE tid = '$tid';");
    }
    catch (PDOException $ex) {
        db_error_message("Can not query the database.", $ex);
    }
    return $rows;
}


function count_pkm($pid, $pkm_name, $db) {
    try {
        $rows = $db->query("SELECT COUNT(*) FROM Pokemons" .
                          " WHERE pid = '$pid' AND pokemon_name = '$pkm_name';");

        foreach ($rows as $row) {
            $count = $row["COUNT(*)"];
        }
    }
    catch (PDOException $ex) {
        db_error_message("Can not query the database.", $ex);
    }

    return $count;
}

function update_trade($tid, $status, $db) {
    try {
        $sql = "UPDATE Trades SET status = '$status' WHERE tid = $tid ;";
        // echo $sql;
        // $stmt = $db->prepare($sql);
        $db->exec($sql);
    }
    catch (PDOException $ex) {
        db_error_message("Failed to change the proposal status in the database", $ex);
    }
}

function update_pokemon($pid, $old_pokemon, $new_pokemon, $db) {
    try {
        $sql = "UPDATE Pokemons SET pokemon_name = :new_pokemon "
                . "WHERE pid = :pid AND pokemon_name = :old_pokemon ;";
        $stmt = $db->prepare($sql);
        $params = array(
            "new_pokemon" => $new_pokemon,
            "pid" => $pid,
            "old_pokemon" => $old_pokemon
        );
        $stmt->execute($params);
    }
    catch (PDOException $ex) {
        db_error_message("Failed to update the database", $ex);
    }
}
?>