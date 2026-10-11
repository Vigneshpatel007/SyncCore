import CrudPage from '../components/CrudPage';
import { formatDate } from '../utils/format';

export default function Employees() {
  return (
    <CrudPage
      title="Employees" noun="employee" endpoint="/employees"
      subtitle="Staff profiles and their login roles."
      adminOnlyDelete={false}
      columns={[
        { key: 'fullName', label: 'Name' },
        { key: 'designation', label: 'Designation' },
        { label: 'Username', render: (r) => r.user?.username },
        { label: 'Role', render: (r) => <span className={`chip chip-${r.user?.role === 'ADMIN' ? 'admin' : 'staff'}`}>{r.user?.role === 'ADMIN' ? 'Admin' : 'Employee'}</span> },
        { label: 'Hired', render: (r) => formatDate(r.hireDate) },
      ]}
      fields={[
        { name: 'fullName', label: 'Full name', required: true },
        { name: 'designation', label: 'Designation', placeholder: 'Manager, Sales Executive, Clerk…' },
        { name: 'hireDate', label: 'Hire date', type: 'date' },
        { name: 'username', label: 'Username', required: true, editable: false },
        { name: 'password', label: 'Password', type: 'password', requiredOnCreate: true, hint: 'Leave empty when editing to keep the current password.' },
        { name: 'role', label: 'Role', type: 'select', required: true, placeholder: 'Choose a role',
          options: [{ value: 'EMPLOYEE', label: 'Employee' }, { value: 'ADMIN', label: 'Administrator' }] },
      ]}
      toForm={(r) => ({ fullName: r.fullName, designation: r.designation ?? '', hireDate: r.hireDate ?? '',
                        username: r.user?.username ?? '', password: '', role: r.user?.role ?? '' })}
    />
  );
}
