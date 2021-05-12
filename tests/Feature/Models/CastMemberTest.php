<?php

namespace Tests\Feature\Models;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CastMemberTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(CastMember::class, 1)->create();
        $castMembers = CastMember::all();
        $this->assertCount(1, $castMembers);

        $castMemberKeys = array_keys($castMembers->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id',
            'name',
            'type',
            'created_at',
            'updated_at',
            'deleted_at'
        ], $castMemberKeys);
    }

    public function testCreate()
    {
        $castMember = CastMember::create([
            'name' => 'test',
            'type' => CastMember::TYPE_DIRECTOR
        ]);
        $this->assertNotNull($castMember->id);
        $this->assertIsString($castMember->id);
        $this->assertRegExp('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/', $castMember->id);
        $this->assertEquals('test', $castMember->name);
        $this->assertEquals(CastMember::TYPE_DIRECTOR, $castMember->type);

        $castMember = CastMember::create([
            'name' => 'test',
            'type' => CastMember::TYPE_ACTOR
        ]);
        $this->assertEquals(CastMember::TYPE_ACTOR, $castMember->type);
    }

    public function testUpdate()
    {
        $castMember = factory(CastMember::class)->create([
            'name' => 'test',
            'type' => CastMember::TYPE_DIRECTOR
        ]);

        $castMember->update([
            'name' => 'test upate',
            'type' => CastMember::TYPE_ACTOR
        ]);

        $data = [
            'name' => 'test upate',
            'type' => CastMember::TYPE_ACTOR
        ];

        foreach ($data as $key => $value) {
            $this->assertEquals($value, $castMember->{$key});
        }
    }

    public function testDelete()
    {
        $castMember = factory(CastMember::class)->create()->first();
        $castMember->delete();

        $this->assertNotNull($castMember->deleted_at);
    }
}
