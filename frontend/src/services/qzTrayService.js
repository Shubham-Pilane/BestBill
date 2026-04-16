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
  const printerSize = user?.printer_size || '80mm';
  const is58mm = printerSize === '58mm';
  const LINE_WIDTH = is58mm ? 30 : 42;  // Shrink internal width to compensate for offset
  const mg = is58mm ? '  ' : ''; // 2 explicit spaces of physical offset
  const divider = mg + '-'.repeat(LINE_WIDTH) + '\n';
  
  let escpos = INIT + ALIGN_LEFT;
  
  // Header (Manually centered inside the padded canvas to stay consistent)
  escpos += BOLD_ON + mg + padText(hName.toUpperCase(), LINE_WIDTH, 'center') + '\n' + BOLD_OFF;
  if (hLocation) escpos += mg + padText(hLocation, LINE_WIDTH, 'center') + '\n';
  if (hPhone) escpos += mg + padText('Ph: ' + hPhone, LINE_WIDTH, 'center') + '\n';
  escpos += divider;
  escpos += BOLD_ON + mg + padText('INVOICE', LINE_WIDTH, 'center') + '\n' + BOLD_OFF;
  escpos += divider;
  
  if (tableStr) {
      let tStr = '';
      if (tableStr.toLowerCase().includes('room') || tableStr.toLowerCase().includes('parcel')) {
          tStr = tableStr;
      } else {
          tStr = `Table: ${tableStr}`;
      }
      escpos += mg + padText(tStr, LINE_WIDTH) + '\n';
  }
  
  escpos += mg + padText(`Bill No: #${billData.id || ''}`, LINE_WIDTH) + '\n';
  
  const d = new Date();
  const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
                  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  escpos += mg + padText(`Date: ${dateStr}`, LINE_WIDTH) + '\n';
  escpos += divider;
  
  const ACTUAL_ITEM_LEN = is58mm ? 14 : 19;
  const PRC_LEN = is58mm ? 6 : 8;
  const QTY_LEN = is58mm ? 2 : 4;
  const TOT_LEN = is58mm ? 5 : 8;
  
  escpos += mg + padText('ITEM', ACTUAL_ITEM_LEN) + ' ' +
            padText('PRICE', PRC_LEN, 'right') + ' ' + 
            padText('QTY', QTY_LEN, 'right') + ' ' + 
            padText('TOTAL', TOT_LEN, 'right') + '\n';
  escpos += divider;

  if (billData.room_charge > 0) {
    const rDays = billData.booking_days || 1;
    escpos += mg + padText('Room Rent', ACTUAL_ITEM_LEN) + ' ' +
              padText(Math.round(billData.room_charge / rDays), PRC_LEN, 'right') + ' ' + 
              padText(rDays, QTY_LEN, 'right') + ' ' + 
              padText(Math.round(billData.room_charge), TOT_LEN, 'right') + '\n';
  }
  
  (billData.items || []).forEach(i => {
    let name = i.name;
    if (name.length > ACTUAL_ITEM_LEN) name = name.substring(0, ACTUAL_ITEM_LEN - 2) + '..';
    
    escpos += mg + padText(name, ACTUAL_ITEM_LEN) + ' ' +
              padText(Math.round(i.price), PRC_LEN, 'right') + ' ' + 
              padText(i.quantity, QTY_LEN, 'right') + ' ' + 
              padText(Math.round(i.price * i.quantity), TOT_LEN, 'right') + '\n';
  });
  
  escpos += divider;
  
  if (billData.gst > 0) {
    escpos += mg + padText(`GST (${billData.gst_percentage}%):`, LINE_WIDTH - TOT_LEN, 'right') + padText(Math.round(billData.gst), TOT_LEN, 'right') + '\n';
  }
  
  if (billData.discount_percentage > 0) {
    const discAmt = (parseFloat(billData.subtotal) + parseFloat(billData.gst)) * (billData.discount_percentage / 100);
    escpos += mg + padText(`Disc (${billData.discount_percentage}%):`, LINE_WIDTH - TOT_LEN, 'right') + padText('-' + Math.round(discAmt), TOT_LEN, 'right') + '\n';
  }
  
  escpos += divider;
  
  const totalText = 'TOTAL: Rs ' + Math.round(billData.final_amount);
  escpos += BOLD_ON + mg + padText(totalText, LINE_WIDTH, 'right') + '\n' + BOLD_OFF;
  escpos += divider;
  
  escpos += mg + padText('Thank You! Visit Again!', LINE_WIDTH, 'center') + '\n';

  const printJob = [
    escpos
  ];

  if (!billData.is_paid && user?.upi_id) {
     const qrCanvas = document.getElementById('upi-qr-canvas') || document.getElementById('history-qr-canvas');
     if (qrCanvas) {
         try {
             // Let QZ Tray center the image natively
             printJob.push(ALIGN_CENTER);
             printJob.push('\n[Scan to Pay via UPI]\n');
             const b64 = qrCanvas.toDataURL('image/png').split(',')[1];
             printJob.push({ 
                 type: 'raw', 
                 format: 'image', 
                 flavor: 'base64', 
                 data: b64, 
                 options: { language: 'ESCPOS', dotDensity: 'double' } 
             });
             printJob.push('\n');
             printJob.push(ALIGN_LEFT);
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
