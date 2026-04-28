# Ubuntu Deployment & Data Migration Guide
**MDR System (Material Discrepancy Report)**

This guide provides step-by-step instructions on how to deploy the MDR System onto an Ubuntu Server and migrate your existing data.

---

## Part 1: Exporting Your Existing Data (From Windows)
Before you start the deployment, you need to export your existing database to a file.
1. Open a terminal on your Windows machine.
2. Run the following command to create a backup file:
   ```bash
   mysqldump -u root -proot mdr_system > database_backup.sql
   ```
3. Keep this file ready. You will transfer it to your Ubuntu server later.

---

## Part 2: Preparing the Ubuntu Server
Log into your Ubuntu Server via SSH and install the required dependencies (Git and Docker).

1. Update your package list:
   ```bash
   sudo apt update
   ```
2. Install Git, Docker, and Docker Compose:
   ```bash
   sudo apt install git docker.io docker-compose-v2 -y
   ```
3. Enable and start the Docker service:
   ```bash
   sudo systemctl enable docker
   sudo systemctl start docker
   ```

---

## Part 3: Cloning the Project
Clone your repository directly from GitHub onto the Ubuntu Server.

1. Clone the project (replace with your actual repository link):
   ```bash
   git clone https://github.com/your-username/MDR-Project.git
   ```
2. Enter the project directory:
   ```bash
   cd MDR-Project
   ```

---

## Part 4: Configuring the Environment Variables
Your frontend needs to know the public IP address of your Ubuntu Server so users can connect to the API.

1. Navigate to the frontend directory:
   ```bash
   cd mdr-frontend
   ```
2. Create the `.env` file with your server's IP (replace `YOUR_UBUNTU_IP` with the actual IP address):
   ```bash
   echo "VITE_API_URL=http://YOUR_UBUNTU_IP:5000" > .env
   ```
3. Return to the project root:
   ```bash
   cd ..
   ```

---

## Part 5: Starting the Application
Start the Docker containers. This will build both the frontend and backend, and start the MySQL database.

```bash
sudo docker compose up --build -d
```
*Wait a few minutes for the images to build and the containers to start.*

---

## Part 6: Migrating Your Data to the Server
Now you need to move your `database_backup.sql` from your Windows machine to the Ubuntu Server, and inject it into the Docker database.

1. **On your Windows machine**, transfer the backup file to your Ubuntu Server using SCP:
   ```bash
   scp database_backup.sql ubuntu_username@YOUR_UBUNTU_IP:~/MDR-Project/
   ```

2. **On your Ubuntu Server**, make sure you are in the `MDR-Project` directory, and run this command to inject the data into the database:
   ```bash
   sudo docker exec -i mdr-db mysql -u root -proot mdr_system < database_backup.sql
   ```

---

## Part 7: Ensuring Superadmin Access
If your database migration didn't include the superadmin user, or you are starting fresh, you need to run the seeding script to create the superadmin account so you can log in.

Run this command on your **Ubuntu Server** to create the superadmin user inside the database:
```bash
sudo docker exec mdr-backend node seed_admin.js
```

This will ensure the superadmin account is active with the following credentials:
- **Username:** `superadmin`
- **Password:** `adminpassword`

*(Please remember to change this password after your first login!)*

---

## Congratulations!
Your MDR System is now live and fully populated with your data.
- **Frontend App:** `http://YOUR_UBUNTU_IP:8080`
- **Backend API:** `http://YOUR_UBUNTU_IP:5000`
