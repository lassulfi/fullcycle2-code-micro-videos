<?php

namespace Tests\Traits;

trait ControllerMocks
{
    protected function mockFunction($controller, $mockData) {
        $controller->shouldReceive($mockData['mockFunction'])
            ->withAnyArgs()
            ->andReturn($mockData['mockReturn']);
    }
}