package com.synccore.config;

import com.synccore.entity.*;
import com.synccore.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Runs once at start-up and inserts demo data if the database is empty. */
@Component
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository users;
    private final EmployeeRepository employees;
    private final SupplierRepository suppliers;
    private final ProductRepository products;
    private final InventoryRepository inventory;
    private final CustomerRepository customers;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository users, EmployeeRepository employees, SupplierRepository suppliers,
                      ProductRepository products, InventoryRepository inventory, CustomerRepository customers,
                      PasswordEncoder encoder) {
        this.users = users; this.employees = employees; this.suppliers = suppliers;
        this.products = products; this.inventory = inventory; this.customers = customers; this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (users.count() > 0) return;

        employee("admin", "admin123", Role.ADMIN, "Vignesh K", "Store Manager");
        employee("staff", "staff123", Role.EMPLOYEE, "Anita Rao", "Sales Executive");

        Supplier s1 = supplier("Metro Wholesale Traders", "Ravi Shah", "9820011122", "ravi@metrowholesale.in");
        Supplier s2 = supplier("Bright Office Supplies", "Meera Nair", "9820033344", "meera@brightoffice.in");

        product("Wireless Mouse", "Electronics", "ELE-001", "599.00", s1, 40, 10);
        product("A4 Paper Ream (500)", "Stationery", "STA-001", "289.00", s2, 120, 30);
        product("Ballpoint Pens (Box of 50)", "Stationery", "STA-002", "245.00", s2, 8, 15); // starts as low stock
        product("USB-C Charger 30W", "Electronics", "ELE-002", "899.00", s1, 25, 10);

        customer("Sharma Traders", "accounts@sharmatraders.in", "9867001100", "Andheri East, Mumbai");
        customer("Kulkarni & Sons", "orders@kulkarniandsons.in", "9867002200", "Dadar, Mumbai");
        log.info("Demo data created. Login with admin/admin123 or staff/staff123");
    }

    private void employee(String username, String rawPassword, Role role, String name, String designation) {
        User u = new User();
        u.setUsername(username);
        u.setPasswordHash(encoder.encode(rawPassword));
        u.setRole(role);
        users.save(u);
        Employee e = new Employee();
        e.setUser(u); e.setFullName(name); e.setDesignation(designation); e.setHireDate(LocalDate.now().minusYears(1));
        employees.save(e);
    }

    private Supplier supplier(String name, String contact, String phone, String email) {
        Supplier s = new Supplier();
        s.setName(name); s.setContactPerson(contact); s.setPhone(phone); s.setEmail(email);
        return suppliers.save(s);
    }

    private void product(String name, String category, String sku, String price, Supplier s, int qty, int reorder) {
        Product p = new Product();
        p.setName(name); p.setCategory(category); p.setSku(sku); p.setUnitPrice(new BigDecimal(price)); p.setSupplier(s);
        products.save(p);
        Inventory inv = new Inventory();
        inv.setProduct(p); inv.setQuantity(qty); inv.setReorderLevel(reorder);
        inventory.save(inv);
    }

    private void customer(String name, String email, String phone, String address) {
        Customer c = new Customer();
        c.setName(name); c.setEmail(email); c.setPhone(phone); c.setAddress(address);
        customers.save(c);
    }
}
