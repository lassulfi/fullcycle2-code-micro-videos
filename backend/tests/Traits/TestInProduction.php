<?php

namespace Tests\Traits;

trait TestInProduction
{
    protected function skipTestIfNotProduction($message = '')
    {
        if(!$this->isTestingProduction()) {
            $this->markTestSkipped($message);
        }
    }

    protected function isTestingProduction() {
        return env('TESTING_PROD') !== false;
    }
}
