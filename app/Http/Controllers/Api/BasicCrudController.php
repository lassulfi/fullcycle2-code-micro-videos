<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

abstract class BasicCrudController extends Controller
{

    protected abstract function model();

    protected abstract function ruleStore();

    protected abstract function ruleUpdate();

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return $this->model()::all();
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
        $obj = $this->model()::create($validatedData);
        $obj->refresh();
        return $obj;
    }

    protected function findOrFail($id)
    {
        $model = $this->model();
        $keyName = (new $model)->getRouteKeyName();
        return $this->model()::where($keyName, $id)->firstOrFail();
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
        return $obj;
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

        $validatedData = $this->validate($request, $this->ruleUpdate());
        $obj->update($validatedData);

        return $obj;
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
}
