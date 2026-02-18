<?php

namespace App\Http\Controllers;

use App\Models\MediaItem;
use App\Models\User;
use App\Services\StorageConfigService;
use App\Services\DynamicStorageService;
use Illuminate\Http\Request;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
class MediaController extends BaseController
{
    public function index()
    {
        // Check if demo mode is enabled
        if (env('IS_DEMO', false)) {
            return $this->getDemoMedia();
        }
        
        $user = auth()->user();
        $mediaItems = MediaItem::withPermissionCheck()->with('media')->latest()->get();
        
        $media = $mediaItems->flatMap(function ($item) use ($user) {
            $mediaQuery = $item->getMedia('files');

            // SuperAdmin can see all media
            if ($user->type === 'superadmin') {
                // No user_id filter for superadmin
            }
            // Users with manage-any-media can see all media
            elseif ($user->hasPermissionTo('manage-any-media')) {
                // No user_id filter for manage-any-media
            }
            // Others can only see their own media
            // else {
            $mediaQuery = $mediaQuery->where('user_id', $user->id);
            // }
            return $mediaQuery->map(function ($media) {
                try {
                    $originalUrl = $this->getFullUrl($media->getUrl());
                    $thumbUrl = $originalUrl;

                    try {
                        $thumbUrl = $this->getFullUrl($media->getUrl('thumb'));
                    } catch (\Exception $e) {
                        // If thumb conversion fails, use original
                    }

                    return [
                        'id' => $media->id,
                        'name' => $media->name,
                        'file_name' => $media->file_name,
                        'url' => $originalUrl,
                        'thumb_url' => $thumbUrl,
                        'size' => $media->size,
                        'mime_type' => $media->mime_type,
                        'user_id' => $media->user_id,
                        'created_at' => $media->created_at,
                    ];
                } catch (\Exception $e) {
                    // Skip media files with unavailable storage disks
                    return null;
                }
            })->filter(); // Remove null entries
        });

        return response()->json($media);
    }

    private function getDemoMedia()
    {
        $demoImages = [
            'a-advocate-saas-pic.png',
            'b-advocate-saas-pic.png',
            'c-advocate-saas-pic.png',
            'd-advocate-saas-pic.png',
            'e-advocate-saas-pic.png',
            'f-advocate-saas-pic.png',
            'g-advocate-saas-pic.png',
            'h-advocate-saas-pic.png',
            'i-advocate-saas-pic.png',
            'j-advocate-saas-pic.png',
            'k-advocate-saas-pic.png',
        ];

        $media = [];
        $baseUrl = request()->getSchemeAndHttpHost();

        foreach ($demoImages as $index => $image) {
            if (file_exists(public_path('DemoMedia/' . $image))) {
                $media[] = [
                    'id' => $index + 1,
                    'name' => $this->getDemoImageName($image),
                    'file_name' => $image,
                    'url' => config('app.url') . '/public/DemoMedia/' . $image,
                    'thumb_url' => config('app.url') . '/public/DemoMedia/' . $image,
                    'size' => filesize(public_path('DemoMedia/' . $image)),
                    'mime_type' => 'image/png',
                    'user_id' => 1,
                    'created_at' => now(),
                ];
            }
        }

        return response()->json($media);
    }

    private function getDemoImageName($filename)
    {
        $names = [
            'a-advocate-saas-pic.png' => 'a-advocate-saas-pic.png',
            'b-advocate-saas-pic.png' => 'b-advocate-saas-pic.png',
            'c-advocate-saas-pic.png' => 'c-advocate-saas-pic.png',
            'd-advocate-saas-pic.png' => 'd-advocate-saas-pic.png',
            'e-advocate-saas-pic.png' => 'e-advocate-saas-pic.png',
            'f-advocate-saas-pic.png' => 'f-advocate-saas-pic.png',
            'g-advocate-saas-pic.png' => 'g-advocate-saas-pic.png',
            'h-advocate-saas-pic.png' => 'h-advocate-saas-pic.png',
            'i-advocate-saas-pic.png' => 'i-advocate-saas-pic.png',
            'j-advocate-saas-pic.png' => 'j-advocate-saas-pic.png',
            'k-advocate-saas-pic.png' => 'k-advocate-saas-pic.png',
        ];

        return $names[$filename] ?? pathinfo($filename, PATHINFO_FILENAME);
    }

    private function getFullUrl($url)
    {
        if (str_starts_with($url, 'http')) {
            return $url;
        }

        $baseUrl = request()->getSchemeAndHttpHost();
        return $baseUrl . $url;
    }

    private function getUserFriendlyError(\Exception $e, $fileName): string
    {
        $message = $e->getMessage();
        $extension = strtoupper(pathinfo($fileName, PATHINFO_EXTENSION));

        // Handle media library collection errors
        if (str_contains($message, 'was not accepted into the collection')) {
            if (str_contains($message, 'mime:')) {
                return __("File type not allowed : :extension", ['extension' => $extension]);
            }
            return __("File format not supported : :extension", ['extension' => $extension]);
        }

        // Handle storage errors
        if (str_contains($message, 'storage') || str_contains($message, 'disk')) {
            return __("Storage error : :extension", ['extension' => $extension]);
        }

        // Handle file size errors
        if (str_contains($message, 'size') || str_contains($message, 'large')) {
            return __("File too large : :extension", ['extension' => $extension]);
        }

        // Handle permission errors
        if (str_contains($message, 'permission') || str_contains($message, 'denied')) {
            return __("Permission denied : :extension", ['extension' => $extension]);
        }

        // Generic fallback
        return __("Upload failed : :extension", ['extension' => $extension]);
    }

    public function batchStore(Request $request)
    {
        // Check storage limits
        $storageCheck = $this->checkStorageLimit($request->file('files'));
        if ($storageCheck) {
            return $storageCheck;
        }

        $config = StorageConfigService::getStorageConfig();
        $allowedTypes = explode(',', $config['allowed_file_types'] ?? 'jpg,png,webp,gif');
        $maxSize = ($config['max_file_size_mb'] ?? 2) * 1024 * 1024; // Convert to bytes

        // Manual file validation
        $errors = [];
        foreach ($request->file('files') as $file) {
            $extension = strtolower($file->getClientOriginalExtension());
            $fileSize = $file->getSize();

            if (!in_array($extension, array_map('trim', $allowedTypes))) {
                $errors[] = __('File type not allowed: :name (:ext). Allowed types: :types', [
                    'name' => $file->getClientOriginalName(),
                    'ext' => strtoupper($extension),
                    'types' => strtoupper(implode(', ', $allowedTypes))
                ]);
            }

            if ($fileSize > $maxSize) {
                $errors[] = __('File too large: :name (:size). Max size: :max MB', [
                    'name' => $file->getClientOriginalName(),
                    'size' => round($fileSize / 1024 / 1024, 2) . 'MB',
                    'max' => $config['max_file_size_mb']
                ]);
            }
        }

        if (!empty($errors)) {
            return response()->json([
                'message' => __('File validation failed'),
                'errors' => $errors
            ], 422);
        }

        $uploadedMedia = [];
        $errors = [];

        foreach ($request->file('files') as $file) {
            try {
                $mediaItem = MediaItem::create([
                    'name' => $file->getClientOriginalName(),
                ]);

                $media = $mediaItem->addMedia($file)
                    ->toMediaCollection('files');

                $media->user_id = auth()->id();
                $media->save();

                // Update user storage usage
                $this->updateStorageUsage(auth()->user(), $media->size);

                // Force thumbnail generationAdd commentMore actions
                try {
                    $media->getUrl('thumb');
                } catch (\Exception $e) {
                    // Thumbnail generation failed, but continue
                }

                $originalUrl = $this->getFullUrl($media->getUrl());
                $thumbUrl = $originalUrl; // Default to original

                try {
                    $thumbUrl = $this->getFullUrl($media->getUrl('thumb'));
                } catch (\Exception $e) {
                    // If thumb conversion fails, use original

                }
                $uploadedMedia[] = [
                    'id' => $media->id,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'url' => $originalUrl,
                    'thumb_url' => $thumbUrl,
                    'size' => $media->size,
                    'mime_type' => $media->mime_type,
                    'user_id' => $media->user_id,
                    'created_at' => $media->created_at,
                ];
            } catch (\Exception $e) {
                if (isset($mediaItem)) {
                    $mediaItem->delete();
                }
                $errors[] = [
                    'file' => $file->getClientOriginalName(),
                    'error' => $this->getUserFriendlyError($e, $file->getClientOriginalName())
                ];
            }
        }

        if (count($uploadedMedia) > 0 && empty($errors)) {
            return response()->json([
                'message' => count($uploadedMedia) . __(' file(s) uploaded successfully'),
                'data' => $uploadedMedia
            ]);
        } elseif (count($uploadedMedia) > 0 && !empty($errors)) {
            return response()->json([
                'message' => count($uploadedMedia) . ' uploaded, ' . count($errors) . ' failed',
                'data' => $uploadedMedia,
                'errors' => array_column($errors, 'error')
            ]);
        } else {
            return response()->json([
                'message' => 'Upload failed',
                'errors' => array_column($errors, 'error')
            ], 422);
        }
    }

    public function download($id)
    {
        $user = auth()->user();
        $query = Media::where('id', $id);

        // SuperAdmin and users with manage-any-media can download any media
        if ($user->type !== 'superadmin' && !$user->hasPermissionTo('manage-any-media')) {
            $query->where('user_id', $user->id);
        }

        $media = $query->firstOrFail();

        try {
            $filePath = $media->getPath();

            if (!file_exists($filePath)) {
                abort(404, __('File not found'));
            }

            return response()->download($filePath, $media->file_name);
        } catch (\Exception $e) {
            abort(404, __('File storage unavailable'));
        }
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $query = Media::where('id', $id);

        // SuperAdmin and users with manage-any-media can delete any media
        if ($user->type !== 'superadmin' && !$user->hasPermissionTo('manage-any-media')) {
            $query->where('user_id', $user->id);
        }

        $media = $query->firstOrFail();
        $mediaItem = $media->model;

        $fileSize = $media->size;

        try {
            $media->delete();
        } catch (\Exception $e) {
            // If storage disk is unavailable, force delete from database
            $media->forceDelete();
        }

        // Update user storage usage
        $this->updateStorageUsage(auth()->user(), -$fileSize);

        // Delete the MediaItem if it has no more media files
        if ($mediaItem && $mediaItem->getMedia()->count() === 0) {
            $mediaItem->delete();
        }

        return response()->json(['message' => __('Media deleted successfully')]);
    }

    private function checkStorageLimit($files)
    {
        $user = auth()->user();
        if ($user->type === 'superadmin') return null;

        $limit = $this->getUserStorageLimit($user);
        if (!$limit) return null;

        $uploadSize = collect($files)->sum('size');
        $currentUsage = $this->getUserStorageUsage($user);

        if (($currentUsage + $uploadSize) > $limit) {
            return response()->json([
                'message' => __('Storage limit exceeded'),
                'errors' => [__('Please delete files or upgrade plan')]
            ], 422);
        }

        return null;
    }

    private function getUserStorageLimit($user)
    {
        if ($user->type === 'company' && $user->plan) {
            return $user->plan->storage_limit * 1024 * 1024;
        }

        if ($user->created_by) {
            $company = User::find($user->created_by);
            if ($company && $company->plan) {
                return $company->plan->storage_limit * 1024 * 1024;
            }
        }

        return null;
    }

    private function getUserStorageUsage($user)
    {
        if ($user->type === 'company') {
            return User::where('created_by', $user->id)
                ->orWhere('id', $user->id)
                ->sum('storage_limit');
        }

        if ($user->created_by) {
            $company = User::find($user->created_by);
            if ($company) {
                return User::where('created_by', $company->id)
                    ->orWhere('id', $company->id)
                    ->sum('storage_limit');
            }
        }

        return $user->storage_limit;
    }

    private function updateStorageUsage($user, $size)
    {
        $user->increment('storage_limit', $size);
    }
}
