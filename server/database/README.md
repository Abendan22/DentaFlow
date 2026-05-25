# DentaGlow database

## Import (XAMPP / MySQL)

1. Start MySQL in XAMPP.
2. Create the database (if needed):

```sql
CREATE DATABASE IF NOT EXISTS DentaGlow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Import the dump:

```bash
mysql -u root DentaGlow < database/DentaGlow.sql
```

On Windows with XAMPP:

```bash
C:\xampp\mysql\bin\mysql.exe -u root DentaGlow < database\DentaGlow.sql
```

4. Configure `server/.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=DentaGlow
DB_USERNAME=root
DB_PASSWORD=
```

## Tables (security project)

- **users** — login accounts (`username`, hashed `password`, `role`)
- **logs** — activity records (`user_id`, `activity`, `logged_at` timestamp, `ip_address`)

Default admin (after import): `admin` / `admin123`
