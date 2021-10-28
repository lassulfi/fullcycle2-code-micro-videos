<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Builder;

abstract class BasicCrudController extends Controller
{
    protected $defaultPerPage = 15;

    protected abstract function model();

    protected abstract function ruleStore();

    protected abstract function ruleUpdate();

    protected abstract function resource();

    protected abstract function resourceCollection();

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', $this->defaultPerPage);
        $hasFilter = in_array(Filterable::class, class_uses($this->model()));
        $query = $this->queryBuilder();

        if ($hasFilter) {
            $query = $query->filter($request->all());
        }

        $data = $request->has('all') || !$this->defaultPerPage
            ? $query->get()
            : $query->paginate($perPage);

        $resourceCollectionClass = $this->resourceCollection();
        $refClass = new \ReflectionClass($resourceCollectionClass);

        return $refClass->isSubclassOf(ResourceCollection::class)
            ? new $resourceCollectionClass($data)
            : $resourceCollectionClass::collection($data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validatedData = $this->validate($request, $this->ruleStore());
        $obj = $this->queryBuilder()->create($validatedData);
        $obj->refresh();
        $resource = $this->resource();
        return new $resource($obj);
    }

    protected function findOrFail($id)
    {
        $model = $this->model();
        $keyName = (new $model)->getRouteKeyName();
        return $this->queryBuilder()->where($keyName, $id)->firstOrFail();
    }

    /**
     * Display the specified resource.
     *
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function show(string $id)
    {
        $obj = $this->findOrFail($id);
        $resource = $this->resource();

        return new $resource($obj);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, string $id)
    {
        $obj = $this->findOrFail($id);

        $validatedData = $this->validate(
            $request,
            $request->isMethod('PUT') ? $this->ruleUpdate() : $this->rulePatch()
        );
        $obj->update($validatedData);
        $resource = $this->resource();

        return new $resource($obj);
    }

    protected function rulePatch()
    {
        return array_map(function($rules) {
            if(is_array($rules)) {
                $exists = in_array("required", $rules);
                if($exists) {
                    array_unshift($rules, "sometimes");
                }
            } else {
                return str_replace("required", "sometimes|required", $rules);
            }
            return $rules;
        }, $this->ruleUpdate());
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  string $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(string $id)
    {
        $obj = $this->findOrFail($id);
        $obj->delete();
        return response()->noContent();
    }

    public function destroyCollection(Request $request)
    {
        $data = $this->validateIds($request);
        $this->model()::whereIn('id', $data['ids'])->delete();

        return response()->noContent();
    }

    protected function validateIds(Request $request)
    {
        $model = $this->model();
        $ids = explode(',', $request->get('ids'));
        $validator = \Validator::make(
            [ 'ids' => $ids ],
            [
                'ids' => 'required|exists:' . (new $model)->getTable() . ',id'
            ]
        );

        return $validator->validate();
    }

    protected function queryBuilder(): Builder
    {
        return $this->model()::query();
    }
}
