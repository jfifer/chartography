<?php
include_once 'AbstractController.php';

class VmController extends AbstractController {
   public function getAction($request) {
     $vm = new VmModel();
     if(isset($request->url_elements[2])) {
       if($request->url_elements[3]) {
         $data = $vm->listContexts($request->url_elements[3]);       
       } else {
         $data = $vm->listContexts(null);
       }
     } else {
       if(isset($request->params)) {
         $data = $request;
       } else {
         $data = $vm->listFeatureServers();
       }
     }
     return $data; 
   }

   public function postAction($request) {
     
   }
}
