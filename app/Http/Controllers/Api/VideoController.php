<?php

namespace App\Http\Controllers\Api;

use App\Models\Video;
use App\Rules\GenresHasCategoriesRule;
use App\Rules\RelatesToCategory;
use App\Rules\RelatesToGenre;
use Illuminate\Http\Request;

class VideoController extends BasicCrudController
{
    private $rules;

    public function __construct()
    {
        $this->rules = [
            'title' => 'required|max:255',
            'description' => 'required',
            'year_launched' => 'required|date_format:Y',
            'opened' => 'boolean',
            'rating' => 'required|in:' . implode(',', Video::RATING_LIST),
            'duration' => 'required|integer',
            'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL',
            'genres_id' => ['required', 'array', 'exists:genres,id,deleted_at,NULL'],
        ];
    }

    public function store(Request $request)
    {
        $this->addRuleIfGenreHasCategories($request);
        $validatedData = $this->validate($request, $this->ruleStore());
        $self = $this;
        $obj = \DB::transaction(function () use($request, $validatedData, $self) {
            /** @var Video $obj */
            $obj = $this->model()::create($validatedData);
            $self->handleRelations($obj, $request);
            return $obj;
        });
        $obj->refresh();
        return $obj;
    }
    
    public function update(Request $request, string $id)
    {
        $obj = $this->findOrFail($id);
        $this->addRuleIfGenreHasCategories($request);
        $validatedData = $this->validate($request, $this->ruleUpdate());
        $self = $this;
        $obj = \DB::transaction(function () use($request, $validatedData, $self, $obj) {
            /** @var Video $obj */
            $obj->update($validatedData);
            $self->handleRelations($obj, $request);
            return $obj;
        });
        return $obj;
    }

    protected function addRuleIfGenreHasCategories(Request $request)
    {
        $categoriesId = $request->get('categories_id');
        $categoriesId = is_array($categoriesId) ? $categoriesId : [];
        $this->rules['genres_id'][] = new GenresHasCategoriesRule($categoriesId);
    }

    protected function handleRelations($video, Request $request)
    {
        $video->categories()->sync($request->get('categories_id'));
        $video->genres()->sync($request->get('genres_id'));
    }

    protected function model()
    {
        return Video::class;
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
