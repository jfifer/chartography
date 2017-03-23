<?php

abstract class AbstractController {

    abstract public function getAction($request);

    abstract public function postAction($request);
    
    public function successResponse() {
        $data['error'] = 'false';
        $data['code'] = 0;
        return $data;
    }

    public function errorResponse($message = "") {
        $data['error'] = 'true';
        $data['code'] = 1001;
        $data['message'] = $message;
        return $data;
    }
    
    public function processRequest ($class, $request) {
        // Generic wrapper to process a method for a class based on verb
        $verb = strtolower($request->verb);
        $method = ($request->url_elements[2] ?: $request->parameters['method']);
        $method = $verb . "_" . $method;
        $this->request = $request;

        if (method_exists($class, $method)) {
            $reflection = new ReflectionMethod($class, $method);
            if ($reflection->isPublic()) {
                return $class->$method();
            }
        }
        $this->dieErrorCode(400, "Invalid Method");
    }  
};
