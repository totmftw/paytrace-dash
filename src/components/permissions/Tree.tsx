interface Permission {
  id: string;
  name: string;
  children?: Permission[];
}

interface TreeProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onToggle: (id: string) => void;
}

export function Tree({ permissions, selectedPermissions, onToggle }: TreeProps) {
  return (
    <ul>
      {permissions.map((permission) => (
        <li key={permission.id}>
          <label>
            <input
              type="checkbox"
              checked={selectedPermissions.includes(permission.id)}
              onChange={() => onToggle(permission.id)}
            />
            {permission.name}
          </label>
          {permission.children && (
            <Tree 
              permissions={permission.children} 
              selectedPermissions={selectedPermissions}
              onToggle={onToggle} 
            />
          )}
        </li>
      ))}
    </ul>
  );
}