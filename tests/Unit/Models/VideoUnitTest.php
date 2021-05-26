<?php

namespace Tests\Unit\Models;

use App\Models\Traits\Uuid;
use App\Models\Traits\UploadFiles;
use App\Models\Video;
use Tests\TestCase;
use Illuminate\Database\Eloquent\SoftDeletes;

class VideoUnitTest extends TestCase
{
    private $video;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = new Video();
    }

    public function testRatingList()
    {
        $ratingList = ['L', '10', '12', '14', '16', '18'];
        $this->assertEquals($ratingList, Video::RATING_LIST);
    }
    
    public function testFillableAttributes()
    {
        $fillable = [
            'title',
            'description',
            'year_launched',
            'opened',
            'rating',
            'duration'
        ];
        $this->assertEquals($fillable, $this->video->getFillable());
    }

    public function testIfUsesTraits()
    {
        $traits = [
            SoftDeletes::class, Uuid::class, UploadFiles::class
        ];
        $videoTraits = array_keys(class_uses(Video::class));
        $this->assertEquals($traits, $videoTraits);
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->video->incrementing);
    }

    public function testDateAttribute()
    {
        $dates = ['created_at', 'updated_at', 'deleted_at'];
        foreach ($dates as $date) {
            $this->assertContains($date, $this->video->getDates());
        }
        $this->assertCount(count($dates), $this->video->getDates());
    }

    public function testCastsAttributes()
    {
        $casts = [
            'id' => 'string',
            'opened' => 'boolean',
            'year_launched' => 'integer',
            'duration' => 'integer'
        ];
        $this->assertEquals($casts, $this->video->getCasts());
    }

    public function testKeyType()
    {
        $keyType = 'string';
        $this->assertEquals($keyType, $this->video->getKeyType());
    }

    public function testCategoriesRelation() 
    {
        $tableName = 'category_video';
        $relation = $this->video->categories();
        $this->assertEquals($tableName, $relation->getTable());
    }

    public function testGenresRelation()
    {
        $tableName = 'genre_video';
        $relation = $this->video->genres();
        $this->assertEquals($tableName, $relation->getTable());
    }
}
