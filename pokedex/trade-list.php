<?php

// $filepath = "debug/trade-list.txt";
// $date = "[" . date("Y-m-d H:i:s") . "]";
// file_put_contents($filepath, $date . " new request received: \n", FILE_APPEND);

include 'common.php';

// set php runtime to unlimited
set_time_limit(0);

if (!isset($_POST["pid"]) || !isset($_POST["column"])) {
    error_message("Missing at least one of your parameters!");
}

$column = $_POST["column"];
$pid = $_POST["pid"];
$last_trade_list = isset($_POST["tids"]) ? $_POST["tids"] : array();

while (true) {
    $rows = db_query($column, $pid, $db);

    $curr_trade_list = array();
    foreach ($rows as $row) {
        array_push($curr_trade_list, $row["tid"]);
        // echo $row["tid"];
    }

    // if last trade list is null or there's a difference between the last and
    //  current trade list, send the client the new trade list
    if (!(empty(array_diff($last_trade_list, $curr_trade_list))
        && empty(array_diff($curr_trade_list, $last_trade_list)))) {
        
        $rows = db_query($column, $pid, $db);

        header("Content-type: application/json");
        $output = array();
        foreach ($rows as $row) {
            $trade_info = array(
                "tid" => $row["tid"],
                "from-player" => $row["from_username"],
                "to-player" => $row["to_username"],
                "offer" => $row["offer"],
                "request" => $row["request"]
            );
            array_push($output, $trade_info);
        }

        echo json_encode($output);
        break;
    } else {
        sleep(1);
        continue;
    }
}

function db_query($column, $pid, $db) {
    try {
        $rows = $db->query("SELECT * FROM Trades" .
                          " WHERE $column = '$pid' AND status = 'pending';");
    }
    catch (PDOException $ex) {
        db_error_message("Can not query the database.", $ex);
    }
    return $rows;
}
?>