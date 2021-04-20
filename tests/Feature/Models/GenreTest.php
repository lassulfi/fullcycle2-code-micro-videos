<?php

namespace Tests\Feature\Models;

use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class GenreTest extends TestCase
{
    
    use DatabaseMigrations;

    public function testList()
    {
        factory(Genre::class, 1)->create();
        $genres = Genre::all();
        $this->assertCount(1, $genres);

        $genreExpectedKeys = [
            'id',
            'name',
            'is_active',
            'created_at',
            'updated_at',
            'deleted_at'
        ];
        $genreKeys = array_keys($genres->first()->getAttributes());
        $this->assertEqualsCanonicalizing($genreExpectedKeys, $genreKeys);
    }

    public function testCreate()
    {
        $genre = Genre::create([
            'name' => 'test1'
        ]);
        $genre->refresh();

        $this->assertNotNull($genre->id);
        $this->assertIsString($genre->id);
        $this->assertRegExp('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', $genre->id);
        $this->assertEquals('test1', $genre->name);
        $this->assertTrue($genre->is_active);

        $genre = Genre::create([
            'name' => 'test1',
            'is_active' => false
        ]);

        $this->assertFalse($genre->is_active);

        $genre = Genre::create([
            'name' => 'test1',
            'is_active' => true
        ]);

        $this->assertTrue($genre->is_active);
    }

    public function testUpdate()
    {
        $genre = factory(Genre::class)->create([
            'name' => 'test_name',
            'is_active' => false
        ]);

        $genre->update([
            'name' => 'test_name_updated',
            'is_active' => true
        ]);

        $data = [
            'name' => 'test_name_updated',
            'is_active' => true
        ];
        foreach ($data as $key => $value) {
            $this->assertEquals($value, $genre->{$key});
        }   
    }

    public function testDelete()
    {
        $genre = factory(Genre::class, 1)->create()->first();
        $genre->delete();

        $this->assertNotNull($genre->deleted_at);
    }
}
