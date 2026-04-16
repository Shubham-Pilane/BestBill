import qz from 'qz-tray';
import { toast } from 'react-hot-toast';

if (typeof window !== 'undefined' && window.WebSocket) {
    qz.api.setPromiseType((resolver) => new Promise(resolver));
    qz.api.setWebSocketType(window.WebSocket);
}

export const connectQZ = async () => {
  if (qz.websocket.isActive()) return true;
  try {
    await qz.websocket.connect({ retries: 2, delay: 1 });
    return true;
  } catch (err) {
    console.error("QZ Connection Error:", err);
    toast.error("Could not connect to QZ Tray. Please ensure it is running.");
    return false;
  }
};

export const getPrinters = async () => {
  try {
    const isConn = await connectQZ();
    if (!isConn) return [];
    return await qz.printers.find();
  } catch (err) {
    console.error("Fetch Printers Error:", err);
    toast.error("Error fetching printers: " + err.message);
    return [];
  }
};

export const setSelectedPrinter = (printerName) => {
  localStorage.setItem('qz_selected_printer', printerName);
};

export const getSelectedPrinter = () => {
  return localStorage.getItem('qz_selected_printer');
};

const padText = (text, length, align = 'left') => {
  text = String(text !== undefined && text !== null ? text : '');
  if (text.length > length) {
    return text.substring(0, length);
  }
  if (align === 'right') return text.padStart(length, ' ');
  if (align === 'center') {
    const pad = Math.floor((length - text.length) / 2);
    return ' '.repeat(pad) + text + ' '.repeat(length - text.length - pad);
  }
  return text.padEnd(length, ' ');
};

export const generateEscposBill = (billData, user, tableStr = '') => {
  const hName = billData.hotel_name || user?.hotel_name || 'BESTILL';
  const hLocation = billData.hotel_location || user?.hotel_location || '';
  const hPhone = billData.hotel_phone || user?.hotel_phone || '';
  
  // RAW ESC/POS commands
  const ESC = '\x1B';
  const GS = '\x1D';
  const INIT = ESC + '\x40'; // Initialize printer (fixes top margin issue)
  const ALIGN_LEFT = ESC + '\x61\x00';
  const ALIGN_CENTER = ESC + '\x61\x01';
  const ALIGN_RIGHT = ESC + '\x61\x02';
  const BOLD_ON = ESC + '\x45\x01';
  const BOLD_OFF = ESC + '\x45\x00';
  const CUT = GS + '\x56\x00'; 
  
  const printerSize = user?.printer_size || '80mm';
  const is58mm = printerSize === '58mm';
  const LINE_WIDTH = is58mm ? 32 : 42; 
  const divider = '-'.repeat(LINE_WIDTH) + '\n';
  
  let escpos = INIT;
  
  // Header
  escpos += ALIGN_CENTER + BOLD_ON + hName.toUpperCase() + '\n' + BOLD_OFF;
  if (hLocation) escpos += hLocation + '\n';
  if (hPhone) escpos += 'Ph: ' + hPhone + '\n';
  escpos += divider;
  escpos += BOLD_ON + 'INVOICE\n' + BOLD_OFF;
  escpos += divider;
  
  if (tableStr) {
      let tStr = '';
      if (tableStr.toLowerCase().includes('room') || tableStr.toLowerCase().includes('parcel')) {
          tStr = tableStr;
      } else {
          tStr = `Table: ${tableStr}`;
      }
      escpos += padText(tStr, LINE_WIDTH) + '\n';
  }
  
  escpos += padText(`Bill No: #${billData.id || ''}`, LINE_WIDTH) + '\n';
  
  // Format Date to unambiguous DD/MM/YYYY explicitly
  const d = new Date(); // Use current print time just like previous logic
  const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
                  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  escpos += padText(`Date: ${dateStr}`, LINE_WIDTH) + '\n';
  escpos += divider;
  
  // Item Columns mathematically aligned
  const ACTUAL_ITEM_LEN = is58mm ? 15 : 19;
  const PRC_LEN = is58mm ? 5 : 8;
  const QTY_LEN = is58mm ? 2 : 4;
  const TOT_LEN = is58mm ? 6 : 8;
  
  // No need for ALIGN_LEFT anymore because every line is manually padded to exactly LINE_WIDTH
  // and the printer forces that 32/42 char block into the physical center of the printhead!
  
  escpos += padText('ITEM', ACTUAL_ITEM_LEN) + ' ' +
            padText('PRICE', PRC_LEN, 'right') + ' ' + 
            padText('QTY', QTY_LEN, 'right') + ' ' + 
            padText('TOTAL', TOT_LEN, 'right') + '\n';
  escpos += divider;

  // Add Room Charge if exists
  if (billData.room_charge > 0) {
    const rDays = billData.booking_days || 1;
    escpos += padText('Room Rent', ACTUAL_ITEM_LEN) + ' ' +
              padText(Math.round(billData.room_charge / rDays), PRC_LEN, 'right') + ' ' + 
              padText(rDays, QTY_LEN, 'right') + ' ' + 
              padText(Math.round(billData.room_charge), TOT_LEN, 'right') + '\n';
  }
  
  // Items
  (billData.items || []).forEach(i => {
    let name = i.name;
    if (name.length > ACTUAL_ITEM_LEN) name = name.substring(0, ACTUAL_ITEM_LEN - 2) + '..';
    
    escpos += padText(name, ACTUAL_ITEM_LEN) + ' ' +
              padText(Math.round(i.price), PRC_LEN, 'right') + ' ' + 
              padText(i.quantity, QTY_LEN, 'right') + ' ' + 
              padText(Math.round(i.price * i.quantity), TOT_LEN, 'right') + '\n';
  });
  
  escpos += divider;
  
  // Align GST and Discount to right column nicely
  if (billData.gst > 0) {
    escpos += padText(`GST (${billData.gst_percentage}%):`, LINE_WIDTH - TOT_LEN, 'right') + padText(Math.round(billData.gst), TOT_LEN, 'right') + '\n';
  }
  
  if (billData.discount_percentage > 0) {
    const discAmt = (parseFloat(billData.subtotal) + parseFloat(billData.gst)) * (billData.discount_percentage / 100);
    escpos += padText(`Disc (${billData.discount_percentage}%):`, LINE_WIDTH - TOT_LEN, 'right') + padText('-' + Math.round(discAmt), TOT_LEN, 'right') + '\n';
  }
  
  escpos += divider;
  
  // Format TOTAL to exactly align to the far right edges
  const totalText = 'TOTAL: Rs ' + Math.round(billData.final_amount);
  // Add space padding on the left to perfectly fit LINE_WIDTH inside a BOLD block
  escpos += BOLD_ON + padText(totalText, LINE_WIDTH, 'right') + '\n' + BOLD_OFF;
  escpos += divider;
  
  escpos += '\nThank You! Visit Again!\n';

  // Build the print payload array so we can mix text and images dynamically
  const printJob = [
    escpos
  ];

  // Safely inject QR code if UPI applies and QR canvas is accessible in the DOM
  if (!billData.is_paid && user?.upi_id) {
     const qrCanvas = document.getElementById('upi-qr-canvas') || document.getElementById('history-qr-canvas');
     if (qrCanvas) {
         try {
             printJob.push('\n[Scan to Pay via UPI]\n');
             const b64 = qrCanvas.toDataURL('image/png').split(',')[1];
             printJob.push({ 
                 type: 'raw', 
                 format: 'image', 
                 flavor: 'base64', 
                 data: b64, 
                 options: { language: 'ESCPOS', dotDensity: is58mm ? 'single' : 'double' } 
             });
             printJob.push('\n');
         } catch (e) {
             printJob.push('\n[Please Scan QR Display To Pay via UPI]\n');
         }
     } else {
         printJob.push('\n[Please Scan QR Display To Pay via UPI]\n');
     }
  }

  printJob.push('\n\n\n\n\n' + CUT);
  
  return printJob;
};

export const printBillViaQZ = async (printerName, printJobArray) => {
  try {
    const isConn = await connectQZ();
    if (!isConn) return;

    if (!printerName) {
       const defPrinter = await qz.printers.getDefault();
       if (defPrinter) {
           printerName = defPrinter;
       } else {
           const printers = await qz.printers.find();
           if (printers.length === 0) {
              toast.error("No printers found on this system.");
              return;
           }
           printerName = printers[0]; // Fallback
       }
       setSelectedPrinter(printerName);
    }

    const config = qz.configs.create(printerName);
    await qz.print(config, printJobArray);
    toast.success('Print job dispatched to thermal printer!');
  } catch (err) {
    console.error('Print error:', err);
    toast.error('Failed to print: ' + err.message);
  }
};
