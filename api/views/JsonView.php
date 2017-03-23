<?php

include_once 'AbstractApiView.php';

class JsonView extends AbstractApiView {

   public function render($content) {
      header('Content-Type: application/json; charset=utf8');
      if (isset($content['error']) && isset($content['message']) && !headers_sent() && !isset($content['status_code'])) {
         header("HTTP/1.1 500 Internal Server Error");
      }

      if(is_a($content, "MongoCursor")) {
         echo json_encode(iterator_to_array($content));
      } else {
         echo json_encode($content);
      }
      return true;
   }

}
