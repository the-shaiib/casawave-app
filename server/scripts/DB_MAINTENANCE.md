# Product Database Maintenance

Run these commands from `server/` and make sure `MONGO_URI` points to the database you want to edit.

## 1) List products (verify current DB target)

```bash
npm run db:products:list
```

## 2) Repair legacy product data (sizes/images normalization)

```bash
npm run db:products:repair
```

## 3) Purge all products (destructive)

```bash
CONFIRM_PURGE_PRODUCTS=YES_DELETE_ALL_PRODUCTS npm run db:products:purge
```

If you want to fix Render data specifically, run these commands in Render shell (or any environment that uses the same `MONGO_URI` as Render).
