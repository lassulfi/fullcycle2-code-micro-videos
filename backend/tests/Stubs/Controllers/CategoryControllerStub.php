<?php

namespace Tests\Stubs\Controllers;

use App\Http\Controllers\Api\BasicCrudController;
use App\Http\Resources\CategoryResource;
use Tests\Stubs\Models\CategoryStub;

class CategoryControllerStub extends BasicCrudController
{
    protected function model()
    {
        return CategoryStub::class;
    }

    protected function ruleStore()
    {
        return [
            'name' => 'required|max:255',
            'description' => 'nullable',
        ];
    }

    protected function ruleUpdate()
    {
        return [
            'name' => 'required|max:255',
            'description' => 'nullable',
            'is_active' => 'boolean'
        ];
    }

    protected function resourceColletion()
    {
        return $this->resource();
    }

    protected function resource()
    {
        return CategoryResource::class;
    }
}
