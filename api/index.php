<?php
session_start();
spl_autoload_register('apiAutoload');

function apiAutoload($classname) {
    if (preg_match('/[a-zA-Z]+Controller$/', $classname)) {
        include __DIR__ . '/controllers/' . $classname . '.php';
        return true;
    } elseif (preg_match('/[a-zA-Z]+Model$/', $classname)) {
        include __DIR__ . '/models/' . $classname . '.php';
        return true;
    } elseif (preg_match('/[a-zA-Z]+View$/', $classname)) {
        include __DIR__ . '/views/' . $classname . '.php';
        return true;
    }
}

class ApiRequest {

    public $url_elements;
    public $verb;
    public $parameters;

    public function __construct() {
        $this->verb = $_SERVER['REQUEST_METHOD'];
        $this->url_elements = explode('/', $_SERVER['PATH_INFO']);
        $this->parseIncomingParams();
        // initialise json as default format
        $this->format = 'json';
        if (isset($this->parameters['format'])) {
            $this->format = $this->parameters['format'];
        }
        return true;
    }

    public function parseIncomingParams() {
        $parameters = array();

        // first of all, pull the GET vars
        if (isset($_SERVER['QUERY_STRING'])) {
            parse_str($_SERVER['QUERY_STRING'], $parameters);
        }

        // now how about PUT/POST bodies? These override what we got from GET
        $body = file_get_contents("php://input");
        $content_type = false;
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $content_type = $_SERVER['CONTENT_TYPE'];
        }
        switch ($content_type) {
            case "application/json; charset=UTF-8":
            case "application/json;charset=UTF-8":
            case "application/json; charset=utf-8":
            case "application/json;charset=utf-8":
            case "application/json":
                $parameters = json_decode($body, true);
                $this->format = "json";
                break;
            case "application/x-www-form-urlencoded":
                parse_str($body, $postvars);
                foreach ($postvars as $field => $value) {
                    $parameters[$field] = $value;
                }
                $this->format = "html";
                break;
            default:
                // we could parse other supported formats here
                break;
        }
        $this->parameters = $parameters;
    }

}

$request = new ApiRequest();

// route the request to the right place
//print_r($request);
$controller_name = ucfirst($request->url_elements[1]) . 'Controller';
if (class_exists($controller_name)) {
    $controller = new $controller_name();
    $action_name = strtolower($request->verb) . 'Action';

    try {
        $result = $controller->$action_name($request);
    } catch (MongoException $ex) {
        error_log("$controller_name : $action_name : MongoDB error - " . $ex->getMessage());
        $result = ["error" => true, "code" => $ex->getCode(), "message" => "Unexpected system error."];
    }

    $view_name = ucfirst($request->format) . 'View';
    if (class_exists($view_name)) {
        $view = new $view_name();
        $view->render($result);
    }
}
        
