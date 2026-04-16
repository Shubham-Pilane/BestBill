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
  const ALIGN_LEFT = ESC + '\x61\x00';
  const ALIGN_CENTER = ESC + '\x61\x01';
  const ALIGN_RIGHT = ESC + '\x61\x02';
  const BOLD_ON = ESC + '\x45\x01';
  const BOLD_OFF = ESC + '\x45\x00';
  const CUT = GS + '\x56\x00'; 
  
  const LINE_WIDTH = 42; // Width optimized for 80mm printers
  const divider = '-'.repeat(LINE_WIDTH) + '\n';
  
  let escpos = '';
  
  // Header
  escpos += ALIGN_CENTER + BOLD_ON + hName.toUpperCase() + '\n' + BOLD_OFF;
  if (hLocation) escpos += hLocation + '\n';
  if (hPhone) escpos += 'Ph: ' + hPhone + '\n';
  escpos += divider;
  escpos += BOLD_ON + 'INVOICE\n' + BOLD_OFF;
  escpos += divider;
  
  escpos += ALIGN_LEFT;
  if (tableStr) escpos += `Table: ${tableStr}\n`;
  escpos += `Bill No: #${billData.id}\n`;
  
  let dateStr = new Date(billData.created_at || Date.now()).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
  escpos += `Date: ${dateStr}\n`;
  escpos += divider;
  
  // Item Columns
  const ITEM_LEN = 20;
  const PRC_LEN = 8;
  const QTY_LEN = 4;
  const TOT_LEN = 8;
  
  escpos += padText('ITEM', ITEM_LEN) + ' ' +
            padText('PRICE', PRC_LEN, 'right') + ' ' + 
            padText('QTY', QTY_LEN, 'right') + ' ' + 
            padText('TOTAL', TOT_LEN, 'right') + '\n';
  escpos += divider;

  // Add Room Charge if exists
  if (billData.room_charge > 0) {
    const rDays = billData.booking_days || 1;
    escpos += padText('Room Rent', ITEM_LEN) + ' ' +
              padText(Math.round(billData.room_charge / rDays), PRC_LEN, 'right') + ' ' + 
              padText(rDays, QTY_LEN, 'right') + ' ' + 
              padText(Math.round(billData.room_charge), TOT_LEN, 'right') + '\n';
  }
  
  // Items
  (billData.items || []).forEach(i => {
    let name = i.name;
    if (name.length > ITEM_LEN) name = name.substring(0, ITEM_LEN - 2) + '..';
    
    escpos += padText(name, ITEM_LEN) + ' ' +
              padText(Math.round(i.price), PRC_LEN, 'right') + ' ' + 
              padText(i.quantity, QTY_LEN, 'right') + ' ' + 
              padText(Math.round(i.price * i.quantity), TOT_LEN, 'right') + '\n';
  });
  
  escpos += divider;
  escpos += ALIGN_RIGHT;
  
  escpos += padText('Subtotal: ', 20, 'right') + padText(Math.round(billData.subtotal), 10, 'right') + '\n';
  if (billData.gst > 0) {
    escpos += padText(`GST (${billData.gst_percentage}%): `, 20, 'right') + padText(Math.round(billData.gst), 10, 'right') + '\n';
  }
  
  if (billData.discount_percentage > 0) {
    const discAmt = (parseFloat(billData.subtotal) + parseFloat(billData.gst)) * (billData.discount_percentage / 100);
    escpos += padText(`Disc (${billData.discount_percentage}%): `, 20, 'right') + padText('-' + Math.round(discAmt), 10, 'right') + '\n';
  }
  
  escpos += divider;
  escpos += BOLD_ON + ALIGN_RIGHT + 'TOTAL: Rs ' + Math.round(billData.final_amount) + '\n' + BOLD_OFF;
  escpos += divider;
  
  escpos += ALIGN_CENTER + '\nThank You! Visit Again!\n';
  if (!billData.is_paid && user?.upi_id) {
     escpos += '\n[Please Scan QR Display To Pay via UPI]\n'; 
  }
  
  escpos += '\n\n\n\n\n';
  escpos += CUT;
  
  return escpos;
};

export const printBillViaQZ = async (printerName, escposString) => {
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
    const data = [{
      type: 'raw',
      format: 'plain',
      data: escposString
    }];

    await qz.print(config, data);
    toast.success('Print job dispatched to thermal printer!');
  } catch (err) {
    console.error('Print error:', err);
    toast.error('Failed to print: ' + err.message);
  }
};
