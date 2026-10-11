import CrudPage from '../components/CrudPage';

export default function Customers() {
  return (
    <CrudPage
      title="Customers" noun="customer" endpoint="/customers"
      subtitle="People and businesses you sell to."
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'address', label: 'Address' },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone' },
        { name: 'address', label: 'Address' },
      ]}
      toForm={(r) => ({ name: r.name, email: r.email ?? '', phone: r.phone ?? '', address: r.address ?? '' })}
    />
  );
}
