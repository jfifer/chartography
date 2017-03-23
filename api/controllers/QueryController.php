<?php
include_once 'AbstractController.php';

class QueryController extends AbstractController {
  public function getAction($request) {}

  public function postAction($request) {
    if(class_exists($request->url_elements[2])) {
      switch($request->url_elements[3]) {
        case "histogram" :
          $model = new $request->url_elements[2];
          $data = $model->doHistogram($request->parameters);
          break;
        case "bar" :
          $model = new $request->url_elements[2];
          $data = $model->doBarChart($request->parameters);
          break;
        case "pie" :
          $model = new $request->url_elements[2];
          $data = $model->doPieChart($request->parameters);
          break;
        case "calendar" :
          $model = new $request->url_elements[2];
          $data = $model->doCalendar($request->parameters);
          break;
        default :
          break;
      }
    } else {
      $data = $this->errorResponse("The selected Model does not exist");
    }
    return $data;
  }
}
