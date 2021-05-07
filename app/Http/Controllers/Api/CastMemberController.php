<?php

namespace App\Http\Controllers\Api;

use App\Models\CastMember;

class CastMemberController extends BasicCrudController
{
    private $rules;

    public function __construct()
    {
        $this->rules = [
            'name' => 'required|max:255',
            'type' => 'required|in:' . implode(',', [CastMember::TYPE_DIRECTOR, CastMember::TYPE_ACTOR])
        ];
    }

    protected function model()
    {
        return CastMember::class;
    }
    
    protected function ruleStore()
    {
        return $this->rules;
    }

    protected function ruleUpdate()
    {
        return $this->rules;
    }
}
