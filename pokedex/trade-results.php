<?php
## trade-results.php
## modify the database and provide clients the result of a trade
## once it detects a trade proposed by the client that's either
## accepted or declined.
##
## @params:
##      int - $_POST["pid"]

include 'common.php';

// set php runtime to unlimited
set_time_limit(0);

if (!isset($_POST["pid"])) {
    error_message("Missing at least one of your parameters!");
}

$pid = $_POST["pid"];

while (true) {
    try {
        $rows = $db->query("SELECT COUNT(*) FROM Trades" .
                          " WHERE from_pid = '$pid' AND status <> 'pending' AND status <> 'complete';");
    }
    catch (PDOException $ex) {
        db_error_message("Can not query the database.", $ex);
    }

    foreach ($rows as $row) {
        $trade_count = $row["COUNT(*)"];
    }

    if ($trade_count != 0) {
        try {
            $rows = $db->query("SELECT * FROM Trades" .
                              " WHERE from_pid = '$pid' AND status <> 'pending' AND status <> 'complete';");
        }
        catch (PDOException $ex) {
            db_error_message("Can not query the database.", $ex);
        }

        // this gives the trade info of the last trade in the list
        foreach ($rows as $row) {
            $tid = $row["tid"];
            $p2 = $row["to_username"];
            $p1_pkm = $row["offer"];
            $p2_pkm = $row["request"];
            $trade_status = $row["status"];
        }

        try {
            $sql = "UPDATE Trades SET status = 'complete' WHERE tid = :tid ;";
            $stmt = $db->prepare($sql);
            $stmt->execute(array("tid" => $tid));
        }
        catch (PDOException $ex) {
            db_error_message("Failed to change the proposal status in the database", $ex);
        }

        if ($trade_status == "accept") {
            $message = "Your trade proposal with $p2 has been accepted. "
                        . "Your Pokedex has been updated accordingly.";
        } else if ($trade_status == "decline") {
            $message = "Your trade proposal with $p2 has been declined.";
        } else {
            $message = "Your trade proposal with $p2 has been cancelled.";
        }

        header("Content-type: application/json");
        $result = Array(
            "status" => $trade_status,
            "offer" => $p1_pkm,
            "request" => $p2_pkm,
            "message" => $message
        );
        echo(json_encode($result));
        break;
    } else {
        sleep(1);
        continue;
    }
}

?>