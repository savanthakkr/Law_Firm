<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DirectoryController extends Controller
{
    /**
     * Display the business directory page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('directory/index');
    }
}