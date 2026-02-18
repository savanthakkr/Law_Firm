// components/RolePermissionCheckboxGroup.tsx
import { Checkbox } from '@/components/ui/checkbox';
import { IndeterminateCheckbox } from '@/components/ui/indeterminate-checkbox';
import { Label } from '@/components/ui/label';
import { Ban } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from './ui/card';
import { Input } from './ui/input';

interface Permission {
    id: string | number;
    name: string;
    label: string;
}

interface RolePermissionCheckboxGroupProps {
    permissions: Record<string, any[]>;
    selectedPermissions: any;
    onChange: (permissions: string[]) => void;
}

export function RolePermissionCheckboxGroup({ permissions, selectedPermissions, onChange }: RolePermissionCheckboxGroupProps) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Filter permissions based on search term
    const filteredPermissions = searchTerm
        ? Object.fromEntries(
              Object.entries(permissions)
                  .filter(
                      ([module, modulePermissions]) =>
                          module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          modulePermissions.some((p) => p.label.toLowerCase().includes(searchTerm.toLowerCase())),
                  )
                  .map(([module, modulePermissions]) => [
                      module,
                      modulePermissions.filter(
                          (p) => module.toLowerCase().includes(searchTerm.toLowerCase()) || p.label.toLowerCase().includes(searchTerm.toLowerCase()),
                      ),
                  ]),
          )
        : permissions;

    // Get all permission IDs
    const getAllPermissionIds = (): string[] => {
        const allIds: string[] = [];
        Object.values(filteredPermissions).forEach((group) => {
            group.forEach((permission) => {
                allIds.push(permission.id.toString());
            });
        });
        return allIds;
    };

    // Get all permission IDs for a specific module
    const getModulePermissionIds = (module: string): string[] => {
        return filteredPermissions[module]?.map((permission) => permission.id.toString()) || [];
    };

    // Initialize selected permissions
    useEffect(() => {
        if (!selectedPermissions || Object.keys(filteredPermissions).length === 0) {
            setSelected([]);
            return;
        }

        try {
            const nameMap = {};

            Object.values(filteredPermissions).forEach((group) => {
                group.forEach((permission) => {
                    nameMap[permission.name] = permission.id.toString();
                });
            });

            let processedPermissions: string[] = [];

            if (Array.isArray(selectedPermissions)) {
                processedPermissions = selectedPermissions
                    .map((p) => {
                        if (typeof p === 'object' && p !== null) {
                            if ('id' in p) return p.id.toString();
                            if ('name' in p) return nameMap[p.name] || p.name;
                        }
                        return nameMap[String(p)] || String(p);
                    })
                    .filter(Boolean);
            } else if (typeof selectedPermissions === 'object' && selectedPermissions !== null) {
                if ('permissions' in selectedPermissions && Array.isArray(selectedPermissions.permissions)) {
                    processedPermissions = selectedPermissions.permissions
                        .map((p) => {
                            if (typeof p === 'object' && p !== null) {
                                if ('id' in p) return p.id.toString();
                                if ('name' in p) return nameMap[p.name] || p.name;
                            }
                            return nameMap[String(p)] || String(p);
                        })
                        .filter(Boolean);
                }
            }

            setSelected(processedPermissions);
        } catch (error) {
            console.error('Error processing permissions:', error);
            setSelected([]);
        }
    }, [selectedPermissions]);

    const handlePermissionChange = (permissionId: string, checked: boolean) => {
        const newSelected = checked ? [...selected, permissionId] : selected.filter((id) => id !== permissionId);

        setSelected(newSelected);
        updateParent(newSelected);
    };

    const handleModuleChange = (module: string, checked: boolean) => {
        const modulePermissionIds = getModulePermissionIds(module);

        let newSelected: string[];

        if (checked) {
            const permissionsToAdd = modulePermissionIds.filter((id) => !selected.includes(id));
            newSelected = [...selected, ...permissionsToAdd];
        } else {
            newSelected = selected.filter((id) => !modulePermissionIds.includes(id));
        }

        setSelected(newSelected);
        updateParent(newSelected);
    };

    const handleSelectAll = (checked: boolean) => {
        let newSelected: string[];
        if (checked) {
            const allIds = getAllPermissionIds();
            const manageAnyIds = getManageAnyPermissionIds();
            const manageOwnIds = getManageOwnPermissionIds();
            newSelected = allIds.filter((id) => !manageAnyIds.includes(id) && !manageOwnIds.includes(id));
        } else {
            newSelected = [];
        }
        setSelected(newSelected);
        updateParent(newSelected);
    };

    // Get all manage-any permission IDs
    const getManageAnyPermissionIds = (): string[] => {
        const allIds: string[] = [];
        Object.values(filteredPermissions).forEach((group) => {
            group.forEach((permission) => {
                if (permission.name.includes('manage-any-')) {
                    allIds.push(permission.id.toString());
                }
            });
        });
        return allIds;
    };

    // Get all manage-own permission IDs
    const getManageOwnPermissionIds = (): string[] => {
        const allIds: string[] = [];
        Object.values(filteredPermissions).forEach((group) => {
            group.forEach((permission) => {
                if (permission.name.includes('manage-own-')) {
                    allIds.push(permission.id.toString());
                }
            });
        });
        return allIds;
    };

    const handleSelectAllManageAny = (checked: boolean) => {
        const manageAnyIds = getManageAnyPermissionIds();
        let newSelected: string[];

        if (checked) {
            // Get corresponding manage- module permissions for each manage-any- permission
            const modulePermissionIds: string[] = [];
            Object.values(filteredPermissions).forEach((group) => {
                group.forEach((permission) => {
                    if (manageAnyIds.includes(permission.id.toString())) {
                        // Extract module name from manage-any-{module} and find manage-{module}
                        const moduleName = permission.name.replace('manage-any-', '');
                        const baseManagePermission = group.find((p) => p.name === `manage-${moduleName}`);
                        if (baseManagePermission) {
                            modulePermissionIds.push(baseManagePermission.id.toString());
                        }
                    }
                });
            });

            newSelected = [...selected];
            // Add manage-any permissions
            const manageAnyToAdd = manageAnyIds.filter((id) => !newSelected.includes(id));
            newSelected = [...newSelected, ...manageAnyToAdd];
            // Add base manage- module permissions
            const moduleToAdd = modulePermissionIds.filter((id) => !newSelected.includes(id));
            newSelected = [...newSelected, ...moduleToAdd];
        } else {
            // Get corresponding manage- module permissions to uncheck
            const modulePermissionIds: string[] = [];
            Object.values(filteredPermissions).forEach((group) => {
                group.forEach((permission) => {
                    if (manageAnyIds.includes(permission.id.toString())) {
                        const moduleName = permission.name.replace('manage-any-', '');
                        const baseManagePermission = group.find((p) => p.name === `manage-${moduleName}`);
                        if (baseManagePermission) {
                            modulePermissionIds.push(baseManagePermission.id.toString());
                        }
                    }
                });
            });

            newSelected = selected.filter((id) => !manageAnyIds.includes(id) && !modulePermissionIds.includes(id));
        }

        setSelected(newSelected);
        updateParent(newSelected);
    };

    const handleSelectAllManageOwn = (checked: boolean) => {
        const manageOwnIds = getManageOwnPermissionIds();
        let newSelected: string[];

        if (checked) {
            // Get corresponding manage- module permissions for each manage-own- permission
            const modulePermissionIds: string[] = [];
            Object.values(filteredPermissions).forEach((group) => {
                group.forEach((permission) => {
                    if (manageOwnIds.includes(permission.id.toString())) {
                        const moduleName = permission.name.replace('manage-own-', '');
                        const baseManagePermission = group.find((p) => p.name === `manage-${moduleName}`);
                        if (baseManagePermission) {
                            modulePermissionIds.push(baseManagePermission.id.toString());
                        }
                    }
                });
            });

            newSelected = [...selected];
            const manageOwnToAdd = manageOwnIds.filter((id) => !newSelected.includes(id));
            newSelected = [...newSelected, ...manageOwnToAdd];
            const moduleToAdd = modulePermissionIds.filter((id) => !newSelected.includes(id));
            newSelected = [...newSelected, ...moduleToAdd];
        } else {
            // Get corresponding manage- module permissions to uncheck
            const modulePermissionIds: string[] = [];
            Object.values(filteredPermissions).forEach((group) => {
                group.forEach((permission) => {
                    if (manageOwnIds.includes(permission.id.toString())) {
                        const moduleName = permission.name.replace('manage-own-', '');
                        const baseManagePermission = group.find((p) => p.name === `manage-${moduleName}`);
                        if (baseManagePermission) {
                            modulePermissionIds.push(baseManagePermission.id.toString());
                        }
                    }
                });
            });

            newSelected = selected.filter((id) => !manageOwnIds.includes(id) && !modulePermissionIds.includes(id));
        }

        setSelected(newSelected);
        updateParent(newSelected);
    };

    const updateParent = (newSelected: string[]) => {
        const idToNameMap = {};

        // Use original permissions, not filtered ones
        Object.values(permissions).forEach((group) => {
            group.forEach((permission) => {
                idToNameMap[permission.id.toString()] = permission.name;
            });
        });

        const permissionNames = newSelected
            .map((id) => {
                return idToNameMap[id] || id;
            })
            .filter((name) => !!name);

        onChange(permissionNames);
    };

    // Check if all permissions are selected (excluding manage-any and manage-own)
    const isAllSelected = (() => {
        const allIds = getAllPermissionIds();
        const manageAnyIds = getManageAnyPermissionIds();
        const manageOwnIds = getManageOwnPermissionIds();
        const nonManageIds = allIds.filter((id) => !manageAnyIds.includes(id) && !manageOwnIds.includes(id));
        return nonManageIds.every((id) => selected.includes(id)) && nonManageIds.length > 0;
    })();

    // Check if all manage-any permissions are selected
    const isAllManageAnySelected = (): boolean => {
        const manageAnyIds = getManageAnyPermissionIds();
        return manageAnyIds.every((id) => selected.includes(id)) && manageAnyIds.length > 0;
    };

    // Check if all manage-own permissions are selected
    const isAllManageOwnSelected = (): boolean => {
        const manageOwnIds = getManageOwnPermissionIds();
        return manageOwnIds.every((id) => selected.includes(id)) && manageOwnIds.length > 0;
    };

    // Check if all permissions in a module are selected
    const isModuleSelected = (module: string): boolean => {
        const modulePermissionIds = getModulePermissionIds(module);
        return modulePermissionIds.every((id) => selected.includes(id)) && modulePermissionIds.length > 0;
    };

    // Check if some but not all permissions in a module are selected
    const isModuleIndeterminate = (module: string): boolean => {
        const modulePermissionIds = getModulePermissionIds(module);
        const selectedCount = modulePermissionIds.filter((id) => selected.includes(id)).length;
        return selectedCount > 0 && selectedCount < modulePermissionIds.length;
    };

    return (
        <div className="space-y-6">
            {/* Select All Checkboxes */}
            <div className="space-y-3">
                {/* Select All Permissions */}
                <div className="rounded border bg-gray-50 p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <IndeterminateCheckbox
                                id="select-all-permissions-checkbox"
                                checked={isAllSelected}
                                onCheckedChange={(checked) => handleSelectAll(checked === true)}
                            />
                            <Label htmlFor="select-all-permissions-checkbox" className="font-medium">
                                {t('Select All Permissions')}
                            </Label>
                        </div>
                        <div className="text-xs text-gray-500">
                            {selected.length} {t('of')} {getAllPermissionIds().length} {t('selected')}
                        </div>
                    </div>
                </div>

                {/* Select All Manage-Any and Manage-Own */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded border bg-blue-50 p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <IndeterminateCheckbox
                                    id="select-all-manage-any-checkbox"
                                    checked={isAllManageAnySelected()}
                                    onCheckedChange={(checked) => handleSelectAllManageAny(checked === true)}
                                />
                                <Label htmlFor="select-all-manage-any-checkbox" className="font-medium text-blue-700">
                                    {t('Select All (Manage-All)')}
                                </Label>
                            </div>
                            <div className="text-xs text-blue-600">
                                {getManageAnyPermissionIds().filter((id) => selected.includes(id)).length} {t('of')}{' '}
                                {getManageAnyPermissionIds().length}
                            </div>
                        </div>
                    </div>

                    <div className="rounded border bg-green-50 p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <IndeterminateCheckbox
                                    id="select-all-manage-own-checkbox"
                                    checked={isAllManageOwnSelected()}
                                    onCheckedChange={(checked) => handleSelectAllManageOwn(checked === true)}
                                />
                                <Label htmlFor="select-all-manage-own-checkbox" className="font-medium text-green-700">
                                    {t('Select All (Manage-Own)')}
                                </Label>
                            </div>
                            <div className="text-xs text-green-600">
                                {getManageOwnPermissionIds().filter((id) => selected.includes(id)).length} {t('of')}{' '}
                                {getManageOwnPermissionIds().length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Box */}
            <div className="mb-4 flex items-center gap-4">
                <label className="whitespace-nowrap">Search:</label>
                <Input
                    type="text"
                    placeholder="Search modules or permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                />
            </div>

            {/* Module Permissions */}
            <div className="space-y-6">
                {Object.entries(filteredPermissions).length > 0 ? (
                    Object.entries(filteredPermissions).map(([module, modulePermissions]) => (
                        <div key={module} className="rounded border shadow-sm">
                            {/* Module Header */}
                            <div className="flex items-center justify-between border-b bg-gray-50 p-3">
                                <div className="flex items-center space-x-2">
                                    <IndeterminateCheckbox
                                        id={`module-checkbox-${module.replace(/\s+/g, '-').toLowerCase()}`}
                                        checked={isModuleSelected(module)}
                                        indeterminate={isModuleIndeterminate(module)}
                                        onCheckedChange={(checked) => handleModuleChange(module, checked === true)}
                                    />
                                    <Label htmlFor={`module-checkbox-${module.replace(/\s+/g, '-').toLowerCase()}`} className="font-medium">
                                        {module.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Label>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {modulePermissions.filter((p) => selected.includes(p.id.toString())).length} of {modulePermissions.length}{' '}
                                    {t('selected')}
                                </div>
                            </div>

                            {/* Individual Permissions */}
                            <div className="p-3">
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {modulePermissions.map((permission) => (
                                        <div key={permission.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`permission-checkbox-${permission.id.toString().replace(/\s+/g, '-').toLowerCase()}`}
                                                checked={selected.includes(permission.id.toString()) || selected.includes(permission.name)}
                                                onCheckedChange={(checked) => handlePermissionChange(permission.id.toString(), checked === true)}
                                            />
                                            <Label
                                                htmlFor={`permission-checkbox-${permission.id.toString().replace(/\s+/g, '-').toLowerCase()}`}
                                                className="truncate text-sm"
                                            >
                                                {permission.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <Card className="p-8 text-center">
                        <div className="flex flex-col items-center space-y-3">
                            <Ban className="h-12 w-12 text-gray-400" />
                            <p className="font-medium text-gray-500">{t('No permissions found')}</p>
                            <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
