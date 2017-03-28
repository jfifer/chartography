<?php
require_once 'db/config.php';

abstract class AbstractDataModel {

  private $dbh_portal = null;

  private $row_limit = 50;

  function __construct() {}

  public function get_row_limit() {
    return $this->row_limit;
  }

  function connect_portal_db() {
    // Establish a connection to the database server.
    if($this->dbh_portal == null) {
      $this->dbh_portal = mysqli_connect(DB_SERVER_PORTAL, DB_USER_PORTAL, DB_PASS_PORTAL, DB_NAME_PORTAL, DB_PORT_PORTAL);
      if (mysqli_connect_errno()) {
        $err_params = array();
        $err_params['sql_error'] = mysqli_connect_error($this->dbh_portal);
        $err_params['db_host'] = DB_SERVER_PORTAL;
        $err_params['db_name'] = DB_NAME_PORTAL;
        return false;
      }
    }
    return true;
  }
  function get_dbh_portal() {
    if($this->dbh_portal == null) 
      $this->connect_portal_db();
    return $this->dbh_portal;
  }

  function connect_vm_db() {
    // Establish a connection to the database server.
    if($this->dbh_vm == null) {
      $this->dbh_vm = mysqli_connect(DB_SERVER_VM, DB_USER_VM, DB_PASS_VM, DB_NAME_VM, DB_PORT_VM);
      if (mysqli_connect_errno()) {
        $err_params = array();
        $err_params['sql_error'] = mysqli_connect_error($this->dbh_vm);
        $err_params['db_host'] = DB_SERVER_VM;
        $err_params['db_name'] = DB_NAME_VM;
        return false;
      }
    }
    return true;
  }
  function get_dbh_vm() {
    if($this->dbh_vm == null)
      $this->connect_vm_db();
    return $this->dbh_vm;
  }
   
  function do_curl($uri) {
    // inject common variables to data container
    $data['tid'] = 1;
    $data['type'] = "rpc";
    // fetch authorization cookie
    $ch = curl_init("https://monitor.coredial.com:443/zport/acl_users/cookieAuthHelper/login");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERPWD, "jfifer:zB7JTp");
    curl_setopt($ch, CURLOPT_COOKIEFILE, "cookie.txt");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8'));
    curl_exec($ch);
    // execute xmlrpc action
    curl_setopt($ch, CURLOPT_URL, "https://monitoring.coredial:443{$uri}");
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    $result = curl_exec($ch);
    // error handling
    if($result===false)
      throw new Exception('Curl error: ' . curl_error($ch));
    curl_close($ch);
    return $result;
  }

  function needsWhere($params) {
    foreach($params['fields'] as $field=>$val) {
      if($val['type'] === "string") {
         if(sizeof($val['value']) > 0) {
           return true;
         }
       } elseif($val['type'] === "date") {
         if(($val['fixed']['start'] !== '' && $val['fixed']['end'] !== '')
           || (isset($val['relative']['count']) && $val['relative']['count'] !== '')) {
           return true;
         }
       }
    }
    return false;
  }

  function procDate($date) {
    $sql = "";
    if($date['rangeType'] === "fixed") {
      if($date['fixed']['start'] === '' && $date['fixed']['end'] === '') {
        return null;
     } elseif($date['fixed']['start'] !== '' && $date['fixed']['end'] === '') {
        $sql .= "start LIKE '%".$date['fixed']['start']."%' ";
      } else {
        $sql .= "start BETWEEN '".$date['fixed']['start']."' AND '".$date['fixed']['end']."' ";
      }
    } else {
      $sql .= "start BETWEEN DATE_SUB(NOW(), INTERVAL ".$date['relative']['count']." ".$date['relative']['frame'].") AND NOW() ";
    }
    return $sql;
  }

  function buildSimpleQuery($params) {
    $hasField = FALSE;
    if(isset($params['selectX']) && $params['selectX'] !== '') {
      $sql = "SELECT ".$params['selectX']." as x, ".$params['selectY']." as y FROM ".$params['tbl']." ";
    } else {
      $sql = "SELECT ".$params['selectY']." as y FROM ".$params['tbl']." ";
    }
    if($this->needsWhere($params)) {
      $sql .= "WHERE ";
      $fieldCount = sizeof($params['fields']);
      $i = 0;
      foreach($params['fields'] as $field=>$val) {
        if($val['type'] === "string" && sizeof($val['value'])>0) {
          if($hasField) { $sql .= " AND "; }
          $hasField = true;
          $size = sizeof($val['value']);
          $idx = 0;
          $sql .= "(";
          if(sizeof($val['value']) > 0) {
            foreach($val['value'] as $value) {
              $sql .= $field."='".$value."'";
              if($idx < $size-1) {
                $sql .= " OR ";
              }
              $idx++;
            }
          }
          $sql .= ") ";
        } elseif($val['type'] === "date") {
          if($hasField) { $sql .= " AND "; }
          $sql .= $this->procDate($val);
        }
        $i++;
      }
    }
    if(sizeof($params['groupBy']) > 0) {
      $sql .= "GROUP BY ";
      $size = sizeof($params['groupBy']);
      $idx = 0;
      foreach($params['groupBy'] as $group) {
        $sql .= $group;
        if($idx < $size-1) {
          $sql .= ", ";
        } else { $sql .= " "; }
        $idx++;
      }
    }
    return $sql;
  }

  function buildComplexQuery($params) {
    
  }

  function convert_to_array2($dataResource) {
    $newArray = array();
    $var_type = gettype($dataResource);
    if ($var_type == "object") {
      for ($i = 0; $i < mysqli_num_rows($dataResource); $i++) {
        $data = mysqli_fetch_assoc($dataResource);
        foreach ($data as $key => $value) {
          $newArray[$i][$key] = $value;
        }
      }
    }
    return $newArray;
  }
   
  function last_insert_id() {
    return $this->get_dbh_portal()->insert_id;
  }
};
