<?php
$query = array(
  'select'=>"COUNT(*)",
  'tbl'=>"vmfinal",
  'groupBy'=>['context'],
  'fields'=>array(
    'fs'=>array(
      'type'=>'string',
      'array'=>true,
      'value'=>array()
    ),
    'context'=>array(
      'type'=>'string',
      'array'=>true,
      'value'=>array()
    ),
    'start'=>array(
      'type'=>'date',
      'rangeType'=>'relative',
      'fixed'=>array(
         'start'=>'',
         'end'=>''
      ),
      'relative'=>array(
        'count'=>'',
        'frame'=>'DAY'
      )
    )
  )
);

function needsWhere($params) {
  foreach($params['fields'] as $field=>$val) {
    if($val['type'] === "string") {
      if(sizeof($val['value']) > 0) {
        return true;
      }
    } elseif($val['type'] === "date") {
      if(($val['fixed']['start'] !== '' && $val['fixed']['end'] !== '')
        || ($val['relative']['count'] !== '' && $val['relative']['frame'] !== '')) {
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

function init($params) {
  $hasField = FALSE;
  $sql = "SELECT ".$params['select']. " FROM ".$params['tbl']." ";
  if(needsWhere($params)) {
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
        $sql .= procDate($val);
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
  print_r($sql);
}

init($query);
