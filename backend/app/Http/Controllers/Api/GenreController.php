<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\GenreResource;
use App\Models\Genre;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class GenreController extends BasicCrudController
{
    private $rules;

    public function __construct()
    {
        $this->rules = [
            'name' => 'required|max:255',
            'is_active' => 'boolean',
            'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL'
        ];
    }

    public function store(Request $request)
    {
        $validatedData = $this->validate($request, $this->ruleStore());
        $self = $this;
        $obj = \DB::transaction(function () use($validatedData, $self, $request) {
            /** @var Genre $obj */
            $obj = $this->model()::create($validatedData);
            $self->handleRelations($obj, $request);
            return $obj;
        });
        $obj->refresh();
        $resource = $this->resource();
        return new $resource($obj);
    }

    public function update(Request $request, string $id)
    {
        /** @var Genre $obj */
        $obj = $this->findOrFail($id);
        $validatedData = $this->validate($request, $this->ruleUpdate());
        $self = $this;
        $obj = \DB::transaction(function () use($obj, $validatedData, $self, $request) {
            $obj->update($validatedData);
            $self->handleRelations($obj, $request);
            return $obj;
        });
        $resource = $this->resource();
        return new $resource($obj);
    }

    protected function model()
    {
        return Genre::class;
    }

    protected function ruleStore()
    {
        return $this->rules;
    }

    /**
     * @param Genre $genre
     */
    protected function handleRelations($genre, Request $request)
    {
        $genre->categories()->sync($request->get('categories_id'));
    }

    protected function ruleUpdate()
    {
        return $this->rules;
    }

    protected function resourceColletion()
    {
        return $this->resource();
    }

    protected function resource()
    {
        return GenreResource::class;
    }

    protected function queryBuilder(): Builder
    {
        return parent::queryBuilder()->with('categories');
    }
}
