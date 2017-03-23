<?php
include_once 'AbstractController.php';

class PortalController extends AbstractController {
   public function getAction($request) {
      $auth = new AuthModel();
      $check = $auth->checkAuth();
      if($check.uid !== -1) {
        $portal = new PortalModel();
        if(isset($request->url_elements[2])) {
          if(isset($request->url_elements[3])) {
            switch($request->url_elements[2]) {
              case "group" :
                $data = $portal->listServersInGroup($request->url_elements[3]);
                break;
              case "server" :
                $data = $portal->getServerDetails($request->url_elements[3]);
                break;
              default:
                break;
            }
          } else {
            if($request->url_elements[2] === "group") {
               $data = $portal->getAllServers();
            } else {
               $data = $this->errorResponse("Invalid Action");
            }
          }
        } else {
          $data = $portal->listServerGroups();
        }
      } else {
        $data = $this->errorResponse("You must be logged in to perform this action.");
      }
      return $data;
   }

   public function postAction($request) {
     
   }
}
