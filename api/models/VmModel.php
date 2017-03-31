<?php
class VmModel extends AbstractDataModel {
  function doHistogram($params) {
    $sql = $this->buildSimpleQuery($params);
    $dataResource = mysqli_query($this->get_dbh_vm(), $sql);
    return $this->convert_to_array2($dataResource);
//    return $sql;
  }

  function doCalendar($params) {
    $sql = $this->buildSimpleQuery($params);
    $dataResource = mysqli_query($this->get_dbh_vm(), $sql);
    return $this->convert_to_array2($dataResource);
  }

  function doBarChart($params) {
    $sql = $this->buildSimpleQuery($params);
    $dataResource = mysqli_query($this->get_dbh_vm(), $sql);
    return $this->convert_to_array2($dataResource);
    return $sql;
  }

  function doPieChart($params) {
    $sql = $this->buildSimpleQuery($params);
    $dataResource = mysqli_query($this->get_dbh_vm(), $sql);
    return $this->convert_to_array2($dataResource);
//    return $sql;
  }
  
  function listFeatureServers() {
    $sql = "SELECT DISTINCT fs FROM vmfinal ORDER BY fs ASC";
    $dataResource = mysqli_query($this->get_dbh_vm(), $sql);
    return $this->convert_to_array2($dataResource);
  }

  function listContexts($fs) {
    $sql = "SELECT DISTINCT context FROM vmfinal";
    if(isset($fs) && $fs[0] !== '-1') {
      $fs = explode(",", $fs);
      $index = 0;
      $sql .= " WHERE ";
      $sql .= "(";
      foreach($fs as $k=>$server) {
        $sql .= "fs='".$server."'";
        if($index < sizeof($fs)-1) {
          $sql .= " OR ";
        }
        $index++;
      }
      $sql .= ")";
    }
    $sql .= " ORDER BY context ASC";
    $dataResource = mysqli_query($this->get_dbh_vm(), $sql);
    return $this->convert_to_array2($dataResource);
  }
}
