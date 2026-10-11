import CrudPage from '../components/CrudPage';

export default function Suppliers() {
  return (
    <CrudPage
      title="Suppliers" noun="supplier" endpoint="/suppliers"
      subtitle="Who provides your products."
      columns={[
        { key: 'name', label: 'Supplier' },
        { key: 'contactPerson', label: 'Contact person' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
      ]}
      fields={[
        { name: 'name', label: 'Supplier name', required: true },
        { name: 'contactPerson', label: 'Contact person' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email', type: 'email' },
      ]}
      toForm={(r) => ({ name: r.name, contactPerson: r.contactPerson ?? '', phone: r.phone ?? '', email: r.email ?? '' })}
    />
  );
}
