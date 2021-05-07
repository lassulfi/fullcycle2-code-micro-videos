<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use PhpParser\Node\Expr\Cast;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class CastMemberControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    private $castMember;

    protected function setUp(): void
    {
        parent::setUp();
        $this->castMember = factory(CastMember::class)->create([
            'type' => CastMember::TYPE_DIRECTOR
        ]);
    }

    public function testIndex()
    {
        $response = $this->get(route('cast-members.index'));
        $response
            ->assertStatus(200)
            ->assertJson([$this->castMember->toArray()]);

    }

    public function testShow()
    {
        $response = $this->get(route('cast-members.show', ['cast_member' => $this->castMember->id]));
        $response
            ->assertStatus(200)
            ->assertJson($this->castMember->toArray());
    }

    public function testInvalidationData()
    {
        $data = [
            'name' => '',
            'type' => ''
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');

        $data = [
            'name' => str_repeat('a', 256)
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);

        $data = [
            'type' => 's'
        ];
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');

        $data = [
            'type' => 0
        ];
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');

        $data = [
            'type' => 3
        ];
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');
    }

    public function testStore()
    {
        $data = [
            'name' => 'test',
            'type' => CastMember::TYPE_DIRECTOR,
        ];
        $response = $this->assertStore($data, $data + ['type' => CastMember::TYPE_DIRECTOR, 'deleted_at' => null]);
        $response->assertJsonStructure([
            'created_at', 'updated_at'
        ]);

        $data = [
            'name' => 'test',
            'type' => CastMember::TYPE_ACTOR,
        ];
        $response = $this->assertStore($data, $data + ['type' => CastMember::TYPE_ACTOR]);
    }

    public function testUpdate()
    {
        $this->castMember = factory(CastMember::class)->create([
            'type' => CastMember::TYPE_DIRECTOR
        ]);
        $data = [
            'name' => 'test',
            'type' => CastMember::TYPE_ACTOR
        ];
        $response = $this->assertUpdate($data, $data + ['deleted_at' => null]);
        $response->assertJsonStructure([
            'created_at', 'updated_at'
        ]);
    }

    public function testDestroy()
    {
        $response = $this->assertDestroy($this->castMember->id);
        $response
            ->assertStatus(204)
            ->assertNoContent();
    }

    private function routeStore() 
    {
        return route('cast-members.store');
    }

    private function routeUpdate()
    {
        return route('cast-members.update', $this->castMember->id);
    }

    protected function routeDestroy()
    {
        return route('cast-members.destroy', $this->castMember->id);
    }

    private function model() {
        return CastMember::class;
    }
}
