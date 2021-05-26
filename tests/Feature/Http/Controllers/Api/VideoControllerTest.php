<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\VideoController;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestResponse;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Tests\Exceptions\TestException;
use Tests\TestCase;
use Tests\Traits\ControllerMocks;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class VideoControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, ControllerMocks;

    private $video;
    private $sentData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = factory(Video::class)->create([
            'opened' => false
        ]);
        $this->sentData = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90
        ];

    }
    
    public function testIndex()
    {
        $response = $this->get(route('videos.index'));

        $response
            ->assertStatus(200)
            ->assertJson([$this->video->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('videos.show', ['video' => $this->video->id]));

        $response
            ->assertStatus(200)
            ->assertJson($this->video->toArray());
    }

    public function testInvalidationRequired()
    {
        $data = [
            'title' => '',
            'description' => '',
            'year_launched' => '',
            'rating' => '',
            'duration' => '',
            'categories_id' => '',
            'genres_id' => ''
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');
    }

    public function testInvalidationMax() {
        $data = [
            'title' => str_repeat('a', 256),
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);
    }

    public function testInvalidationInteger()
    {
        $data = [
            'duration' => 's'
        ];
        $this->assertInvalidationInStoreAction($data, 'integer');
        $this->assertInvalidationInUpdateAction($data, 'integer');
    }

    public function testInvalidationYearLaunched()
    {
        $data = [
            'year_launched' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'date_format', ['format' => 'Y']);
        $this->assertInvalidationInUpdateAction($data, 'date_format', ['format' => 'Y']);
    }

    public function testInvalidationOpenedField()
    {
        $data = [
            'opened' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');
    }

    public function testInvalidationRatingField()
    {
        $data = [
            'rating' => 0
        ];
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');
    }

    public function testInvalidationCategoriesIdField()
    {
        $data = [
            'categories_id' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'categories_id' => [100]
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

    public function testInvalidationGenresIdField()
    {
        $data = [
            'genres_id' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'genres_id' => [100]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

        $genre = factory(Genre::class)->create();
        $genre->delete();
        $data = [
            'genres_id' => [$genre->id]
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

        $genreId = factory(Genre::class)->create()->id;
        $data = [
            'genres_id' => [$genreId]
        ];
        $this->assertInvalidationInStoreAction($data, 'genres_has_categories');
        $this->assertInvalidationInUpdateAction($data, 'genres_has_categories');
    }

    public function testInvalidationInVideoFileField()
    {
        \Storage::fake();
        $data = [
            'video_file' => UploadedFile::fake()->create('video.mpeg'),
        ];
        $this->assertInvalidationInStoreAction($data, 'mimes', ['values' => 'mp4']);
        $this->assertInvalidationInUpdateAction($data, 'mimes',  ['values' => 'mp4']);
        \Storage::assertMissing('video.mpeg');

        \Storage::fake();
        $data = [
            'video_file' => UploadedFile::fake()->create('video.mp4', 1024),
        ];
        $this->assertInvalidationInStoreAction($data, 'size.file', ['size' => 512]);
        $this->assertInvalidationInUpdateAction($data, 'size.file', ['size' => 512]);
        \Storage::assertMissing('video.mp4');
    }

    public function testSave()
    {
        $category = factory(Category::class)->create();
        /** @var Genre $genre */
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->id);

        $data = [
            [
                'send_data' => $this->sentData + [
                    'categories_id' => [$category->id],
                    'genres_id' => [$genre->id]
                ],
                'test_data' => $this->sentData + ['opened' => false]
            ],
            [
                'send_data' => $this->sentData + [
                    'opened' => true,
                    'categories_id' => [$category->id],
                    'genres_id' => [$genre->id]
                ],
                'test_data' => $this->sentData + ['opened' => true]
            ],
            [
                'send_data' => $this->sentData + [
                    'rating' => Video::RATING_LIST[1],
                    'categories_id' => [$category->id],
                    'genres_id' => [$genre->id]
                ],
                'test_data' => $this->sentData + ['rating' => Video::RATING_LIST[1]]
            ],
        ];

        foreach ($data as $key => $value) {
            $response = $this->assertStore($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response->assertJsonStructure([
                'created_at',
                'updated_at'
            ]);
            $this->assertHasCategory($response->json('id'), $value['send_data']['categories_id'][0]);
            $this->assertHasGenre($response->json('id'), $value['send_data']['genres_id'][0]);
            $response = $this->assertUpdate($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response->assertJsonStructure([
                'created_at',
                'updated_at'
            ]);
            $this->assertHasCategory($response->json('id'), $value['send_data']['categories_id'][0]);
            $this->assertHasGenre($response->json('id'), $value['send_data']['genres_id'][0]);
        }
    }

    public function testUploadFile()
    {
        $category = factory(Category::class)->create();
        /** @var Genre $genre */
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->id);

        \Storage::fake();
        $file = UploadedFile::fake()->create('video.mp4', 512);
        $data = [
            'send_data' => $this->sentData + [
                'categories_id' => [$category->id],
                'genres_id' => [$genre->id],
                'video_file' => $file,
            ],
            'test_data' => $this->sentData + [
                'opened' => false,
                'deleted_at' => null
            ],
        ];
        $response = $this->assertStore($data['send_data'], $data['test_data']);
        $response->assertJsonStructure([
            'created_at',
            'updated_at'
        ]);
        \Storage::assertExists("{$response->json('id')}/{$file->hashName()}");
    }

    // public function testSyncCategories()
    // {
    //     $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();
    //     $genre = factory(Genre::class)->create();
    //     $genre->categories()->sync($categoriesId);
    //     $genreId = $genre->id;

    //     $response = $this->json('POST', $this->routeStore(), $this->sentData + [
    //         'genres_id' => [$genreId],
    //         'categories_id' => [$categoriesId[0]]
    //     ]);
    //     $this->assertDatabaseHas('category_video', [
    //         'category_id' => $categoriesId[0],
    //         'video_id' => $response->json('id')
    //     ]);

    //     $response = $this->json('PUT', route('videos.update', ['video' => $response->json('id')]), 
    //         $this->sentData + [
    //             'genres_id' => [$genreId],
    //             'categories_id' => [$categoriesId[1], $categoriesId[2]]
    //         ]
    //     );
    //     $this->assertDatabaseMissing('category_video', [
    //         'category_id' => $categoriesId[0],
    //         'video_id' => $response->json('id')
    //     ]);
    //     $this->assertDatabaseHas('category_video', [
    //         'category_id' => $categoriesId[1],
    //         'video_id' => $response->json('id')
    //     ]);
    //     $this->assertDatabaseHas('category_video', [
    //         'category_id' => $categoriesId[2],
    //         'video_id' => $response->json('id')
    //     ]);
    // }

    // public function testSyncGenres()
    // {
    //     /** @var Collection $genres */
    //     $genres = factory(Genre::class, 3)->create();
    //     $genresId = $genres->pluck('id')->toArray();
    //     $categoryId = factory(Category::class)->create()->id;
    //     $genres->each(function ($genre) use($categoryId) {
    //         $genre->categories()->sync($categoryId);
    //     });

    //     $response = $this->json('POST', $this->routeStore(), $this->sentData + [
    //         'categories_id' => [$categoryId],
    //         'genres_id' => [$genresId[0]]
    //     ]);
    //     $this->assertDatabaseHas('genre_video', [
    //         'genre_id' => $genresId[0],
    //         'video_id' => $response->json('id')
    //     ]);

    //     $response = $this->json('PUT', route('videos.update', ['video' => $response->json('id')]), 
    //         $this->sentData + [
    //             'categories_id' => [$categoryId],
    //             'genres_id' => [$genresId[1], $genresId[2]]
    //         ]
    //     );
    //     $this->assertDatabaseMissing('genre_video', [
    //         'genre_id' => $genresId[0],
    //         'video_id' => $response->json('id')
    //     ]);
    //     $this->assertDatabaseHas('genre_video', [
    //         'genre_id' => $genresId[1],
    //         'video_id' => $response->json('id')
    //     ]);
    //     $this->assertDatabaseHas('genre_video', [
    //         'genre_id' => $genresId[2],
    //         'video_id' => $response->json('id')
    //     ]);
    // }

    // public function testRollbackStore() 
    // {
    //     $mockData = [
    //         [
    //             'mockFunction' => 'validate',
    //             'mockReturn' => $this->sentData
    //         ],
    //         [
    //             'mockFunction' => 'ruleStore',
    //             'mockReturn' => []
    //         ]
    //     ];
        
    //     $controller = \Mockery::mock(VideoController::class)
    //         ->makePartial()
    //         ->shouldAllowMockingProtectedMethods();
    //     foreach ($mockData as $key => $value) {
    //         $this->mockFunction($controller, $value);
    //     }
    //     $controller->shouldReceive('handleRelations')
    //         ->once()
    //         ->andThrow(new TestException());

    //     $request = \Mockery::mock(Request::class);
    //     $request->shouldReceive('get')
    //         ->withAnyArgs()
    //         ->andReturnNull();
        
    //     $hasErrors = false;
    //     try {
    //         $controller->store($request);
    //     } catch (TestException $exception) {
    //         $this->assertCount(1, Video::all());
    //         $hasErrors = true;
    //     }

    //     $this->assertTrue($hasErrors);
    // }

    // public function testRollbackUpdate() {
    //     $mockData = [
    //         [
    //             'mockFunction' => 'findOrFail',
    //             'mockReturn' => $this->video
    //         ],
    //         [
    //             'mockFunction' => 'validate',
    //             'mockReturn' => $this->sentData
    //         ],
    //         [
    //             'mockFunction' => 'ruleUpdate',
    //             'mockReturn' => []
    //         ]
    //     ];

    //     $controller = \Mockery::mock(VideoController::class)
    //         ->makePartial()
    //         ->shouldAllowMockingProtectedMethods();
    //     foreach ($mockData as $key => $value) {
    //         $this->mockFunction($controller, $value);
    //     }
    //     $controller->shouldReceive('handleRelations')
    //         ->once()
    //         ->andThrow(new TestException());

    //     $request = \Mockery::mock(Request::class);
    //     $request->shouldReceive('get')
    //         ->withAnyArgs()
    //         ->andReturnNull();
        
    //     $hasErrors = false;
    //     try {
    //         $controller->update($request, $this->video->id);
    //     } catch (TestException $exception) {
    //         $this->assertCount(1, Video::all());
    //         $hasErrors = true;
    //     }
        
    //     $this->assertTrue($hasErrors);
    // }

    public function testDestroy()
    {
        $response = $this->assertDestroy($this->video->id);
        $response
            ->assertStatus(204)
            ->assertNoContent();
    }

    private function routeStore() 
    {
        return route('videos.store');
    }

    private function routeUpdate()
    {
        return route('videos.update', ['video' => $this->video->id]);
    }

    protected function routeDestroy()
    {
        return route('videos.destroy', ['video' => $this->video->id]);
    }

    private function model() {
        return Video::class;
    }

    protected function assertHasCategory($videoId, $categoryId)
    {
        $this->assertDatabaseHas('category_video', [
            'video_id' => $videoId,
            'category_id' => $categoryId
        ]);
    }

    protected function assertHasGenre($videoId, $genreId)
    {
        $this->assertDatabaseHas('genre_video', [
            'video_id' => $videoId,
            'genre_id' => $genreId
        ]);
    }
}