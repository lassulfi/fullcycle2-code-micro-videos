<?php

namespace Tests\Feature\Models;

use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class VideoTest extends TestCase
{
    use DatabaseMigrations;

    private $data;

    protected function setUp(): void
    {
        parent::setUp();
        $this->data = [
            'title' => 'title',
            'description' => 'description',
            'opened' => false,
            'year_launched' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90
        ];
    }

    public function testList()
    {
        factory(Video::class, 1)->create();
        $videos = Video::all();
        $this->assertCount(1, $videos);

        $videoKeys = array_keys($videos->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id',
            'title',
            'description',
            'year_launched',
            'opened',
            'rating',
            'duration',
            'created_at',
            'updated_at',
            'deleted_at'
        ], $videoKeys);
    }

    public function testCreate()
    {
        $video = Video::create($this->data);
        $this->assertNotNull($video->id);
        $this->assertIsString($video->id);
        $this->assertRegExp('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', $video->id);
        $this->assertEquals('title', $video->title);
        $this->assertEquals('description', $video->description);
        $this->assertEquals(2010, $video->year_launched);
        $this->assertFalse($video->opened);
        $this->assertEquals(Video::RATING_LIST[0], $video->rating);
        $this->assertEquals(90, $video->duration);
    }

    public function testUpdate()
    {
        $video = factory(Video::class)->create($this->data);

        $data = [
            'title' => 'updated title',
            'description' => 'updated description',
            'year_launched' => 2011,
            'opened' => true,
            'rating' => Video::RATING_LIST[1],
            'duration' => 120
        ];

        $video->update($data);

        foreach ($data as $key => $value) {
            $this->assertEquals($value, $video->{$key});
        }
    }

    public function testDelete()
    {
        $video = factory(Video::class)->create()->first();
        $video->delete();

        $this->assertNotNull($video->deleted_at);
    }
}
