<?php

namespace App\Models;

use App\ModelFilters\GenreFilter;
use App\Models\Traits\Uuid;
use EloquentFilter\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Genre extends Model
{
    use SoftDeletes, Uuid, Filterable;

    protected $fillable = [
        'name',
        'is_active'
    ];
    protected $dates = ['deleted_at'];
    protected $casts = [
        'id' => 'string',
        'is_active'=>'boolean'
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function categories() {
        return $this->belongsToMany(Category::class)->withTrashed();
    }

    public function modelFilter()
    {
        return $this->provideFilter(GenreFilter::class);
    }
}
