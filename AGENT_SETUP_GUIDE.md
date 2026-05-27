# BestBill POS - Local Print Agent Setup & Onboarding Guide

This document describes how to configure the Local Print Agent, how it interfaces with the POS system, and how to package and onboard new hotels.

---

## 1. Quick Local Testing

### Step 1: Install Dependencies
Open a terminal in the `Agent` folder and run:
```powershell
npm.cmd install
```
*(Note: Always use `.cmd` on Windows PowerShell to bypass execution policy restrictions).*

### Step 2: Run the Agent
Start the server in development mode:
```powershell
node src/index.js
```
The agent starts a dashboard on **[http://localhost:4001](http://localhost:4001)**.

### Step 3: Trigger a Test Print
1. Open the dashboard at `http://localhost:4001`.
2. Click **"Test Kitchen Print"** or **"Test Bill Print"** to verify that the formatter formats the payloads correctly and the local printer manager registers the print job.

---

## 2. Onboarding a New Hotel (Step-by-Step)

### Step A: Configure Hotel in POS Owner Panel
1. Log in as the **Hotel Owner**.
2. Go to **Profile Settings** and change the print option to **Agent** mode, then click **Save**.
3. Note the unique **Hotel ID** displayed at the top of the owner dashboard (e.g. `Hotel ID: 7`).

### Step B: Compile the Executable EXE
Since hotel staff cannot install Node.js, you compile the agent into a single binary EXE file:
1. In the `Agent` folder, run:
   ```powershell
   npm.cmd run package
   ```
2. Retrieve the generated **`BestBillAgent.exe`** file from the `Agent/dist/` folder.

### Step C: Deploy on Hotel PC
1. Copy **`BestBillAgent.exe`** and a default template **`config.json`** to the hotel PC.
2. Double-click the EXE to start it.
3. Open `http://localhost:4001` in the local web browser.
4. Input the hotel-specific configuration:
   * **Hotel ID**: Enter the hotel's ID (e.g., `7`).
   * **API Gateway Endpoint**: Enter your backend URL.
     * *Production:* `https://bestbill-backend-174132084209.us-central1.run.app`
     * *Local Testing:* `http://localhost:8080`
   * **Printers**: Select printer type (Network LAN or Windows Shared USB) and fill in the parameters (see below).
5. Click **"Save Configuration & Reload"**. The app automatically saves these settings directly to `config.json` and connects to the server!

---

## 3. Printer Connection Specifications

### Type 1: LAN / Network Thermal Printers
Select this when the printer is connected directly to the router via Ethernet or WiFi.
1. **Type**: `Network (LAN)`
2. **Printer IP Address**: Enter the local IP (e.g. `192.168.1.150`).
3. **Port**: `9100` (standard raw port).

### Type 2: USB Thermal Printers (Windows Sharing)
Select this when the printer is plugged directly into the computer's USB port.
1. In Windows, go to **Printers & Scanners**, click on your thermal printer, and select **Properties**.
2. Go to the **Sharing** tab, enable **"Share this printer"**, and give it a short network share name (e.g., `kitchen`).
3. In the Agent UI, select **Type**: `Windows Shared` and set the path as `\\localhost\kitchen` or `\\127.0.0.1\kitchen`.
