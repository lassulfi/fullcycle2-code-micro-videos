<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\GenreController;
use App\Models\Category;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\Request;
use Tests\Exceptions\TestException;
use Tests\TestCase;
use Tests\Traits\ControllerMocks;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class GenreControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, ControllerMocks;

    private $genre;
    private $sendData;

    public function setUp(): void
    {
        parent::setUp();
        $this->genre = factory(Genre::class)->create();
        $this->sendData = [
            'name' => 'test'
        ];
    }

    public function testIndex()
    {
        $response = $this->get(route('genres.index'));

        $response
            ->assertStatus(200)
            ->assertJson([$this->genre->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('genres.show', ['genre' => $this->genre->id]));

        $response
            ->assertStatus(200)
            ->assertJson($this->genre->toArray());
    }

    public function testInvalidationRequired()
    {
        $data = [
            'name' => '',
            'categories_id' => ''
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');
    }

    public function testInvalidationMax()
    {
        $data = [
            'name' => str_repeat('a', 256)
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);
    }
    
    public function testInvalidationIsActiveField()
    {
        $data = [
            'is_active' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');
    }

    public function testInvalidationCategoriesIdField()
    {
        $data = [
            'categories_id'=> 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'categories_id'=> [100]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists'); 
    }

    public function testSave()
    {
        $category = factory(Category::class)->create();
        $data = [
            [
                'send_data' => $this->sendData + ['categories_id' => [$category->id]],
                'test_data' => $this->sendData + ['is_active' => true]
            ],
            [
                'send_data' => $this->sendData + ['is_active' => false, 'categories_id' => [$category->id]],
                'test_data' => $this->sendData + ['is_active' => false]
            ],
        ];

        foreach ($data as $key => $value) {
            $response = $this->assertStore($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response->assertJsonStructure([
                'created_at',
                'updated_at'
            ]);
            $response = $this->assertUpdate($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response->assertJsonStructure([
                'created_at',
                'updated_at'
            ]);
        }
    }

    public function testRollbackStore()
    {
        $mockData = [
            [
                'mockFunction' => 'validate',
                'mockReturn' => $this->sendData
            ],
            [
                'mockFunction' => 'ruleStore',
                'mockReturn' => []
            ]
        ];
        $controller = \Mockery::mock(GenreController::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();
        foreach ($mockData as $key => $value) {
            $this->mockFunction($controller, $value);
        }
        $controller->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException());

        $request = \Mockery::mock(Request::class);

        try {
            $controller->store($request);
        } catch (TestException $exception) {
            $this->assertCount(1, Genre::all());
        }
    }

    public function testRollbackUpdate()
    {
        $mockData = [
            [
                'mockFunction' => 'findOrFail',
                'mockReturn' => $this->genre
            ],
            [
                'mockFunction' => 'validate',
                'mockReturn' => $this->sendData
            ],
            [
                'mockFunction' => 'ruleUpdate',
                'mockReturn' => []
            ]
        ];
        $controller = \Mockery::mock(GenreController::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();
        foreach ($mockData as $key => $value) {
            $this->mockFunction($controller, $value);
        }
        $controller->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException());

        $request = \Mockery::mock(Request::class);

        try {
            $controller->update($request, $this->genre->id);
        } catch (TestException $exception) {
            $this->assertCount(1, Genre::all());
        }
    }

    public function testDestroy()
    {
        $response = $this->assertDestroy($this->genre->id);

        $response
            ->assertStatus(204)
            ->assertNoContent();
    }

    private function routeStore()
    {
        return route('genres.store');
    }

    private function routeUpdate()
    {
        return route('genres.update', ['genre' => $this->genre->id]);
    }

    private function routeDestroy()
    {
        return route('genres.destroy', ['genre' => $this->genre->id]);
    }

    private function model()
    {
        return Genre::class;
    }
}
