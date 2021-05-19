<?php

namespace App\Rules;

use App\Models\Category;
use App\Models\Genre;
use Illuminate\Contracts\Validation\Rule;
use Illuminate\Database\Eloquent\Builder;

class RelatesToGenre implements Rule
{
    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct()
    {
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        $isRelated = [];
        if (request()->has('genres_id')) {
            $genresId = request()->get('genres_id');
            foreach ($genresId as $genreId) {
                array_push($isRelated, false);
                /** @var Genre $genre */
                $genre = Genre::find($genreId);
                foreach ($value as $categoryId) {
                    $category = $genre->categories()->find($categoryId);
                    if (is_object($category)) {
                        array_pop($isRelated);
                        array_push($isRelated, true);
                    }
                }
            }
        }
        return in_array(true, $isRelated);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return trans('validation.relates_to_genre');
    }
}
