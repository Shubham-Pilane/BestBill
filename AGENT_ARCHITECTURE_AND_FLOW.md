# BestBill POS - Print Agent Architecture & Flow Specifications

This document outlines the codebase design, modular architecture, and message flow of the Local Print Agent for developers to maintain and update the agent in the future.

---

## 1. Directory & Component Design

The agent is organized into clean, modular layers to isolate the connection layer, parsing layer, and hardware output drivers:

* **`src/index.js`**: Core bootstrapper. Configures Windows auto-startup, starts the socket client, and launches the dashboard web server.
* **`src/config/configManager.js`**: Handles dynamic filesystem read/write operations for `config.json`. Exposes helpers to update configurations at runtime without restarting the process.
* **`src/socket/socketClient.js`**: Employs `socket.io-client` to keep a persistent WebSocket connection to the cloud backend.
  * Listens to the `print-job` event.
  * Checks the job type (`KOT` or `FINAL_BILL`) and hands the payload to the formatter.
  * Dispatches formatted buffers to the queue processor in `printerManager.js`.
* **`src/services/printFormatter.js`**: A pure-JS layout builder that maps JSON order metadata to binary ESC/POS formatting commands (e.g., centering, text size, margins, line cuts). Does not rely on any native OS-specific printer drivers.
* **`src/printers/printerManager.js`**: Manages print job execution.
  * **Queue**: Serializes print jobs in memory to prevent multiple print threads from overlapping.
  * **Network Driver**: Connects to network printers using raw Node `net` TCP sockets on Port 9100.
  * **USB/Local Driver**: Writes ESC/POS commands to a temporary file and shells out a Windows `copy /b <tempfile> "<shared-printer-name>"` command. This is highly portable and has zero native compiler dependencies.
  * **Retry Loop**: Retries failing print jobs up to 3 times before abandoning, allowing printers time to go back online or reload paper.
* **`src/services/localWebServer.js` & `src/public/index.html`**: A lightweight local Express server running on port `4001` that provides configuration panels, connection health status lights, recent log viewers, and test triggers.
* **`src/utils/logger.js`**: Winston-based logging utility writing rotating files into the `logs/` directory.
* **`src/utils/startup.js`**: Configures auto-run behavior on Windows boot by modifying the `CurrentVersion\Run` Registry Key.

---

## 2. End-to-End Print Flow

```
1. Client Action (Waiter / Owner)
   ├── Waiter clicks "Send to Kitchen" (triggers POST /api/tables/:id/order/kot)
   └── Owner clicks "Print Bill" (triggers POST /api/tables/:id/bill)
                   │
                   ▼
2. Backend Controller (tables.js or rooms.js)
   ├── Verifies hotel's billing_method is set to 'agent'
   └── Calls printService.sendKOT() or printService.sendFinalBill()
                   │
                   ▼
3. Print Service (backend/src/services/printService.js)
   ├── Formats KOT ({ table, waiter, items: [{ name, qty }], notes })
   ├── Formats Bill ({ hotelName, hotelPhone, hotelLocation, billId, table, subtotal, gst, finalAmount, discountPercentage, items })
   └── Emits 'print-job' payload to the Room: `hotel-<id>` via Socket.IO
                   │
                   ▼
4. Local Print Agent (socketClient.js)
   ├── Receives 'print-job' event from Socket.IO
   └── Translates order payload to ESC/POS binary buffer via printFormatter.js
                   │
                   ▼
5. Local Printer Dispatch (printerManager.js)
   ├── Adds binary payload to the print queue
   ├── Opens socket (Type: network) OR writes temp file & copies to share (Type: usb)
   └── Printer executes print commands and cuts the paper
```

---

## 3. Formatting Parameters & Data Mapping

When receiving print jobs from Socket.IO, fields are mapped as follows:

### Kitchen Order Ticket (KOT)
* **`table`** (String): Table number/name (e.g. `2`) or Room name (e.g. `Room 101`).
* **`waiter`** (String): Name of the waiter who placed the order.
* **`notes`** (String): Additional cooking instructions.
* **`items`** (Array): List of items containing `name` and `qty` (quantity).

### Final Bill
* **`hotelName`**, **`hotelPhone`**, **`hotelLocation`** (Strings): Header descriptors.
* **`billId`** (Number): Unique invoice number.
* **`table`** (String): Table/room identifier.
* **`subtotal`** (Number): Food and stay charge sum.
* **`discountPercentage`** / **`discount`** (Numbers): Deductions.
* **`gst`** (Number): Tax amount.
* **`finalAmount`** / **`total`** (Number): The final amount to be paid.
* **`items`** (Array): List of food/room charges containing `name`, `price`, and `qty`.
