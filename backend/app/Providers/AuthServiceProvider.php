<?php

namespace App\Providers;

use App\Models\Task;
use App\Policies\TaskPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Note: Laravel 11+ auto-discovers policies by naming convention
     * (Task -> TaskPolicy), so this mapping is mostly needed for Laravel 10
     * or if you rename the policy. Safe to keep either way.
     */
    protected $policies = [
        Task::class => TaskPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}
