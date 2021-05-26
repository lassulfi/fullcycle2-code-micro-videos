<?php

namespace Tests\Stubs\Models;

use App\Models\Traits\UploadFiles;
use Illuminate\Database\Eloquent\Model;

class UploadFileStub extends Model
{
    use UploadFiles;

    public static $fileFields = ['file1', 'file2'];

    protected function uploadDir()
    {
        return "1";
    }
}