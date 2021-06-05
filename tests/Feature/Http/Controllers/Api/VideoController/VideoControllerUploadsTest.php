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
use Illuminate\Support\Arr;
use Tests\Exceptions\TestException;
use Tests\TestCase;
use Tests\Traits\ControllerMocks;
use Tests\Traits\TestSaves;
use Tests\Traits\TestUploads;
use Tests\Traits\TestValidations;

class VideoControllerUploadsTest extends BaseVideoControllerTestCase
{
    use TestValidations, TestUploads;
    
    public function testInvalidationInVideoFileFields()
    {
        $fileFields = [
            [
                'field_name' => 'video_file',
                'extension' => 'mp4',
                'max_size' => Video::VIDEO_FILE_MAX_SIZE,
                'rule' => 'mimetypes',
                'rule_params' => ['values' => 'video/mp4']
            ],
            [
                'field_name' => 'thumb_file',
                'extension' => 'jpg',
                'max_size' => Video::THUMB_FILE_MAX_SIZE,
                'rule' => 'image',
                'rule_params' => []
            ],
            [
                'field_name' => 'banner_file',
                'extension' => 'jpg',
                'max_size' => Video::BANNER_FILE_MAX_SIZE,
                'rule' => 'image',
                'rule_params' => []
            ],
            [
                'field_name' => 'trailer_file',
                'extension' => 'mp4',
                'max_size' => Video::TRAILER_FILE_MAX_SIZE,
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
        $response = $this->json('POST', 
            $this->routeStore(),
            $this->sentData + $files
        );

        $response->assertStatus(201);
        $this->assertFilesOnPersist($response, $files);
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
            $this->sentData + $files
        );
        $response->assertStatus(200);
        $this->assertFilesOnPersist($response, $files);


        $newFiles = [
            'thumb_file' => UploadedFile::fake()->create('thumb_file.jpg'),
            'video_file' => UploadedFile::fake()->create('video_file.mp4'),
        ];
        $response = $this->json('PUT', 
            $this->routeUpdate(),
            $this->sentData + $newFiles
        );
        $response->assertStatus(200);
        $this->assertFilesOnPersist(
            $response,
            Arr::except($files, ['thumb_file', 'video_file']) + $newFiles
        );

        $id = $response->json('data.id');
        $video = Video::find($id);
        \Storage::assertMissing($video->relativeFilePath($files['thumb_file']->hashName()));
        \Storage::assertMissing($video->relativeFilePath($files['video_file']->hashName()));
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

    protected function assertFilesOnPersist(TestResponse $response, $files) 
    {
        $id = $response->json('data.id');
        $video = Video::find($id);
        $this->assertFilesExistsInStorage($video, $files);
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