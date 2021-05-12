<?php

namespace Tests\Unit\Models;

use App\Models\Traits\Uuid;
use App\Models\CastMember;
use PHPUnit\Framework\TestCase;
use Illuminate\Database\Eloquent\SoftDeletes;

class CastMemberUnitTest extends TestCase
{
    private $castMember;

    protected function setUp(): void
    {
        parent::setUp();
        $this->castMember = new CastMember();
    }

    public function testConstantsTypes()
    {
        $this->assertEquals(1, CastMember::TYPE_DIRECTOR);
        $this->assertEquals(2, CastMember::TYPE_ACTOR);
    }
    
    public function testFillableAttributes()
    {
        $fillable = ['name', 'type'];
        $this->assertEquals($fillable, $this->castMember->getFillable());
    }

    public function testIfUsesTraits()
    {
        $traits = [
            SoftDeletes::class, Uuid::class
        ];
        $castMemberTraits = array_keys(class_uses(CastMember::class));
        $this->assertEquals($traits, $castMemberTraits);
    }

    public function testKeyTypeAttribute()
    {
        $keyType = 'string';
        $this->assertEquals($keyType, $this->castMember->getKeyType());
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->castMember->incrementing);
    }

    public function testDateAttribute()
    {
        $dates = ['created_at', 'updated_at', 'deleted_at'];
        foreach ($dates as $date) {
            $this->assertContains($date, $this->castMember->getDates());
        }
        $this->assertCount(count($dates), $this->castMember->getDates());
    }

    public function testCastsAttributes()
    {
        $casts = [
            'id' => 'string',
            'type' => 'integer'
        ];
        $this->assertEquals($casts, $this->castMember->getCasts());
    }
}
