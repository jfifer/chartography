<?php
include_once 'AbstractController.php';

class AuthController extends AbstractController {
   public function getAction($request) {
      $auth = new AuthModel();
      return $auth->checkAuth();
   }

   public function postAction($request) {
      $params = $request->url_elements;
      $auth = new AuthModel();
      if(isset($request->parameters['username']) && isset($request->parameters['password'])) {
         $data = $auth->login($request->parameters['username'], $request->parameters['password']);
      } else {
         $data = $auth->logout();
      }
      return $data;
   }
}
