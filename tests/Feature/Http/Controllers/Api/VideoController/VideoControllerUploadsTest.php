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
    
    public function testInvalidationInVideoFileField()
    {
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            512,
            'mimetypes', ['values' => 'video/mp4']
        );
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
            'video_file' => UploadedFile::fake()->create("video_file.mp4")
        ];
    }
}