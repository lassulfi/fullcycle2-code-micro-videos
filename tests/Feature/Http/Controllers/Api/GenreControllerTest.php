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

        $category = factory(Category::class)->create();
        $category->delete();
        $data = [
            'categories_id' => [$category->id]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists'); 
    }

    public function testSave()
    {
        $categoryId = factory(Category::class)->create()->id;
        $data = [
            [
                'send_data' => $this->sendData + ['categories_id' => [$categoryId]],
                'test_data' => $this->sendData + ['is_active' => true]
            ],
            [
                'send_data' => $this->sendData + ['is_active' => false, 'categories_id' => [$categoryId]],
                'test_data' => $this->sendData + ['is_active' => false]
            ],
        ];

        foreach ($data as $key => $value) {
            $response = $this->assertStore($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response->assertJsonStructure([
                'created_at',
                'updated_at'
            ]);
            $this->assertHasCategory($response->json('id'), $categoryId);
            
            $response = $this->assertUpdate($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response->assertJsonStructure([
                'created_at',
                'updated_at'
                ]);
            $this->assertHasCategory($response->json('id'), $categoryId);
        }
    }

    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();
        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[0]]
        ];

        $response = $this->json('POST', $this->routeStore(), $sendData);
        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoriesId[0],
            'genre_id' => $response->json('id')
        ]);

        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ];
        $response = $this->json('PUT', route('genres.update', ['genre' => $response->json('id')]), 
            $sendData);
        $this->assertDatabaseMissing('category_genre', [
            'category_id' => $categoriesId[0],
            'genre_id' => $response->json('id')
        ]);
        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoriesId[1],
            'genre_id' => $response->json('id')
        ]);
        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoriesId[2],
            'genre_id' => $response->json('id')
        ]);
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

        $hasError = false;
        try {
            $controller->store($request);
        } catch (TestException $exception) {
            $this->assertCount(1, Genre::all());
            $hasError = true;
        }

        $this->assertTrue($hasError);
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

        $hasError = false;
        try {
            $controller->update($request, 1);
        } catch (TestException $exception) {
            $this->assertCount(1, Genre::all());
            $hasError = true;
        }
        $this->assertTrue($hasError);
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

    protected function assertHasCategory($genreId, $categoryId)
    {
        $this->assertDatabaseHas('category_genre', [
            'genre_id' => $genreId,
            'category_id' => $categoryId
        ]);
    }
}
