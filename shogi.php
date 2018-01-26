<?php
  $buf = $_POST['buf'] ;
  $filename = './board.txt';
  if($buf == ""){
    $buf = file_get_contents($filename);
    echo($buf);
  }else{
    $fp = fopen($filename, 'w');
    fputs($fp, $buf);
    fclose($fp);
    echo("");
  }
?>