<?php

namespace Tests\Feature\Http\Controllers\Api\VideoController;

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
use Tests\Traits\TestUploads;
use Tests\Traits\TestValidations;

class VideoControllerUploadsTest extends BaseVideoControllerTestCase
{
    use TestValidations, TestUploads;
    
    // TODO: update this test for the other files
    public function testInvalidationInVideoFileFields()
    {
        $fileFields = [
            [
                'field_name' => 'video_file',
                'extension' => 'mp4',
                'max_size' => 52428800,
                'rule' => 'mimetypes',
                'rule_params' => ['values' => 'video/mp4']
            ],
            [
                'field_name' => 'thumb_file',
                'extension' => 'jpg',
                'max_size' => 5120,
                'rule' => 'mimetypes',
                'rule_params' => ['values' => 'image/jpeg']
            ],
            [
                'field_name' => 'banner_file',
                'extension' => 'jpg',
                'max_size' => 10240,
                'rule' => 'mimetypes',
                'rule_params' => ['values' => 'image/jpeg']
            ],
            [
                'field_name' => 'trailer_file',
                'extension' => 'mp4',
                'max_size' => 1048576,
                'rule' => 'mimetypes',
                'rule_params' => ['values' => 'video/mp4']
            ]
        ];

        foreach ($fileFields as $fields) {
            $this->assertInvalidationFile(
                $fields['field_name'], 
                $fields['extension'],
                $fields['max_size'],
                $fields['rule'],
                $fields['rule_params']
            );
        }
    }

    public function testStoreWithFiles()
    {
        \Storage::fake();
        $files = $this->getFiles();

        $category = factory(Category::class)->create();
        /** @var Genre $genre */
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->id);

        $response = $this->json('POST', 
            $this->routeStore(),
            $this->sentData +  [
                'categories_id' => [$category->id],
                'genres_id' => [$genre->id]
            ] + $files
        );

        $response->assertStatus(201);

        foreach ($files as $file) {
            \Storage::assertExists("{$response->json('id')}/{$file->hashName()}");
        }
    }

    public function testUpdateWithFiles()
    {
        \Storage::fake();
        $files = $this->getFiles();

        $category = factory(Category::class)->create();
        /** @var Genre $genre */
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->id);


        $response = $this->json('PUT', 
            $this->routeUpdate(),
            $this->sentData +  [
                'categories_id' => [$category->id],
                'genres_id' => [$genre->id]
            ] + $files
        );
        $response->assertStatus(200);
        
        foreach ($files as $file) {
            \Storage::assertExists("{$response->json('id')}/{$file->hashName()}");
        }
    }

    private function routeStore() 
    {
        return route('videos.store');
    }

    private function routeUpdate()
    {
        return route('videos.update', ['video' => $this->video->id]);
    }

    private function model() {
        return Video::class;
    }

    protected function getFiles()
    {
        return [
            'video_file' => UploadedFile::fake()->create("video_file.mp4"),
            'thumb_file' => UploadedFile::fake()->create('thumb_file.jpg'),
            'banner_file' => UploadedFile::fake()->create('banner_file.jpg'),
            'trailer_file' => UploadedFile::fake()->create("trailer_file.mp4"),
        ];
    }
}