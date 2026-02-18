<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Model;

class BaseModel extends Model
{
    use AutoApplyPermissionCheck;
    
    /**
     * Scope a query to apply permission-based filtering
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithPermissionCheck($query)
    {
        $moduleName = method_exists($this, 'getPermissionModule') 
            ? $this->getPermissionModule() 
            : $this->getTable();
        return $this->applyPermissionScope($query, $moduleName);
    }
}