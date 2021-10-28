<?php

namespace Tests\Unit\Models;

use App\Models\Category;
use Tests\TestCase;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\Uuid;
// Better PHPUnit => VSCode Extension
// Laravel Wire | inertiajs
class CategoryUnitTest extends TestCase
{
    private $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->category = new Category();
    }

    public function testFillableAttribute()
    {
        $fillable = ['name', 'description', 'is_active'];
        $this->assertEquals($fillable, $this->category->getFillable());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class, Uuid::class, Filterable::class
        ];
        $categoryTraits = array_keys(class_uses(Category::class));
        $this->assertEquals($traits, $categoryTraits);
    }

    public function testKeyTypeAttribute()
    {
        $keyType = 'string';
        $this->assertEquals($keyType, $this->category->getKeyType());
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->category->incrementing);
    }

    public function testDatesAttribute()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];
        foreach ($dates as $date) {
            $this->assertContains($date, $this->category->getDates());
        }
        $this->assertCount(count($dates), $this->category->getDates());
    }

    public function testCastsAttribute()
    {
        $casts = [
            'id' => 'string',
            'is_active'=>'boolean'
        ];
        $this->assertEquals($casts, $this->category->getCasts());
    }
}
