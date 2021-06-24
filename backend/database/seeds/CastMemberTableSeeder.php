<?php

use App\Models\CastMember;
use Illuminate\Database\Seeder;

class CastMemberTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        factory(CastMember::class, 100)->create();
    }
}
